# DailyFlow

DailyFlow is a personal AI productivity web app. Users get a morning briefing,
manage smart tasks (AI breaks tasks into subtasks), generate standups from
completed tasks, view daily insights, and browse an AI news feed powered by Tavily.

## Tech Stack

- **Backend:** Python FastAPI, runs on port 8000, data stored in backend/data/
  as JSON files (tasks.json, briefing.json). Use python-dotenv for env vars.
- **Frontend:** React with Vite, Tailwind CSS, runs on port 5173.
  Use fetch() for API calls to http://localhost:8000.
  No external state management — useState and useEffect only.
- **AI:** OpenAI via openai SDK (model: gpt-4o-mini).
  API key from OPENAI_API_KEY env var.
- **Web search:** Tavily REST API (https://api.tavily.com/search).
  API key from TAVILY_API_KEY env var. Only active when TAVILY_ENABLED=true.

## Tailwind CSS

This project uses **Tailwind CSS v4** (currently v4.2.x), integrated via the
`@tailwindcss/vite` Vite plugin — NOT the PostCSS plugin used in v3.

Key differences from v3 — do not use v3 patterns:
- No `tailwind.config.js` — v4 auto-scans source files, no `content` array needed
- No `@tailwind base/components/utilities` directives — replaced by a single
  `@import "tailwindcss"` at the top of `src/index.css`
- No `npx tailwindcss init` — there is nothing to initialise
- Plugin is `@tailwindcss/vite`, registered in `vite.config.js`, not `postcss.config.js`

If a future version of Tailwind is installed, follow its own setup guide rather
than assuming v3 or v4 patterns.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /briefing | Daily briefing (cached per day). Includes web_tip if TAVILY_ENABLED=true |
| GET | /tasks | All tasks |
| POST | /tasks | Create task — AI generates subtasks. Fallback: ["Break this task down manually"] |
| PUT | /tasks/{id}/complete | Mark task complete |
| DELETE | /tasks/{id} | Delete task |
| GET | /standup | AI standup from today's completed tasks |
| GET | /insights | AI productivity insights (requires ≥3 tasks) |
| GET | /news | Latest AI/developer news via Tavily (5 articles) |
| POST | /tasks/breakdown | Detailed task breakdown with time estimates per subtask |

## Project Structure

```
DailyFlow/
├── .mcp.json                          # Tavily MCP server config (project root, required here)
├── .claude/
│   ├── claude.md                      # This file
│   ├── settings.json                  # Hooks: black formatter on .py, stop message
│   ├── agents/
│   │   └── task-breakdown.md          # Haiku agent: breaks vague tasks into subtasks
│   └── skills/
│       ├── morning-briefing/SKILL.md  # /morning-briefing — daily briefing + task summary
│       └── generate-standup/SKILL.md  # /generate-standup — standup with blocker prompt + clipboard
├── backend/
│   ├── main.py                        # FastAPI routes (thin layer, delegates to services.py)
│   ├── services.py                    # All business logic and AI calls
│   ├── tavily_fetch.py                # Standalone script: fetch news/quotes from Tavily
│   ├── requirements.txt
│   ├── .env                           # OPENAI_API_KEY, TAVILY_API_KEY, TAVILY_ENABLED
│   └── data/
│       ├── tasks.json
│       └── briefing.json
└── frontend/
    ├── vite.config.js                 # Vite + @tailwindcss/vite plugin
    └── src/
        ├── App.jsx
        ├── index.css                  # @import "tailwindcss" — Tailwind v4 entry point
        └── components/
            ├── Header.jsx
            ├── BriefingCard.jsx       # Shows quote, focus_tip, message, web_tip (if present)
            ├── TaskManager.jsx        # Task cards with subtasks, completed section collapsible
            ├── StandupGenerator.jsx   # Dark code-block output, copy to clipboard
            ├── DailyInsights.jsx      # Gated behind ≥3 tasks
            └── AINews.jsx             # Tavily-powered news feed, load/refresh button
```

## Code Standards

- Python: type hints on all functions, black formatting, no bare except blocks
- React: functional components only, loading and error states on every API call
- File naming: snake_case for Python, PascalCase for React components
- Never put mcpServers in .claude/settings.json — it's not a valid field there; use .mcp.json at root

## MCP / Tavily

- `.mcp.json` at the project root configures the Tavily remote MCP server (OAuth, no API key in URL)
- The backend uses Tavily directly via REST (`https://api.tavily.com/search`) for `web_tip` and `/news`
- To activate: set `TAVILY_API_KEY` and `TAVILY_ENABLED=true` in `backend/.env`, then delete
  `backend/data/briefing.json` to force regeneration with `web_tip`

## Skills

- `/morning-briefing` — fetches briefing + tasks, displays formatted summary, suggests focus task
- `/generate-standup` — fetches standup, asks for blockers, formats output, offers clipboard copy

## Agents

- `task-breakdown` — claude-haiku-4-5, read-only, breaks any vague task into 3-5 actionable subtasks
  with action verbs, each completable in under 2 hours

## Running the App

```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev

# Tavily news fetch (standalone)
cd backend
python3 tavily_fetch.py
```
