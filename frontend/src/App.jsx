import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import BriefingCard from './components/BriefingCard'
import TaskManager from './components/TaskManager'
import StandupGenerator from './components/StandupGenerator'
import DailyInsights from './components/DailyInsights'
import AINews from './components/AINews'

const API = 'http://localhost:8000'

export default function App() {
  const [briefing, setBriefing] = useState(null)
  const [briefingLoading, setBriefingLoading] = useState(true)
  const [briefingError, setBriefingError] = useState('')

  const [tasks, setTasks] = useState([])

  const fetchBriefing = useCallback(async () => {
    setBriefingLoading(true)
    setBriefingError('')
    try {
      const res = await fetch(`${API}/briefing`)
      if (!res.ok) throw new Error('Failed to fetch briefing')
      const data = await res.json()
      setBriefing(data)
    } catch {
      setBriefingError('Could not load briefing. Is the backend running?')
    } finally {
      setBriefingLoading(false)
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tasks`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTasks(data)
    } catch {
      // silent — task manager shows empty state
    }
  }, [])

  useEffect(() => {
    fetchBriefing()
    fetchTasks()
  }, [fetchBriefing, fetchTasks])

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onRefreshBriefing={fetchBriefing} loading={briefingLoading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <BriefingCard briefing={briefing} loading={briefingLoading} error={briefingError} />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[60%]">
            <TaskManager tasks={tasks} setTasks={setTasks} />
          </div>

          <div className="w-full lg:w-[40%] flex flex-col gap-6 [&>*]:flex-1">
            <StandupGenerator completedCount={completedCount} />
            <DailyInsights totalTasks={tasks.length} />
          </div>
        </div>

        <AINews />
      </main>
    </div>
  )
}
