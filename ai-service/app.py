from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from matching import match_volunteers_to_task
from priority import predict_priority
from skills_extractor import predict_skills

app = FastAPI(title="VolunteerAI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Location(BaseModel):
    lat: float = 0.0
    lng: float = 0.0
    city: str = ""


class VolunteerInput(BaseModel):
    id: str
    name: str
    skills: List[str] = []
    location: Location = Location()
    availability: str = "part-time"
    rating: float = 0.0


class TaskInput(BaseModel):
    id: str
    title: str
    requiredSkills: List[str] = []
    location: Location = Location()
    urgency: str = "medium"
    deadline: Optional[str] = None


class MatchRequest(BaseModel):
    task: TaskInput
    volunteers: List[VolunteerInput]
    topN: int = 5


class PriorityRequest(BaseModel):
    title: str
    description: str = ""
    requiredSkills: List[str] = []
    location: Location = Location()

class SkillRequest(BaseModel):
    title: str
    description: str = ""


@app.get("/health")
def health():
    return {"status": "ok", "service": "VolunteerAI"}


@app.post("/match")
def match_endpoint(req: MatchRequest):
    """Find best matching volunteers for a task using ML scoring"""
    results = match_volunteers_to_task(req.task, req.volunteers, req.topN)
    return {"task": req.task.title, "matchCount": len(results), "matches": results}


@app.post("/priority")
def priority_endpoint(req: PriorityRequest):
    """Predict urgency level for a task based on its attributes"""
    result = predict_priority(req.title, req.description, req.requiredSkills)
    return result

@app.post("/extract-skills")
def extract_skills_endpoint(req: SkillRequest):
    """Predict required skills based on text context"""
    text = f"{req.title} {req.description}"
    skills = predict_skills(text)
    return {"extractedSkills": skills}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
