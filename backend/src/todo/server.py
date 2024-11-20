import google.generativeai as genai
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List
import PyPDF2
import openpyxl
import io

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
            full_prompt = f"{prompt}\n\nContext:\n{text}"
            response = model.generate_content(full_prompt)
            analysis_results[section] = response.text
        except Exception as e:
            analysis_results[section] = f"Error analyzing {section}: {str(e)}"
    
    return analysis_results

@app.post("/api/analyze")
async def analyze_files(files: List[UploadFile] = File(...)):
    analyzed_data = []

    for file in files:
        content = await file.read()
        file_extension = file.filename.split('.')[-1].lower()
        extracted_text = ""

        if file_extension == "pdf":
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                extracted_text = " ".join(page.extract_text() or "" for page in pdf_reader.pages)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error reading PDF {file.filename}: {str(e)}")

        elif file_extension == "xlsx":
            try:
                workbook = openpyxl.load_workbook(io.BytesIO(content))
                sheet = workbook.active
                extracted_text = "\n".join(" ".join(str(cell.value) for cell in row) for row in sheet.iter_rows())
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error reading Excel file {file.filename}: {str(e)}")

        if extracted_text:
            analysis = await analyze_with_gemini(extracted_text)
            analyzed_data.append({
                "filename": file.filename,
                "analysis": analysis
            })

    return {"message": "Analysis complete", "data": analyzed_data}