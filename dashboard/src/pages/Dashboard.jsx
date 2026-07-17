import { useEffect, useState } from 'react'
import { getSeniors } from '../utils/api'

const tierBadge = {
  critical: { label: 'Critical', style: 'bg-red-100 text-red-600' },
  watch: { label: 'Watch', style: 'bg-amber-100 text-amber-700' },
  stable: { label: 'Stable', style: 'bg-green-100 text-green-700' },
}
const barColor = {
  critical: 'bg-red-500',
  watch: 'bg-amber-400',
  stable: 'bg-green-400',
}

function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}
function getAge(dob) {
  if (!dob) return null
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}
// TEMP: until ML service exposes real score/drift, derive a rough tier from open_alert_count
function deriveTier(openAlertCount) {
  if (openAlertCount >= 2) return 'critical'
  if (openAlertCount === 1) return 'watch'
  return 'stable'
}
function adaptSenior(s) {
  return {
    id: s.id,
    name: s.full_name,
    initials: getInitials(s.full_name),
    age: getAge(s.date_of_birth),
    tier: deriveTier(s.open_alert_count),
    unread: s.open_alert_count,
    drift: 0,           // placeholder until ML endpoint exists
    score: null,
    baseline: null,
    lastActive: '—',    // placeholder until last message timestamp is included
  }
}

function Dashboard({ setCurrentPage, setSelectedSenior }) {
  const [seniors, setSeniors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSeniors()
      .then(res => setSeniors(res.data.map(adaptSenior)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading seniors…</div>
  if (error) return <div className="p-8 text-red-600">Couldn't load seniors: {error}</div>

  const total = seniors.length
  const needAttention = seniors.filter(s => s.tier !== 'stable').length
  const critical = seniors.filter(s => s.tier === 'critical').length
  const watch = seniors.filter(s => s.tier === 'watch').length
  const unread = seniors.reduce((sum, s) => sum + s.unread, 0)

  const openProfile = (senior) => {
    setSelectedSenior(senior)
    setCurrentPage('profile')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">My Seniors</h1>
      <p className="text-gray-500 mt-1">{total} under your care</p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm text-gray-500">Total Seniors</div>
          <div className="text-4xl font-bold mt-1">{total}</div>
          <div className="text-sm text-gray-400 mt-1">under your care</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm text-gray-500">Need Attention</div>
          <div className="text-4xl font-bold mt-1 text-red-600">{needAttention}</div>
          <div className="text-sm text-gray-400 mt-1">{critical} critical, {watch} watch</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm text-gray-500">Unread Alerts</div>
          <div className="text-4xl font-bold mt-1 text-red-600">{unread}</div>
          <div className="text-sm text-gray-400 mt-1">require action</div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {seniors.map((s) => {
          const badge = tierBadge[s.tier]
          return (
            <button
              key={s.id}
              onClick={() => openProfile(s)}
              className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {s.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{s.name}</span>
                  <span className="text-gray-400 text-sm">Age {s.age ?? '—'}</span>
                  {s.tier !== 'stable' && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.style}`}>
                      ● {badge.label}
                    </span>
                  )}
                  {s.unread > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                      {s.unread} unread
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-2">Drift from baseline</div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full ${barColor[s.tier]}`}
                    style={{ width: `${Math.min(s.drift * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right text-sm flex-shrink-0">
                <div className="text-gray-400 mt-1">{s.lastActive}</div>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard