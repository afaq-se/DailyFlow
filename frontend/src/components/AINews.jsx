import { useState, useCallback } from 'react'

const API = 'http://localhost:8000'

const AINews = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/news`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setArticles(data.articles)
      setLoaded(true)
    } catch {
      setError('Failed to fetch news.')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">📰</span>
          <h2 className="text-base font-semibold text-slate-700">AI News Feed</h2>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Fetching…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loaded ? 'Refresh' : 'Load News'}
            </>
          )}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      {!loaded && !loading && (
        <p className="text-sm text-slate-400 text-center py-6">
          Click "Load News" to fetch the latest AI & developer news.
        </p>
      )}

      {loaded && articles.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">No articles found.</p>
      )}

      {articles.length > 0 && (
        <div className="space-y-3 fade-in">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors group"
            >
              <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 leading-snug mb-1">
                {article.title}
              </p>
              {article.snippet && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {article.snippet}
                </p>
              )}
              <p className="text-xs text-indigo-400 mt-1.5 truncate">{article.url}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default AINews
