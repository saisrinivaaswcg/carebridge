
import { useState } from 'react'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AlertFeed from './pages/AlertFeed'
import SeniorProfile from './pages/SeniorProfile'

function App() {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedSenior, setSelectedSenior] = useState(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedSenior={selectedSenior}
        setSelectedSenior={setSelectedSenior}
      />
      <div className="flex-1">
        {currentPage === 'dashboard' && (
          <Dashboard setCurrentPage={setCurrentPage} setSelectedSenior={setSelectedSenior} />
        )}
        {currentPage === 'alerts' && (
          <AlertFeed setCurrentPage={setCurrentPage} setSelectedSenior={setSelectedSenior} />
        )}
        {currentPage === 'profile' && selectedSenior && (
          <SeniorProfile senior={selectedSenior} setCurrentPage={setCurrentPage} />
        )}
      </div>
    </div>
  )
}

export default App

// // import DriftChart from './charts/DriftChart'
// // import Roster from './pages/Roster'
// // import AlertFeed from './pages/AlertFeed'

// // function App() {
// //   return (
// //     <div className="p-8 bg-gray-50 min-h-screen">
// //       <h1 className="text-3xl font-bold text-blue-600 mb-6">CareBridge Dashboard</h1>
// //       <AlertFeed />
// //       <div className="mt-6">
// //         <Roster />
// //       </div>
// //       <div className="mt-6">
// //         <DriftChart />
// //       </div>
// //     </div>
// //   )
// // }

// // export default App

// import { useState } from 'react'
// import Sidebar from './components/Sidebar'
// import Dashboard from './pages/Dashboard'
// import AlertFeed from './pages/AlertFeed'
// import SeniorProfile from './pages/SeniorProfile'

// function App() {
//   const [currentPage, setCurrentPage] = useState('dashboard')
//   const [selectedSenior, setSelectedSenior] = useState(null)

//   return (
//     <div className="flex bg-gray-50 min-h-screen">
//       <Sidebar
//         currentPage={currentPage}
//         setCurrentPage={setCurrentPage}
//         selectedSenior={selectedSenior}
//         setSelectedSenior={setSelectedSenior}
//       />
//       <div className="flex-1">
//         {currentPage === 'dashboard' && (
//           <Dashboard setCurrentPage={setCurrentPage} setSelectedSenior={setSelectedSenior} />
//         )}
//         {currentPage === 'alerts' && (
//           <AlertFeed setCurrentPage={setCurrentPage} setSelectedSenior={setSelectedSenior} />
//         )}
//         {currentPage === 'profile' && selectedSenior && (
//        //   <SeniorProfile senior={selectedSenior} />
//        <SeniorProfile senior={selectedSenior} setCurrentPage={setCurrentPage} />
//         )}
//       </div>
//     </div>
//   )
// }

// export default App
// // // import DriftChart from './charts/DriftChart'

// // // function App() {
// // //   return (
// // //     <div className="p-8 bg-gray-50 min-h-screen">
// // //       <h1 className="text-3xl font-bold text-blue-600 mb-6">CareBridge Dashboard</h1>
// // //       <DriftChart />
// // //     </div>
// // //   )
// // // }

// // // export default App

// // import DriftChart from './charts/DriftChart'
// // import Roster from './pages/Roster'

// // function App() {
// //   return (
// //     <div className="p-8 bg-gray-50 min-h-screen">
// //       <h1 className="text-3xl font-bold text-blue-600 mb-6">CareBridge Dashboard</h1>
// //       <Roster />
// //       <div className="mt-6">
// //         <DriftChart />
// //       </div>
// //     </div>
// //   )
// // }

// // export default App
// // // function App() {
// // //   return (
// // //     <div className="p-8">
// // //       <h1 className="text-3xl font-bold text-blue-600">CareBridge Dashboard</h1>
// // //       <p className="text-gray-600 mt-2">If this is blue and styled, Tailwind works.</p>
// // //     </div>
// // //   )
// // // }

