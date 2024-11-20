import google.generativeai as genai
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List
import PyPDF2
import openpyxl
import io
import asyncio
from functools import partial

app = FastAPI()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash-latest')

async def analyze_with_gemini(text: str):
    sections = {
        "Revenue Analysis": """Analyze revenue trends including:
            - Total revenue and growth rates
            - Segment-wise revenue breakdown
            - Geographic revenue distribution
            - Key revenue drivers""",
            
        "Expense Analysis": """Analyze expense patterns including:
            - Operating expenses breakdown
            - Cost of revenue trends
            - R&D investments
            - Sales and marketing spend""",
            
        "Profitability Metrics": """Extract key profitability metrics including:
            - Operating margin
            - Net profit margin
            - EBITDA
            - EPS and growth""",
            
        "Cash Flow Analysis": """Analyze cash flows including:
            - Operating cash flow
            - Free cash flow
            - Capital expenditure
            - Cash position""",
            
        "Insights and Recommendations": """Provide strategic insights including:
            - Key performance highlights
            - Risk factors
            - Growth opportunities
            - Strategic recommendations"""
    }

    analysis_results = {}
    
    for section, prompt in sections.items():
        try:
            print(f"Analyzing section: {section}")
            full_prompt = f"{prompt}\n\nContext:\n{text}"
            response = model.generate_content(full_prompt)
            analysis_results[section] = response.text
            print(f"Completed analysis for: {section}")
        except Exception as e:
            print(f"Error in section {section}: {str(e)}")
            analysis_results[section] = f"Error analyzing {section}: {str(e)}"
    
    return analysis_results

def process_pdf(content):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
    return " ".join(page.extract_text() or "" for page in pdf_reader.pages)

def process_excel(content):
    workbook = openpyxl.load_workbook(io.BytesIO(content))
    sheet = workbook.active
    return "\n".join(" ".join(str(cell.value) for cell in row) for row in sheet.iter_rows())

@app.post("/api/analyze")
async def analyze_files(files: List[UploadFile] = File(...)):
    analyzed_data = []
    print(f"Received {len(files)} files for analysis")

    for file in files:
        try:
            print(f"\nProcessing file: {file.filename}")
            content = await file.read()
            print(f"File content length: {len(content)} bytes")
            
            try:
                async with asyncio.timeout(240):
                    if file.filename.endswith('.pdf'):
                        print("Processing PDF file...")
                        extracted_text = await asyncio.to_thread(process_pdf, content)
                        print(f"Extracted {len(extracted_text)} characters from PDF")
                    elif file.filename.endswith('.xlsx'):
                        print("Processing Excel file...")
                        extracted_text = await asyncio.to_thread(process_excel, content)
                        print(f"Extracted {len(extracted_text)} characters from Excel")
                    else:
                        print(f"Unsupported file type: {file.filename}")
                        continue

                    if extracted_text:
                        print(f"Starting Gemini analysis for {file.filename}")
                        analysis = await analyze_with_gemini(extracted_text)
                        analyzed_data.append({
                            "filename": file.filename,
                            "analysis": analysis
                        })
                        print(f"Completed analysis for {file.filename}")

            except asyncio.TimeoutError:
                print(f"Timeout processing {file.filename}")
                raise HTTPException(status_code=504, detail=f"Analysis timed out for {file.filename}")

        except Exception as e:
            print(f"Error processing {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    print(f"\nAnalysis complete. Processed {len(analyzed_data)} files successfully")
    return {"message": "Analysis complete", "data": analyzed_data}

@app.get("/api/test")
async def test_endpoint():
    return {"status": "ok", "message": "Server is running"}