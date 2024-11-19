from contextlib import asynccontextmanager
import os

from fastapi import FastAPI, status
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from fastapi import UploadFile, File, HTTPException
from typing import List
import PyPDF2
import openpyxl
import io
import google.generativeai as genai

from .dal_beanie import get_instance, ListSummary, ToDoList

## Uncomment this line to use motor directly, instead of via Beanie ODM:
# from .dal_motor import get_instance, ListSummary, ToDoList

DEBUG = os.environ.get("DEBUG", "").strip().lower() in {"1", "true", "on", "yes"}
MONGODB_URI = os.environ["MONGODB_URI"]
# GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
# genai.configure(api_key="AIzaSyDFO7dyRR-fX2s5q8KXyS-4XxAFKUSublw")
os.environ["API_KEY"] = 'AIzaSyDFO7dyRR-fX2s5q8KXyS-4XxAFKUSublw'
genai.configure(api_key=os.environ["API_KEY"])
model = genai.GenerativeModel('models/gemini-1.5-flash-latest')


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(MONGODB_URI)
    database = client.get_default_database()

    pong = await database.command("ping")
    if int(pong["ok"]) != 1:
        raise Exception("Cluster connection is not okay!")

    app.todo_dal = await get_instance(database)

    yield

    client.close()


app = FastAPI(lifespan=lifespan, debug=DEBUG)


@app.get("/api/lists")
async def get_all_lists() -> list[ListSummary]:
    return [i async for i in app.todo_dal.list_todo_lists()]


class NewList(BaseModel):
    name: str


class NewListResponse(BaseModel):
    id: str
    name: str


@app.post("/api/lists", status_code=status.HTTP_201_CREATED)
async def create_todo_list(new_list: NewList) -> NewListResponse:
    return NewListResponse(
        id=str(await app.todo_dal.create_todo_list(new_list.name)),
        name=new_list.name,
    )


@app.get("/api/lists/{list_id}")
async def get_list(list_id: str) -> ToDoList:
    """Get a single to-do list"""
    return await app.todo_dal.get_todo_list(list_id)


@app.delete("/api/lists/{list_id}")
async def delete_list(list_id: str) -> bool:
    return await app.todo_dal.delete_todo_list(list_id)


class NewItem(BaseModel):
    label: str


class NewItemResponse(BaseModel):
    id: str
    label: str


@app.post(
    "/api/lists/{list_id}/items/",
    status_code=status.HTTP_201_CREATED,
)
async def create_item(list_id: str, new_item: NewItem) -> ToDoList:
    return await app.todo_dal.create_item(list_id, new_item.label)


@app.delete("/api/lists/{list_id}/items/{item_id}")
async def delete_item(list_id: str, item_id: str) -> ToDoList:
    return await app.todo_dal.delete_item(list_id, item_id)


class ToDoItemUpdate(BaseModel):
    item_id: str
    checked_state: bool


@app.patch("/api/lists/{list_id}/checked_state")
async def set_checked_state(list_id: str, update: ToDoItemUpdate) -> ToDoList:
    return await app.todo_dal.set_checked_state(
        list_id, update.item_id, update.checked_state
    )

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
        return {"message": "File analysis complete", "data": analyzed_data}


async def analyze_with_gemini(text: str):
    sections = {
        "Revenue Analysis": "Extract revenue trends, year-over-year comparisons, and significant growth details.",
        "Expense Analysis": "Identify expense categories, their amounts, and their year-over-year growth rates.",
        "Profitability Metrics": "Provide gross margin, operating margin, net income, and earnings per share.",
        "Cash Flow Analysis": "Summarize cash flow from operations, investments, and financing activities.",
        "Insights and Recommendations": "Provide key business insights and actionable recommendations based on the analysis."
    }

    api_results = {}

    for section, prompt in sections.items():
        full_prompt = f"{prompt}\n\nContext:\n{text}"
        try:
            response = model.generate_content(full_prompt)
            result = "".join(part.text for part in response.parts)
            api_results[section] = result.strip()
        except Exception as e:
            api_results[section] = f"Error: {str(e)}"

    return api_results