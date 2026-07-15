function SeniorProfile({ senior }) {
  const tierBadge = {
    critical: 'bg-red-100 text-red-600',
    watch: 'bg-amber-100 text-amber-700',
    stable: 'bg-green-100 text-green-700',
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">{senior.name}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6 flex justify-between items-start">
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
            </div>
            <div className="text-gray-500 mt-1">Age {senior.age}</div>
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
          <div className="text-sm text-gray-400 mt-1">{senior.unread} alerts total</div>
        </div>
      </div>
    </div>
  )
}

export default SeniorProfile