---
name: morning-briefing
description: Generates and displays the DailyPulse morning briefing. Use at the start of every work session.
trigger: /morning-briefing
effort: low
---

# Morning Briefing Skill

Run all steps in sequence. Do not skip any step.

## Step 1 — Fetch the briefing

```bash
curl -s http://localhost:8000/briefing
```

If the request fails or returns non-JSON, stop and tell the user:
> "The DailyFlow backend isn't running. Start it with: `cd backend && uvicorn main:app --reload`"

The response is a single JSON object with exactly these fields:
- `date` — ISO date string e.g. `"2026-05-08"`
- `quote` — motivational quote string
- `focus_tip` — one actionable focus tip string
- `message` — short encouraging message string

Display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DAILYFLOW MORNING BRIEFING — {date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "{quote}"

  FOCUS TIP
  {focus_tip}

  MESSAGE
  {message}
```

## Step 2 — Fetch tasks

```bash
curl -s http://localhost:8000/tasks
```

The response is a JSON array. Each task object has:
- `id` — UUID string
- `title` — task name string
- `subtasks` — array of strings (may be empty)
- `completed` — boolean
- `completed_at` — ISO datetime string or null e.g. `"2026-05-08T10:30:00.000000"`
- `created_at` — ISO datetime string e.g. `"2026-05-08T08:00:00.000000"`

Compute these counts from the array:
- `pending` = tasks where `completed === false`
- `completed_today` = tasks where `completed === true` AND `completed_at` starts with today's date (first 10 chars of `completed_at` match `date` from Step 1)
- `completed_yesterday` = tasks where `completed === true` AND `completed_at` starts with yesterday's date

## Step 3 — Display task summary

```
─────────────────────────────────────────────────
  TASK SUMMARY
─────────────────────────────────────────────────

  Pending:        {pending.length} task(s)
  Done today:     {completed_today.length} task(s)
  Done yesterday: {completed_yesterday.length} task(s)   ← omit if 0
```

If `pending.length > 0`, list them:
```
  PENDING TASKS
  • {title}  ({subtasks.length} subtasks)
  • ...
```

If `pending.length === 0`:
```
  All caught up! No pending tasks.
```

## Step 4 — Suggest a daily focus

Only run this step if there are pending tasks.

Pick the single best task to start with using this priority order:
1. Tasks whose `title` contains words like: review, fix, urgent, block, bug, deploy, release
2. Tasks with the most subtasks (higher complexity → tackle early)
3. Otherwise the first task in the pending list

Display:
```
─────────────────────────────────────────────────
  SUGGESTED FOCUS
─────────────────────────────────────────────────

  Start with: "{task.title}"
  {One sentence explaining why this is the best first task today.}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If no pending tasks, show instead:
```
  Have a great day — you're all caught up!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Notes

- Read-only. Never add, complete, or delete tasks.
- `subtasks` is an array of strings — use `.length` for the count, not the strings themselves in the summary.
- `completed_at` and `created_at` are bare ISO datetimes without timezone (UTC). Compare only the first 10 characters (YYYY-MM-DD) for date matching.
- Strip any markdown formatting (e.g. `**bold**`) when displaying text from the API.
