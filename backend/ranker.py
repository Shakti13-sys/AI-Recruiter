import os
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TRANSFORMERS_NO_FLAX"] = "1"
import json
import pandas as pd
from docx import Document
import numpy as np
from rank_bm25 import BM25Okapi
import torch
from sentence_transformers import SentenceTransformer
from sentence_transformers import CrossEncoder
import re
import faiss

# Make sure torch actually uses all CPU cores for encoding/reranking.
# Without this, on some Windows setups torch can default to very few
# threads, which makes encode()/predict() take minutes for even small batches.
try:
    torch.set_num_threads(max(1, os.cpu_count() or 1))
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = None
reranker = None
all_candidates = None
bm25 = None

# =====================
# FORMAT CANDIDATES (module-level so initialize() can use it too)
# =====================
def build_text(c):
    p = c["profile"]

    skills = p.get("skills", [])
    if isinstance(skills, list):
        skills = " ".join([s.lower() for s in skills if isinstance(s, str)])

    title = p.get("current_title", "")
    exp = p.get("total_experience", "")
    summary = p.get("summary", "")

    return (
        f"TITLE {title} TITLE "
        f"SKILLS {skills} SKILLS "
        f"EXPERIENCE {exp} YEARS EXPERIENCE "
        f"SUMMARY {summary}"
    )

# =====================
# LOAD DATA
# =====================
def initialize():

    global model
    global reranker
    global all_candidates
    global bm25

    if model is None:
        print("Loading SentenceTransformer...")
        model = SentenceTransformer("all-MiniLM-L6-v2")

    if reranker is None:
        print("Loading CrossEncoder...")
        reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

    if all_candidates is None:

        candidates_path = os.environ.get(
            "CANDIDATES_FILE",
            os.path.join(BASE_DIR, "candidates.jsonl")
        )
        print(f"Loading candidates from {candidates_path} ...")

        all_candidates = []

        with open(candidates_path, "r", encoding="utf-8") as f:
            for line in f:
                all_candidates.append(json.loads(line))

        print("Candidates loaded:", len(all_candidates))

    # Build the BM25 index ONCE, not on every /rank request.
    # With 100k+ candidates, rebuilding this every request is what
    # was causing the "timeout" / "Network Error" on the dashboard.
    if bm25 is None:
        print("Building BM25 index (one-time, may take a bit on first startup)...")

        tokenized_corpus = [build_text(c).lower().split() for c in all_candidates]

        bm25 = BM25Okapi(tokenized_corpus)
        del tokenized_corpus  # free memory, not needed after the index is built
        print("BM25 index ready")

def rank_candidates(job_description_path):
    initialize()

    candidates = all_candidates

    print("Candidates:", len(candidates))

# =====================
# READ JOB DESCRIPTION
# =====================

    def read_docx(path):
        doc = Document(path)
        return "\n".join([p.text for p in doc.paragraphs])

    job_description = read_docx(job_description_path)

# =====================
# BM25 SCORING (index already built once in initialize())
# =====================

    job_tokens = job_description.lower().replace("\n", " ").split()

    bm25_scores = np.array(bm25.get_scores(job_tokens))
    bm25_scores = (bm25_scores - bm25_scores.min()) / (bm25_scores.max() - bm25_scores.min() + 1e-9)

# shortlist
    BM25_TOP_K = 150
    FAISS_TOP_K = 80
    FINAL_TOP_K = 50

    top_idx = bm25_scores.argsort()[-BM25_TOP_K:]

    print("Candidates BEFORE filter:", len(candidates))

    print("Creating job embedding...")
    job_embedding = model.encode(job_description, normalize_embeddings=True)
    print("Job embedding done")

    candidates = [candidates[i] for i in top_idx]
    bm25_scores = bm25_scores[top_idx]

    candidate_texts = [build_text(c) for c in candidates]
    print("Candidates AFTER filter:", len(candidates))

    candidate_embeddings = model.encode(
        candidate_texts,
        batch_size=64,
        normalize_embeddings=True
    )

    dim = candidate_embeddings.shape[1]   

    index = faiss.IndexFlatIP(dim)        
    index.add(candidate_embeddings.astype("float32"))

    print("FAISS index built")

