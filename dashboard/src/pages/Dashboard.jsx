import { mockSeniors } from '../data/mockSeniors'

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

function Dashboard({ setCurrentPage, setSelectedSenior }) {
  const total = mockSeniors.length
  const needAttention = mockSeniors.filter(s => s.tier !== 'stable').length
  const critical = mockSeniors.filter(s => s.tier === 'critical').length
  const watch = mockSeniors.filter(s => s.tier === 'watch').length
  const unread = mockSeniors.reduce((sum, s) => sum + s.unread, 0)

  const openProfile = (senior) => {
    setSelectedSenior(senior)
    setCurrentPage('profile')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">My Seniors</h1>
      <p className="text-gray-500 mt-1">{total} under your care · Monday, 13 July 2026</p>

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
        {mockSeniors.map((s) => {
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
                  <span className="text-gray-400 text-sm">Age {s.age}</span>
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
                <div className="font-medium text-gray-700">{s.drift}%</div>
                <div className="text-gray-400 mt-1">{s.lastActive}</div>
                <div className="text-gray-400">{s.score} / {s.baseline}</div>
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