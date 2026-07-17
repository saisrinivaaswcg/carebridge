import { useEffect, useState } from 'react'
import { getSeniors } from '../utils/api'

const dotColor = {
  critical: 'bg-red-400',
  watch: 'bg-amber-400',
  stable: 'bg-green-400',
}

function deriveTier(openAlertCount) {
  if (openAlertCount >= 2) return 'critical'
  if (openAlertCount === 1) return 'watch'
  return 'stable'
}

function Sidebar({ currentPage, setCurrentPage, selectedSenior, setSelectedSenior, user }) {
  const [seniors, setSeniors] = useState([])

  useEffect(() => {
    getSeniors()
      .then(res => setSeniors(res.data.map(s => ({
        id: s.id,
        name: s.full_name,
        age: s.date_of_birth
          ? Math.floor((Date.now() - new Date(s.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        tier: deriveTier(s.open_alert_count),
        unread: s.open_alert_count,
      }))))
      .catch(() => setSeniors([])) // fail quiet in sidebar; Dashboard already surfaces the error
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  const unreadCount = seniors.reduce((sum, s) => sum + s.unread, 0)

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-5 flex items-center gap-3 border-b border-gray-200">
        <div className="w-9 h-9 rounded-full bg-teal-800 text-white flex items-center justify-center font-semibold text-sm">
          CB
        </div>
        <div>
          <div className="font-semibold text-gray-900 leading-tight">CareBridge</div>
          <div className="text-xs text-gray-500">Caseworker Portal</div>
        </div>
      </div>

      <nav className="p-3 space-y-1 border-b border-gray-200 pb-4">
        <button
          onClick={() => { setCurrentPage('dashboard'); setSelectedSenior(null) }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
            currentPage === 'dashboard' ? 'bg-teal-800 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ⬛ Dashboard
        </button>
        <button
          onClick={() => { setCurrentPage('alerts'); setSelectedSenior(null) }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
            currentPage === 'alerts' ? 'bg-teal-800 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>🔔 Alert Feed</span>
          {unreadCount > 0 && (
            <span className={`text-xs rounded-full px-2 py-0.5 ${
              currentPage === 'alerts' ? 'bg-white/20' : 'bg-red-100 text-red-600'
            }`}>{unreadCount}</span>
          )}
        </button>
      </nav>

      <div className="p-3 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 px-3 mb-2 tracking-wide">MY SENIORS</div>
        {seniors.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelectedSenior(s); setCurrentPage('profile') }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
              selectedSenior?.id === s.id ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dotColor[s.tier]}`}></span>
              {s.name.split(' ').slice(-2).join(' ')}
            </span>
            <span className="text-gray-400">{s.age ?? '—'}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{user?.full_name || 'Unknown user'}</div>
          <div className="text-xs text-gray-500 capitalize">{user?.role || ''}</div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

// import { mockSeniors } from '../data/mockSeniors'

// const dotColor = {
//   critical: 'bg-red-400',
//   watch: 'bg-amber-400',
//   stable: 'bg-green-400',
// }

// function Sidebar({ currentPage, setCurrentPage, selectedSenior, setSelectedSenior }) {
//   const unreadCount = mockSeniors.reduce((sum, s) => sum + s.unread, 0)

//   return (
//     <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
//       <div className="p-5 flex items-center gap-3 border-b border-gray-200">
//         <div className="w-9 h-9 rounded-full bg-teal-800 text-white flex items-center justify-center font-semibold text-sm">
//           CB
//         </div>
//         <div>
//           <div className="font-semibold text-gray-900 leading-tight">CareBridge</div>
//           <div className="text-xs text-gray-500">Caseworker Portal</div>
//         </div>
//       </div>

//       <nav className="p-3 space-y-1 border-b border-gray-200 pb-4">
//         <button
//           onClick={() => { setCurrentPage('dashboard'); setSelectedSenior(null) }}
//           className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
//             currentPage === 'dashboard' ? 'bg-teal-800 text-white' : 'text-gray-600 hover:bg-gray-100'
//           }`}
//         >
//           ⬛ Dashboard
//         </button>
//         <button
//           onClick={() => { setCurrentPage('alerts'); setSelectedSenior(null) }}
//           className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
//             currentPage === 'alerts' ? 'bg-teal-800 text-white' : 'text-gray-600 hover:bg-gray-100'
//           }`}
//         >
//           <span>🔔 Alert Feed</span>
//           {unreadCount > 0 && (
//             <span className={`text-xs rounded-full px-2 py-0.5 ${
//               currentPage === 'alerts' ? 'bg-white/20' : 'bg-red-100 text-red-600'
//             }`}>{unreadCount}</span>
//           )}
//         </button>
//       </nav>

//       <div className="p-3 flex-1 overflow-y-auto">
//         <div className="text-xs font-semibold text-gray-400 px-3 mb-2 tracking-wide">MY SENIORS</div>
//         {mockSeniors.map((s) => (
//           <button
//             key={s.id}
//             onClick={() => { setSelectedSenior(s); setCurrentPage('profile') }}
//             className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
//               selectedSenior?.id === s.id ? 'bg-gray-200' : 'hover:bg-gray-100'
//             }`}
//           >
//             <span className="flex items-center gap-2">
//               <span className={`w-2 h-2 rounded-full ${dotColor[s.tier]}`}></span>
//               {s.name.split(' ').slice(-2).join(' ')}
//             </span>
//             <span className="text-gray-400">{s.age}</span>
//           </button>
//         ))}
//       </div>

//       <div className="p-4 border-t border-gray-200 flex items-center gap-3">
//         <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
//           ST
//         </div>
//         <div>
//           <div className="text-sm font-medium text-gray-900">Sarah Tan</div>
//           <div className="text-xs text-gray-500">Senior Caseworker</div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Sidebar