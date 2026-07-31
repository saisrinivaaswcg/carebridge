import { useState, useEffect } from 'react'
import { getAlerts, getSeniors } from '../utils/api'

const tierStyle = {
  critical: { bg: 'bg-red-50', border: 'border-red-500', badge: 'bg-red-100 text-red-600', label: 'CRITICAL', icon: '⚠️' },
  high: { bg: 'bg-red-50', border: 'border-red-500', badge: 'bg-red-100 text-red-600', label: 'CRITICAL', icon: '⚠️' },
  watch: { bg: 'bg-amber-50', border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'WATCH', icon: '↘' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'WATCH', icon: '↘' },
  low: { bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gray-100 text-gray-600', label: 'LOW', icon: 'ℹ️' },
}

function AlertFeed({ setCurrentPage, setSelectedSenior }) {
  const [alerts, setAlerts] = useState([])
  const [seniors, setSeniors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [alertsData, seniorsData] = await Promise.all([
          getAlerts(),
          getSeniors()
        ])
        setAlerts(alertsData.data || [])
        setSeniors(seniorsData.data || [])
      } catch (err) {
        console.error('Failed to fetch alerts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // refresh every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const getSeniorName = (seniorId) => {
    const senior = seniors.find(s => s.id === seniorId)
    return senior?.full_name || 'Unknown Senior'
  }

  const openProfile = (seniorId) => {
    const senior = seniors.find(s => s.id === seniorId)
    if (senior) {
      setSelectedSenior(senior)
      setCurrentPage('profile')
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMins = Math.floor((now - date) / 60000)
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  if (loading) return <div className="p-8 text-gray-500">Loading alerts...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Alert Feed</h1>
      <p className="text-gray-500 mt-1">Sorted by urgency — critical alerts require immediate action</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="text-xs font-semibold text-gray-400 tracking-wide mb-3">ALERT TIER GUIDE</div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-600 border-l-4 border-red-500">CRITICAL</span>
            <span className="text-gray-600">Sudden anomaly — check on the senior immediately.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border-l-4 border-amber-400">WATCH</span>
            <span className="text-gray-600">Gradual drift detected — consider scheduling a check-up.</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {alerts.length === 0 && (
          <div className="text-gray-400 text-center py-8">No alerts at this time.</div>
        )}
        {alerts.map((a) => {
          const tier = a.severity?.toLowerCase() || 'low'
          const style = tierStyle[tier] || tierStyle.low
          return (
            <div key={a.id} className={`border-l-4 ${style.border} ${style.bg} rounded-r-xl p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{style.icon}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${style.badge}`}>{style.label}</span>
                <span className="text-gray-700 font-medium">• {getSeniorName(a.senior_id)}</span>
                <span className="text-gray-400 text-sm ml-auto">{formatTime(a.detected_at)}</span>
              </div>
              <p className="text-gray-700">{a.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => openProfile(a.senior_id)}
                  className="text-gray-500 text-sm hover:underline"
                >
                  View Profile
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AlertFeed