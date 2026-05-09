import json
import os
import uuid
from datetime import datetime, date
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
TASKS_FILE = DATA_DIR / "tasks.json"
BRIEFING_FILE = DATA_DIR / "briefing.json"


# ---------- persistence ----------


def load_tasks() -> list:
    if not TASKS_FILE.exists():
        return []
    return json.loads(TASKS_FILE.read_text())


def save_tasks(tasks: list) -> None:
    TASKS_FILE.write_text(json.dumps(tasks, indent=2))


def today_str() -> str:
    return date.today().isoformat()


# ---------- AI ----------


def call_ai(prompt: str) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )
    return response.choices[0].message.content


def _parse_json_response(raw: str) -> any:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    return json.loads(cleaned.strip())


# ---------- business logic ----------


def _fetch_web_tip(today: str) -> str | None:
    """Fetch a real-time productivity tip via Tavily. Returns None on any failure."""
    try:
        import requests

        api_key = os.getenv("TAVILY_API_KEY", "")
        if not api_key:
            return None

        resp = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": f"productivity tip for developers {today}",
                "search_depth": "basic",
                "max_results": 1,
            },
            timeout=5,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
        if results:
            return results[0].get("content") or results[0].get("snippet")
    except Exception:
        pass
    return None


def get_briefing() -> dict:
    briefing_data = {}
    if BRIEFING_FILE.exists():
        briefing_data = json.loads(BRIEFING_FILE.read_text())

    today = today_str()
    if briefing_data.get("date") == today:
        return briefing_data

    prompt = (
        "Generate a daily briefing for a productivity app. Return ONLY valid JSON with these exact keys:\n"
        '{"date": "<today ISO date>", "quote": "<motivational quote>", '
        '"focus_tip": "<one actionable focus tip for the day>", '
        '"message": "<encouraging message under 50 words>"}\n'
        f"Use date: {today}"
    )

    raw = call_ai(prompt)
    try:
        briefing = _parse_json_response(raw)
    except json.JSONDecodeError:
        briefing = {
            "date": today,
            "quote": "Every day is a new beginning.",
            "focus_tip": "Pick your top 3 tasks and focus on those first.",
            "message": "You've got this! Start small, stay consistent, and celebrate every win.",
        }

    briefing["date"] = today

    if os.getenv("TAVILY_ENABLED", "false").lower() == "true":
        web_tip = _fetch_web_tip(today)
        if web_tip:
            briefing["web_tip"] = web_tip

    BRIEFING_FILE.write_text(json.dumps(briefing, indent=2))
    return briefing


def create_task(title: str) -> dict:
    prompt = (
        f'Break down this task into 3-5 concrete, actionable subtasks: "{title}"\n'
        "Return ONLY a JSON array of strings, no explanation. Example:\n"
        '["subtask one", "subtask two", "subtask three"]'
    )

    try:
        raw = call_ai(prompt)
        subtasks = _parse_json_response(raw)
        if not isinstance(subtasks, list):
            subtasks = ["Break this task down manually"]
    except Exception:
        subtasks = ["Break this task down manually"]

    task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "subtasks": subtasks,
        "completed": False,
        "completed_at": None,
        "created_at": datetime.utcnow().isoformat(),
    }

    tasks = load_tasks()
    tasks.append(task)
    save_tasks(tasks)
    return task


def complete_task(task_id: str) -> dict | None:
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = True
            task["completed_at"] = datetime.utcnow().isoformat()
            save_tasks(tasks)
            return task
    return None


def delete_task(task_id: str) -> bool:
    tasks = load_tasks()
    updated = [t for t in tasks if t["id"] != task_id]
    if len(updated) == len(tasks):
        return False
    save_tasks(updated)
    return True


def get_standup() -> dict:
    tasks = load_tasks()
    today = today_str()
    completed_today = [
        t
        for t in tasks
        if t.get("completed") and t.get("completed_at", "").startswith(today)
    ]

    if not completed_today:
        return {"standup": "No tasks were completed today yet."}

    completed_detail = [
        {"title": t["title"], "subtasks": t.get("subtasks", [])}
        for t in completed_today
    ]
    pending_detail = [
        {"title": t["title"], "subtasks": t.get("subtasks", [])}
        for t in tasks if not t.get("completed")
    ]

    prompt = (
        "Generate a brief professional standup update.\n"
        f"Completed today (with subtasks done): {json.dumps(completed_detail)}\n"
        f"Still in progress / upcoming (with subtasks): {json.dumps(pending_detail)}\n"
        "Write 2-3 clear sentences: what was accomplished (reference specific subtasks where relevant), "
        "and what is next. Be concise and professional."
    )

    return {"standup": call_ai(prompt).strip()}


def get_ai_news() -> dict:
    try:
        import requests

        api_key = os.getenv("TAVILY_API_KEY", "")
        if not api_key:
            return {"articles": [], "error": "TAVILY_API_KEY not configured"}

        today = today_str()
        resp = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": f"AI tools developers workflow news {today}",
                "search_depth": "basic",
                "max_results": 5,
            },
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json().get("results", [])
        articles = [
            {"title": r.get("title", ""), "url": r.get("url", ""), "snippet": r.get("content", "")[:180]}
            for r in results
        ]
        return {"articles": articles}
    except Exception as e:
        return {"articles": [], "error": str(e)}


def get_detailed_breakdown(task_description: str) -> dict:
    prompt = (
        f'Break down this task into 3-5 concrete, actionable subtasks: "{task_description}"\n'
        "For each subtask provide a time estimate. Return ONLY a JSON array of objects with keys "
        '"subtask" (string starting with an action verb) and "estimate" (string like "30 min", "1 hr"). '
        "Example:\n"
        '[{"subtask": "Write unit tests for login flow", "estimate": "45 min"}, '
        '{"subtask": "Review existing auth middleware", "estimate": "30 min"}]'
    )

    try:
        raw = call_ai(prompt)
        items = _parse_json_response(raw)
        if not isinstance(items, list):
            raise ValueError("not a list")
        for item in items:
            if "subtask" not in item or "estimate" not in item:
                raise ValueError("missing keys")
    except Exception:
        items = [{"subtask": "Break this task down manually", "estimate": "varies"}]

    return {"task_description": task_description, "breakdown": items}


def get_insights() -> dict:
    tasks = load_tasks()
    today = today_str()
    today_tasks = [t for t in tasks if t.get("created_at", "").startswith(today)]

    if not today_tasks:
        return {"insights": "No tasks recorded today. Add some tasks to get insights!"}

    completed = [t for t in today_tasks if t.get("completed")]
    completion_rate = len(completed) / len(today_tasks) * 100

    prompt = (
        "Analyze these productivity patterns and give actionable insights.\n"
        f"Total tasks today: {len(today_tasks)}\n"
        f"Completed tasks: {len(completed)}\n"
        f"Completion rate: {completion_rate:.0f}%\n"
        f"Tasks: {json.dumps([{'title': t['title'], 'completed': t['completed']} for t in today_tasks])}\n"
        "Provide: 1) A brief productivity assessment 2) One specific improvement suggestion. "
        "Keep it under 100 words, be encouraging."
    )

    return {"insights": call_ai(prompt).strip()}
