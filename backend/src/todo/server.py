import google.generativeai as genai
import os
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, status
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import bcrypt
from typing import List
import PyPDF2
import openpyxl
import io
import asyncio
from functools import partial
from pydantic import BaseModel, EmailStr
from beanie import Document, init_beanie

DEBUG = os.environ.get("DEBUG", "").strip().lower() in {"1", "true", "on", "yes"}
MONGODB_URI = os.environ["MONGODB_URI"]

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash-latest')

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGODB_URI)
    database = client.get_default_database()

    pong = await database.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("Cluster connection is not okay!")

    await init_beanie(database=database, document_models=[User])
    app.gemini_model = model
    
    yield

    client.close()

app = FastAPI(lifespan=lifespan, debug=DEBUG)

class User(Document):
    email: str
    password: str

    class Settings:
        name = "users"

class UserCredentials(BaseModel):
    email: str
    password: str

@app.post("/api/auth/signup")
async def signup(user: UserCredentials):
    existing_user = await User.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)
    new_user = User(email=user.email, password=hashed_password.decode('utf-8'))
    await new_user.save()
    
    return {"message": "User created successfully"}

@app.post("/api/auth/login")
async def login(user: UserCredentials):
    db_user = await User.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"email": db_user.email}

def process_pdf(content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        return " ".join(page.extract_text() or "" for page in pdf_reader.pages)
    except Exception as e:
        print(f"Error in PDF processing: {str(e)}")
        raise

def process_excel(content: bytes) -> str:
    try:
        workbook = openpyxl.load_workbook(io.BytesIO(content))
        sheet = workbook.active
        return "\n".join(" ".join(str(cell.value or "") for cell in row) for row in sheet.iter_rows())
    except Exception as e:
        print(f"Error in Excel processing: {str(e)}")
        raise

async def analyze_with_gemini(text: str):
    sections = {
        "Revenue Analysis": """Analyze revenue trends including:
            Total revenue and growth rates
            Segment-wise revenue breakdown
            Geographic revenue distribution
            Key revenue drivers""",
            
        "Expense Analysis": """Analyze expense patterns including:
            Operating expenses breakdown
            Cost of revenue trends
            R&D investments
            Sales and marketing spend""",
            
        "Profitability Metrics": """Extract key profitability metrics including:
            Operating margin
            Net profit margin
            EBITDA
            EPS and growth""",
            
        "Cash Flow Analysis": """Analyze cash flows including:
            Operating cash flow
            Free cash flow
            Capital expenditure
            Cash position""",
            
        "Insights and Recommendations": """Provide strategic insights including:
            Key performance highlights
            Risk factors
            Growth opportunities
            Strategic recommendations"""
    }

    analysis_results = {}
    
    for section, prompt in sections.items():
        try:
            print(f"Analyzing section: {section}")
            full_prompt = f"Analyze the following financial data and provide clear insights in plain text format:\n\n{prompt}\n\nContext:\n{text}"
            
            try:
                async with asyncio.timeout(120):
                    print(f"Analyzing section: {section}")
                    full_prompt = f"{prompt}\n\nContext:\n{text}"
                    response = app.gemini_model.generate_content(full_prompt)
                    analysis_results[section] = response.text
                    print(f"Completed analysis for: {section}")
            except asyncio.TimeoutError:
                analysis_results[section] = "Analysis timed out for this section"
                
        except Exception as e:
            print(f"Error in section {section}: {str(e)}")
            analysis_results[section] = f"Error analyzing {section}: {str(e)}"
    
    return analysis_results

@app.post("/api/analyze")
async def analyze_files(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    print(f"Received {len(files)} files for analysis")
    combined_text = []

    for file in files:
        try:
            print(f"\nProcessing file: {file.filename}")
            content = await file.read()
            
            try:
                async with asyncio.timeout(300):
                    if file.filename.endswith('.pdf'):
                        extracted_text = await asyncio.to_thread(process_pdf, content)
                    elif file.filename.endswith('.xlsx'):
                        extracted_text = await asyncio.to_thread(process_excel, content)
                    else:
                        continue
                    
                    if extracted_text:
                        combined_text.append(f"Content from {file.filename}:\n{extracted_text}")

            except asyncio.TimeoutError:
                print(f"Timeout processing {file.filename}")
                raise HTTPException(status_code=504, detail=f"Analysis timed out for {file.filename}")

        except Exception as e:
            print(f"Error processing {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    all_content = "\n\n=== NEW DOCUMENT ===\n\n".join(combined_text)
    
    if all_content:
        print("Starting combined Gemini analysis")
        analysis = await analyze_with_gemini(all_content)
        return {
            "message": "Analysis complete", 
            "data": [{
                "filename": "Combined Analysis",
                "analysis": analysis
            }]
        }
    else:
        raise HTTPException(status_code=400, detail="No valid content found to analyze")

@app.get("/api/test")
async def test_endpoint():
    return {"status": "ok", "message": "Server is running"}