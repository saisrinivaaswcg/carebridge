import { AreaChart, Area, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { mockTrends, mockWeekly } from '../data/mockTrends'
import { mockAlerts } from '../data/mockAlerts'

const tierBadge = {
  critical: 'bg-red-100 text-red-600',
  watch: 'bg-amber-100 text-amber-700',
  stable: 'bg-green-100 text-green-700',
}

function SeniorProfile({ senior, setCurrentPage }) {
  const trend = mockTrends[senior.id] || []
  const weekly = mockWeekly[senior.id] || []
  const alertHistory = mockAlerts.filter(a => a.seniorId === senior.id)

  return (
    <div className="p-8">
      <button
        onClick={() => setCurrentPage('dashboard')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1"
      >
        ← All Seniors
      </button>

      <h1 className="text-3xl font-bold text-gray-900">{senior.name}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4 flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-lg flex-shrink-0">
            {senior.initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold text-gray-900">{senior.name}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierBadge[senior.tier]}`}>
                ● {senior.tier.charAt(0).toUpperCase() + senior.tier.slice(1)}
              </span>
              <span className="text-gray-400 text-sm">Age {senior.age}</span>
            </div>
            {senior.address && <div className="text-gray-500 mt-2">📍 {senior.address}</div>}
            {senior.contact && <div className="text-gray-500 mt-1">📞 {senior.contact}</div>}
            {senior.note && <div className="text-gray-500 mt-3 italic">"{senior.note}"</div>}
          </div>
        </div>
        <div className="text-right text-sm text-gray-400 flex-shrink-0">
          <div>Last active {senior.lastActive}</div>
          {senior.joined && <div>Joined {senior.joined}</div>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm text-gray-500">Current Score</div>
          <div className="text-3xl font-bold mt-1">{senior.score}</div>
          <div className="text-sm text-gray-400 mt-1">Personal baseline: {senior.baseline}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm text-gray-500">Drift from Baseline</div>
          <div className="text-3xl font-bold mt-1">{senior.drift}%</div>
          <div className="text-sm text-gray-400 mt-1">
            {senior.tier === 'critical' ? 'Immediate attention needed' : senior.tier === 'watch' ? 'Monitor closely' : 'Within normal range'}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-sm text-gray-500">Open Alerts</div>
          <div className="text-3xl font-bold mt-1">{senior.unread}</div>
          <div className="text-sm text-gray-400 mt-1">{alertHistory.length} alerts total</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">Communication Activity Score</h3>
              <p className="text-xs text-gray-400 mt-1">Shaded band = personal normal range (±10 pts from baseline)</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{senior.score}</div>
              <div className="text-xs text-gray-400">Baseline: {senior.baseline}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area dataKey="baselineHigh" stroke="none" fill="#e5e7eb" fillOpacity={0.6} />
              <Area dataKey="baselineLow" stroke="none" fill="#ffffff" fillOpacity={1} />
              <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900">Weekly Breakdown</h3>
          <p className="text-xs text-gray-400 mt-1">Messages, calls, voice notes — last 4 weeks</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="messages" fill="#0f766e" name="Messages" />
              <Bar dataKey="calls" fill="#14b8a6" name="Calls" />
              <Bar dataKey="voiceNotes" fill="#5eead4" name="Voice Notes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Alert History <span className="text-gray-400 font-normal">{alertHistory.length} alerts</span></h3>
        {alertHistory.length === 0 && <p className="text-gray-400 text-sm">No alerts for this senior.</p>}
        <div className="space-y-3">
          {alertHistory.map((a) => (
            <div key={a.id} className={`border-l-4 ${a.tier === 'critical' ? 'border-red-500 bg-red-50' : 'border-amber-400 bg-amber-50'} rounded-r-lg p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${a.tier === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                  {a.tier.toUpperCase()}
                </span>
                <span className="text-gray-700 font-medium">• {a.name}</span>
                <span className="text-gray-400 text-sm ml-auto">{a.time}</span>
              </div>
              <p className="text-gray-700 text-sm">{a.message}</p>
              <button className="text-teal-700 font-medium text-sm mt-1 hover:underline">{a.action} →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SeniorProfile