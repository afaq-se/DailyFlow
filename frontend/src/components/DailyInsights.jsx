import { useState } from 'react'

const API = 'http://localhost:8000'

const DailyInsights = ({ totalTasks }) => {
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGet = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/insights`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setInsights(data.insights)
    } catch {
      setError('Failed to fetch insights.')
    } finally {
      setLoading(false)
    }
  }

  if (totalTasks < 3) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">✨</span>
          <h2 className="text-base font-semibold text-slate-700">Daily Insights</h2>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Add {3 - totalTasks} more task{3 - totalTasks !== 1 ? 's' : ''} to unlock insights.
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < totalTasks ? 'bg-indigo-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">✨</span>
        <h2 className="text-base font-semibold text-slate-700">Daily Insights</h2>
      </div>

      <button
        onClick={handleGet}
        disabled={loading}
        className="w-full py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Analyzing…
          </span>
        ) : 'Get Insights'}
      </button>

      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

      {insights && (
        <div className="fade-in mt-4 bg-violet-50 rounded-xl border border-violet-100 p-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{insights}</p>
        </div>
      )}
    </div>
  )
}

export default DailyInsights
