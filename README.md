# AI Recruiter

An AI-powered recruitment system that ranks candidates based on a Job Description using a hybrid information retrieval and semantic search pipeline.

## Features

- Upload Job Description (.docx)
- Candidate ranking using BM25 + Sentence Transformers + FAISS
- Cross-Encoder re-ranking for better accuracy
- Skill, experience, and title-based scoring
- FastAPI backend
- React frontend
- Returns Top 50 ranked candidates with scores and explanations

---

## Tech Stack

### Backend
- Python
- FastAPI
- Sentence Transformers
- CrossEncoder
- FAISS
- BM25
- Pandas
- NumPy

### Frontend
- React
- Vite

---

## Project Structure

```
AI-Recruiter/
│
├── backend/
│   ├── main.py
│   ├── ranker.py
│   ├── requirements.txt
│   ├── candidates.jsonl
│   └── validate_submission.py
│
├── frontend/
│
├── .gitignore
└── README.md
```

---

## Dataset

This project uses the `candidates.jsonl` dataset provided by the hackathon organizers.

Due to GitHub's 100 MB file size limit, the dataset is **not included** in this repository.

Please place the dataset in the following location before running the backend:

```text
backend/candidates.jsonl
```

## Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

API Documentation:

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Ranking Pipeline

1. Read Job Description (.docx)
2. BM25 retrieves top candidates
3. Sentence Transformer generates embeddings
4. FAISS performs semantic similarity search
5. CrossEncoder reranks shortlisted candidates
6. Additional scoring using:
   - Skills
   - Experience
   - Job Title
   - Recruiter Bonus
7. Return Top 50 ranked candidates

---

## Output

The API returns:

- Candidate ID
- Rank
- Final Score
- Matching Reasons

Example:

```json
{
  "candidate_id": "12345",
  "score": 0.91,
  "reasons": [
    "Strong semantic alignment with job role",
    "Matching technical skill set",
    "Relevant job title alignment"
  ]
}
```

---

## Future Improvements

- Resume parsing from PDF
- Advanced skill extraction using LLMs
- Multi-language support
- Interview recommendation system
- Candidate dashboard

---

## Author

Developed as an AI-powered recruitment and candidate ranking system using modern NLP and semantic search techniques.
