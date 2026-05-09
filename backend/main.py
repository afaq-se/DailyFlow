from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import services

load_dotenv()

app = FastAPI(title="DailyFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskRequest(BaseModel):
    title: str


class BreakdownRequest(BaseModel):
    task_description: str


@app.get("/briefing")
def get_briefing():
    return services.get_briefing()


@app.get("/tasks")
def get_tasks():
    return services.load_tasks()


@app.post("/tasks", status_code=201)
def create_task(req: TaskRequest):
    return services.create_task(req.title)


@app.put("/tasks/{task_id}/complete")
def complete_task(task_id: str):
    task = services.complete_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str):
    if not services.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")


@app.get("/standup")
def get_standup():
    return services.get_standup()


@app.get("/insights")
def get_insights():
    return services.get_insights()


@app.get("/news")
def get_news():
    return services.get_ai_news()


@app.post("/tasks/breakdown")
def breakdown_task(req: BreakdownRequest):
    return services.get_detailed_breakdown(req.task_description)
