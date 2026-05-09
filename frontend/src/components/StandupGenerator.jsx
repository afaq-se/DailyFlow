import { useState } from 'react'

const API = 'http://localhost:8000'

const StandupGenerator = ({ completedCount }) => {
  const [standup, setStandup] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/standup`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStandup(data.standup)
    } catch {
      setError('Failed to generate standup.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(standup)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (completedCount === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">📋</span>
          <h2 className="text-base font-semibold text-slate-700">Standup Generator</h2>
        </div>
        <p className="text-sm text-slate-400">Complete at least one task to generate a standup.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">📋</span>
        <h2 className="text-base font-semibold text-slate-700">Standup Generator</h2>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating…
          </span>
        ) : 'Generate Standup'}
      </button>

      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

      {standup && (
        <div className="fade-in mt-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-slate-500 font-mono">standup.txt</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">{standup}</p>
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 w-full py-2 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  )
}

export default StandupGenerator
