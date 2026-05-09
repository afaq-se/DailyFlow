const SkeletonLine = ({ width = 'w-full', height = 'h-4' }) => (
  <div className={`skeleton ${width} ${height}`} />
)

const BriefingCard = ({ briefing, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="skeleton w-5 h-5 rounded-full" />
          <SkeletonLine width="w-40" height="h-5" />
        </div>
        <SkeletonLine width="w-full" height="h-5" />
        <SkeletonLine width="w-3/4" height="h-5 mt-2" />
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SkeletonLine width="w-24" height="h-4" />
            <SkeletonLine width="w-full" height="h-4" />
            <SkeletonLine width="w-5/6" height="h-4" />
          </div>
          <div className="space-y-2">
            <SkeletonLine width="w-24" height="h-4" />
            <SkeletonLine width="w-full" height="h-4" />
            <SkeletonLine width="w-4/6" height="h-4" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow-md p-6 border border-red-100">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (!briefing) return null

  return (
    <div className="fade-in relative bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(139,92,246,0.06) 100%)',
      }} />
      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">☀️</span>
          <h2 className="text-base font-semibold text-slate-700">Morning Briefing</h2>
        </div>

        <blockquote className="text-lg font-medium text-slate-800 italic border-l-4 border-indigo-400 pl-4 mb-5">
          "{briefing.quote}"
        </blockquote>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Focus Tip</p>
            <p className="text-sm text-slate-700">{briefing.focus_tip}</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-1">Today's Message</p>
            <p className="text-sm text-slate-700">{briefing.message}</p>
          </div>
        </div>

        {briefing.web_tip && (
          <div className="mt-4 bg-emerald-50 rounded-xl border border-emerald-100 p-4 flex gap-3">
            <span className="text-emerald-500 text-base shrink-0">🌐</span>
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Web Tip</p>
              <p className="text-sm text-slate-700">{briefing.web_tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BriefingCard
