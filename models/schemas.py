from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class Profile(BaseModel):
    name: Optional[str] = None
    qualification: Optional[str] = None
    role: Optional[str] = None
    about: Optional[str] = None
    photo_url: Optional[str] = None
    resume_url: Optional[str] = None

class InterviewStartRequest(BaseModel):
    role: str
    difficulty: str
    mode: str  # "text" | "voice"

class InterviewStartResponse(BaseModel):
    interview_id: str
    first_question: str

class AnswerRequest(BaseModel):
    interview_id: str
    question: str
    answer: str

class AnswerResponse(BaseModel):
    score: int
    components: Dict[str, int]
    feedback: str
    next_question: Optional[str] = None
    done: bool = False

class FinishRequest(BaseModel):
    interview_id: str

class Report(BaseModel):
    interview_id: str
    score: int
    components: Dict[str, int]
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    tips: List[str] = Field(default_factory=list)