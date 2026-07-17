import { mockRoster } from '../data/mockRoster'

const statusStyles = {
  'Stable': 'bg-green-100 text-green-700',
  'Gradual Drift': 'bg-amber-100 text-amber-700',
  'Severe Anomaly': 'bg-red-100 text-red-700',
}

function Roster() {
  const total = mockRoster.length
  const urgent = mockRoster.filter(s => s.tier === 'red').length
  const drifting = mockRoster.filter(s => s.tier === 'amber').length

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Seniors</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Urgent Alerts</div>
          <div className="text-2xl font-bold text-red-600">{urgent}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Gradual Drift</div>
          <div className="text-2xl font-bold text-amber-600">{drifting}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Seniors</h2>
          <span className="text-sm text-gray-500">{mockRoster.length} seniors shown</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500 border-b">
              <th className="py-2">Senior</th>
              <th className="py-2">Last Contact</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockRoster.map((senior) => (
              <tr key={senior.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                <td className="py-3">
                  <div className="font-medium">{senior.name}</div>
                  <div className="text-sm text-gray-500">Age {senior.age}</div>
                </td>
                <td className="py-3 text-gray-600">{senior.lastContact}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[senior.status]}`}>
                    {senior.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Roster