// // // export default App



// // // import { useState } from 'react'
// // // import reactLogo from './assets/react.svg'
// // // import viteLogo from './assets/vite.svg'
// // // import heroImg from './assets/hero.png'
// // // import './App.css'

// // // function App() {
// // //   const [count, setCount] = useState(0)

// // //   return (
// // //     <>
// // //       <section id="center">
// // //         <div className="hero">
// // //           <img src={heroImg} className="base" width="170" height="179" alt="" />
// // //           <img src={reactLogo} className="framework" alt="React logo" />
// // //           <img src={viteLogo} className="vite" alt="Vite logo" />
// // //         </div>
// // //         <div>
// // //           <h1>Get started</h1>
// // //           <p>
// // //             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
// // //           </p>
// // //         </div>
// // //         <button
// // //           type="button"
// // //           className="counter"
// // //           onClick={() => setCount((count) => count + 1)}
// // //         >
// // //           Count is {count}
// // //         </button>
// // //       </section>

// // //       <div className="ticks"></div>

// // //       <section id="next-steps">
// // //         <div id="docs">
// // //           <svg className="icon" role="presentation" aria-hidden="true">
// // //             <use href="/icons.svg#documentation-icon"></use>
// // //           </svg>
// // //           <h2>Documentation</h2>
// // //           <p>Your questions, answered</p>
// // //           <ul>
// // //             <li>
// // //               <a href="https://vite.dev/" target="_blank">
// // //                 <img className="logo" src={viteLogo} alt="" />
// // //                 Explore Vite
// // //               </a>
// // //             </li>
// // //             <li>
// // //               <a href="https://react.dev/" target="_blank">
// // //                 <img className="button-icon" src={reactLogo} alt="" />
// // //                 Learn more
// // //               </a>
// // //             </li>
// // //           </ul>
// // //         </div>
// // //         <div id="social">
// // //           <svg className="icon" role="presentation" aria-hidden="true">
// // //             <use href="/icons.svg#social-icon"></use>
// // //           </svg>
// // //           <h2>Connect with us</h2>
// // //           <p>Join the Vite community</p>
// // //           <ul>
// // //             <li>
// // //               <a href="https://github.com/vitejs/vite" target="_blank">
// // //                 <svg
// // //                   className="button-icon"
// // //                   role="presentation"
// // //                   aria-hidden="true"
// // //                 >
// // //                   <use href="/icons.svg#github-icon"></use>
// // //                 </svg>
// // //                 GitHub
// // //               </a>
// // //             </li>
// // //             <li>
// // //               <a href="https://chat.vite.dev/" target="_blank">
// // //                 <svg
// // //                   className="button-icon"
// // //                   role="presentation"
// // //                   aria-hidden="true"
// // //                 >
// // //                   <use href="/icons.svg#discord-icon"></use>
// // //                 </svg>
// // //                 Discord
// // //               </a>
// // //             </li>
// // //             <li>
// // //               <a href="https://x.com/vite_js" target="_blank">
// // //                 <svg
// // //                   className="button-icon"
// // //                   role="presentation"
// // //                   aria-hidden="true"
// // //                 >
// // //                   <use href="/icons.svg#x-icon"></use>
// // //                 </svg>
// // //                 X.com
// // //               </a>
// // //             </li>
// // //             <li>
// // //               <a href="https://bsky.app/profile/vite.dev" target="_blank">
// // //                 <svg
// // //                   className="button-icon"
// // //                   role="presentation"
// // //                   aria-hidden="true"
// // //                 >
// // //                   <use href="/icons.svg#bluesky-icon"></use>
// // //                 </svg>
// // //                 Bluesky
// // //               </a>
// // //             </li>
// // //           </ul>
// // //         </div>
// // //       </section>

// // //       <div className="ticks"></div>
// // //       <section id="spacer"></section>
// // //     </>
// // //   )
// // // }

// // // export default App
