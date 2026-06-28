from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from ranker import rank_candidates, initialize

# Base directory of backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    initialize()


@app.get("/")
def home():
    return {"message": "AI Recruiter API Running"}


@app.post("/rank")
async def rank(file: UploadFile = File(...)):
    # Save uploaded JD inside backend folder
    path = os.path.join(BASE_DIR, "uploaded_jd.docx")

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = rank_candidates(path)

    return {
        "total": len(results),
        "results": results
    }