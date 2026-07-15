import { mockAlerts } from '../data/mockAlerts'

const tierStyle = {
  critical: { bg: 'bg-red-50', border: 'border-red-500', badge: 'bg-red-100 text-red-600', label: 'CRITICAL', icon: '⚠️' },
  watch: { bg: 'bg-amber-50', border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'WATCH', icon: '↘' },
}

function AlertFeed({ setCurrentPage, setSelectedSenior }) {
  const openProfile = (seniorId) => {
    const senior = mockAlerts.find(a => a.seniorId === seniorId)
    if (senior) {
      setSelectedSenior({ id: senior.seniorId })
      setCurrentPage('profile')
    }
  }

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
        {mockAlerts.map((a) => {
          const style = tierStyle[a.tier]
          return (
            <div key={a.id} className={`border-l-4 ${style.border} ${style.bg} rounded-r-xl p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{style.icon}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${style.badge}`}>{style.label}</span>
                <span className="text-gray-700 font-medium">• {a.name}</span>
                <span className="text-gray-400 text-sm ml-auto">{a.time}</span>
              </div>
              <p className="text-gray-700">{a.message}</p>
              <button
                onClick={() => openProfile(a.seniorId)}
                className="text-teal-700 font-medium text-sm mt-2 hover:underline"
              >
                {a.action} →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AlertFeed