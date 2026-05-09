import { useState } from 'react'

const API = 'http://localhost:8000'

const TaskCard = ({ task, onComplete }) => {
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)
    await onComplete(task.id)
    setCompleting(false)
  }

  return (
    <div className={`task-card fade-in rounded-xl border p-4 border-l-4 ${
      task.completed
        ? 'bg-green-50/40 border-green-200 border-l-green-400'
        : 'bg-white border-slate-200 border-l-indigo-500'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {task.completed ? (
            <span className="text-green-500 mt-0.5 shrink-0 text-base">✓</span>
          ) : (
            <span className="text-indigo-300 mt-0.5 shrink-0">○</span>
          )}
          <h3 className={`font-semibold text-sm leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </h3>
        </div>
        {!task.completed && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="shrink-0 text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {completing ? '…' : 'Complete'}
          </button>
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <ul className="mt-3 ml-5 space-y-1.5">
          {task.subtasks.map((subtask, i) => (
            <li key={i} className="flex items-start gap-2">
              <input
                type="checkbox"
                defaultChecked={task.completed}
                className="mt-0.5 accent-indigo-600 shrink-0"
                readOnly
              />
              <span className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                {subtask}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const TaskManager = ({ tasks, setTasks }) => {
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [completedOpen, setCompletedOpen] = useState(false)

  const inProgress = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  const handleAdd = async (e) => {
    e.preventDefault()
    const title = input.trim()
    if (!title) return

    setAdding(true)
    setError('')
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error('Failed to add task')
      const task = await res.json()
      setTasks(prev => [task, ...prev])
      setInput('')
    } catch {
      setError('Failed to add task. Is the backend running?')
    } finally {
      setAdding(false)
    }
  }

  const handleComplete = async (id) => {
    try {
      const res = await fetch(`${API}/tasks/${id}/complete`, { method: 'PUT' })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
    } catch {
      setError('Failed to complete task.')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
      <h2 className="text-base font-semibold text-slate-700 mb-4">Smart Tasks</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-5">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a task… AI will break it into subtasks"
          className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-slate-400"
          disabled={adding}
        />
        <button
          type="submit"
          disabled={adding || !input.trim()}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {adding ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Adding…
            </span>
          ) : 'Add Task'}
        </button>
      </form>

      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

      {inProgress.length === 0 && completed.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-8">No tasks yet. Add one above!</p>
      )}

      {inProgress.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            In Progress · {inProgress.length}
          </p>
          <div className="space-y-3">
            {inProgress.map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setCompletedOpen(o => !o)}
            className="flex items-center gap-2 w-full text-left mb-3 group"
          >
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">
              Completed Today · {completed.length}
            </p>
            <svg
              className={`w-3.5 h-3.5 text-green-400 transition-transform duration-200 ${completedOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {completedOpen && (
            <div className="space-y-3 fade-in">
              {completed.map(task => (
                <TaskCard key={task.id} task={task} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskManager
