import { useState } from 'react'
import { mockAlerts } from '../data/mockAlerts'

const tierStyles = {
  severe: {
    border: 'border-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Urgent',
  },
  gradual: {
    border: 'border-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Gradual Drift',
  },
}

function AlertFeed() {
  const [alerts, setAlerts] = useState(mockAlerts)

  const handleAcknowledge = (id) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ))
  }

  // Show severe alerts first, regardless of recency
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.tier === 'severe' && b.tier !== 'severe') return -1
    if (a.tier !== 'severe' && b.tier === 'severe') return 1
    return 0
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>

      <div className="space-y-3">
        {sortedAlerts.map((alert) => {
          const style = tierStyles[alert.tier]
          return (
            <div
              key={alert.id}
              className={`border-l-4 ${style.border} bg-gray-50 rounded-r-lg p-4 flex justify-between items-start ${alert.acknowledged ? 'opacity-50' : ''}`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="font-medium">{alert.seniorName}</span>
                </div>
                <p className="text-gray-600 text-sm">{alert.summary}</p>
                <p className="text-gray-400 text-xs mt-1">{alert.createdAt}</p>
              </div>

              {!alert.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="text-sm px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-100 whitespace-nowrap"
                >
                  Acknowledge
                </button>
              )}
              {alert.acknowledged && (
                <span className="text-sm text-gray-400 whitespace-nowrap">✓ Reviewed</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AlertFeed