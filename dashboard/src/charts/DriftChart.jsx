import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { mockDriftData } from '../data/mockSeniorData'

function DriftChart() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Communication Activity</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={mockDriftData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            dataKey="baselineHigh"
            stroke="none"
            fill="#e5e7eb"
            fillOpacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DriftChart