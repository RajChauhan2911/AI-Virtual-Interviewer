import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from services.auth import verify_firebase_token
from services.db import users_col, interviews_col, attempts_col
from services.ai import evaluate_answer, analyze_resume
from services.pdf_generator import generate_resume_analysis_pdf
from models.schemas import (
    Profile, InterviewStartRequest, InterviewStartResponse,
    AnswerRequest, AnswerResponse, FinishRequest, Report
)
from google.cloud.firestore import Client
from datetime import datetime
import uuid
import tempfile
from typing import Dict, Any

app = FastAPI(title="AI Interviewer API")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health")
def health():
    return {"ok": True}

# Convenience root
@app.get("/")
def root():
    return {
        "message": "AI Interviewer API running",
        "health": "/health",
        "docs": "/docs",
    }

# 1) Profile
@app.get("/api/profile")
def get_profile(user=Depends(verify_firebase_token)):
    uid = user["uid"]
    doc = users_col().document(uid).get()
    return doc.to_dict() or {}

@app.put("/api/profile")
def update_profile(body: Profile, user=Depends(verify_firebase_token)):
    uid = user["uid"]
    data = {k: v for k, v in body.dict().items() if v is not None}
    users_col().document(uid).set(data, merge=True)
    return {"ok": True}

# 2) Interview start
@app.post("/api/interview/start", response_model=InterviewStartResponse)
def start_interview(body: InterviewStartRequest, user=Depends(verify_firebase_token)):
    uid = user["uid"]
    interview_id = str(uuid.uuid4())
    first_question = f"Why do you want the role {body.role}?"
    interviews_col().document(interview_id).set({
        "userId": uid,
        "role": body.role,
        "difficulty": body.difficulty,
        "mode": body.mode,
        "createdAt": datetime.utcnow().isoformat(),
        "status": "active",
        "questionsAsked": [first_question],
        "scores": [],
    })
    return InterviewStartResponse(interview_id=interview_id, first_question=first_question)

# 3) Submit answer (evaluate)
@app.post("/api/interview/answer", response_model=AnswerResponse)
def submit_answer(body: AnswerRequest, user=Depends(verify_firebase_token)):
    uid = user["uid"]
    interview_ref = interviews_col().document(body.interview_id)
    interview = interview_ref.get()
    if not interview.exists or interview.to_dict().get("userId") != uid:
        raise HTTPException(status_code=404, detail="Interview not found")

    eval_result = evaluate_answer(interview.to_dict()["role"], body.question, body.answer)
    attempts_col().add({
        "interviewId": body.interview_id,
        "question": body.question,
        "answer": body.answer,
        "score": eval_result["score"],
        "components": eval_result["components"],
        "feedback": eval_result["feedback"],
        "createdAt": datetime.utcnow().isoformat(),
        "userId": uid,
    })

    # Naive flow control: ask up to 5 questions
    interview_data = interview.to_dict()
    asked = interview_data.get("questionsAsked", [])
    done = len(asked) >= 5
    next_q = None if done else f"Tell me about a challenge in {interview_data['role']}."

    interview_ref.update({
        "questionsAsked": asked + [body.question],
        "scores": interview_data.get("scores", []) + [eval_result["score"]],
    })

    return AnswerResponse(
        score=eval_result["score"],
        components=eval_result["components"],
        feedback=eval_result["feedback"],
        next_question=next_q,
        done=done,
    )

# 4) Finish interview (aggregate report)
@app.post("/api/interview/finish", response_model=Report)
def finish_interview(body: FinishRequest, user=Depends(verify_firebase_token)):
    uid = user["uid"]
    interview_ref = interviews_col().document(body.interview_id)
    interview = interview_ref.get()
    if not interview.exists or interview.to_dict().get("userId") != uid:
        raise HTTPException(status_code=404, detail="Interview not found")

    scores = interview.to_dict().get("scores", []) or [60]
    overall = round(sum(scores) / len(scores))
    components = {"technical": overall, "communication": max(50, overall - 5), "confidence": max(50, overall - 3)}

    report: Report = Report(
        interview_id=body.interview_id,
        score=overall,
        components=components,
        strengths=["Clear communication"],
        weaknesses=["Insufficient examples"],
        tips=["Use STAR format", "Quantify impact"],
    )

    interview_ref.update({"status": "finished", "report": report.dict()})
    return report

# 5) History endpoints
@app.get("/api/interview/list")
def list_interviews(user=Depends(verify_firebase_token)):
    uid = user["uid"]
    docs = interviews_col().where("userId", "==", uid).order_by("createdAt", direction="DESCENDING").stream()
    return [d.to_dict() | {"id": d.id} for d in docs]

@app.get("/api/interview/{interview_id}")
def get_interview(interview_id: str, user=Depends(verify_firebase_token)):
    uid = user["uid"]
    d = interviews_col().document(interview_id).get()
    if not d.exists or d.to_dict().get("userId") != uid:
        raise HTTPException(status_code=404, detail="Not found")
    return d.to_dict() | {"id": d.id}

# Resume Analysis endpoints
@app.post("/api/resume/analyze")
async def analyze_resume_endpoint(file: UploadFile = File(...)):
    """Analyze uploaded resume using AI - NO AUTH REQUIRED FOR TESTING"""
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Check file size (10MB limit)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 10MB")
    
    try:
        # Analyze resume using AI
        analysis_result = await analyze_resume(content, file.filename)
        
        # Generate a simple analysis ID
        analysis_id = str(uuid.uuid4())
        
        return {
            "analysisId": analysis_id,
            "analysis": analysis_result,
            "message": "Resume analyzed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/resume/analysis/{analysis_id}")
def get_resume_analysis(analysis_id: str, user=Depends(verify_firebase_token)):
    """Get specific resume analysis by ID"""
    uid = user["uid"]
    doc = users_col().document(uid).collection("resume_analyses").document(analysis_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return doc.to_dict()

@app.get("/api/resume/analyses")
def list_resume_analyses(user=Depends(verify_firebase_token)):
    """List all resume analyses for user"""
    uid = user["uid"]
    docs = users_col().document(uid).collection("resume_analyses").order_by("createdAt", direction="DESCENDING").stream()
    return [d.to_dict() | {"id": d.id} for d in docs]

@app.post("/api/resume/analysis/pdf")
async def download_resume_analysis_pdf(analysis: Dict[str, Any]):
    """Generate and download PDF from analysis data - NO AUTH REQUIRED"""
    try:
        # Generate PDF from provided analysis
        pdf_path = generate_resume_analysis_pdf(analysis, "resume.pdf")
        
        # Return PDF file
        return FileResponse(
            path=pdf_path,
            filename=f"resume-analysis-{datetime.utcnow().strftime('%Y%m%d')}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")