# =====================
# SKILL BOOST
# =====================

    job_skills = set(re.findall(r"\b(python|java|sql|docker|aws|ml|nlp|fastapi|react)\b", job_description.lower()))

    def skill_score(c):
        skills = c["profile"].get("skills", [])
        skills = set([s.lower() for s in skills if isinstance(s, str)])

        if not skills:
            return 0

        match = len(job_skills & skills)
        return match / (len(job_skills) + 1e-9)

    def recruiter_bonus(c):
        p = c["profile"]
        score = 0

        if p.get("current_title", "").lower() in job_description.lower():
            score += 0.2

        if p.get("summary"):
            score += 0.1

        if len(p.get("skills", [])) > 5:
            score += 0.1

        return score

#Experience Boost

    def exp_score(c):
        try:
            exp = float(c["profile"].get("total_experience", 0))
        except:
            exp = 0

        if exp <= 1:
            return 0.2
        elif exp <= 3:
            return 0.5
        elif exp <= 6:
            return 0.8
        else:
            return 1.0

#Similarity Score

    filtered_candidates = candidates
    filtered_bm25 = bm25_scores

    faiss_scores, faiss_idx = index.search(
        np.array([job_embedding], dtype="float32"),
        FAISS_TOP_K
    )

    semantic_scores = faiss_scores[0]
    faiss_idx = faiss_idx[0]

    candidates = [filtered_candidates[i] for i in faiss_idx]
    bm25_scores = filtered_bm25[faiss_idx]

    pairs = [(job_description, build_text(c)) for c in candidates]

    print("Running reranker...")

    rerank_scores = reranker.predict(
        pairs[:200],
        batch_size=32,
        show_progress_bar=True
    )

    rerank_scores = np.array(rerank_scores)
    rerank_scores = (rerank_scores - rerank_scores.min()) / (rerank_scores.max() - rerank_scores.min() + 1e-9)

# =====================
# SCORING
# =====================

    results = []

    skill = np.array([skill_score(c) for c in candidates])
    exp = np.array([exp_score(c) for c in candidates])

    def title_score(c):
        title = c["profile"].get("current_title","").lower()

        if "engineer" in title:
            return 1.0
        if "developer" in title:
            return 0.9
        if "manager" in title:
            return 0.7
        return 0.4

    def explain(c, bm25, sem, skill, exp, title):
        reasons = []

        if sem > 0.75:
            reasons.append("Strong semantic alignment with job role")

        if skill > 0.5:
            reasons.append("Matching technical skill set")

        if exp > 0.7:
            reasons.append("Sufficient industry experience")

        if title > 0.8:
            reasons.append("Relevant job title alignment")

        if bm25 > 0.7:
            reasons.append("Keyword overlap with job description")

        return reasons

    title = np.array([title_score(c) for c in candidates])

    scores = (
        0.30 * semantic_scores +
        0.25 * rerank_scores +
        0.15 * skill +
        0.15 * exp +
        0.10 * bm25_scores +
        0.05 * title
    )
    scores = scores + 0.1 * np.array([recruiter_bonus(c) for c in candidates])
    scores = np.clip(scores, 0, 1)

    for i, c in enumerate(candidates):
        results.append({
            "candidate_id": c.get("candidate_id"),
            "score": float(scores[i]),
            "reasons": explain(
                c,
                bm25_scores[i],
                semantic_scores[i],
                skill[i],
                exp[i],
                title[i]
            )
        })
    
# =====================
# RANKING
# =====================

    results = sorted(results, key=lambda x: x["score"], reverse=True)[:FINAL_TOP_K]

# =====================
# SUBMISSION
# =====================

    submission = []

    for rank, r in enumerate(results, 1):
        submission.append({
            "candidate_id": r["candidate_id"],
            "rank": rank,
            "score": r["score"],
            "reasons": r["reasons"]
        })

    df = pd.DataFrame(submission)

    df.to_csv(os.path.join(BASE_DIR, "submission.csv"), index=False)

    print("DONE → submission.csv created")

    with open(os.path.join(BASE_DIR, "submission.json"), "w") as f:
        json.dump(results, f, indent=2)

    return results
