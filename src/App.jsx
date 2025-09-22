import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import Landing from './pages/Landing.jsx'
import About from './pages/About.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Challenges from './pages/Challenges.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Badges from './pages/Badges.jsx'
import Community from './pages/Community.jsx'
import Editor from './pages/Editor.jsx'
import PlayGame from './pages/PlayGame.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Admin from './pages/Admin.jsx'
import CreateQuiz from './pages/CreateQuiz.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import Projects from './pages/Projects.jsx'
import useTheme from './store/useTheme.js'

function PageWrapper({ children }) {
  return (
    <motion.main
      id="main"
      tabIndex="-1"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/5 to-sky-500/0" />
      </motion.div>
      {children}
    </motion.main>
  )
}

export default function App() {
  useTheme() // initialize theme class syncing

  const location = useLocation()
  const adminMode = location.pathname.startsWith('/admin')
  const [showSplash, setShowSplash] = useState(true)

  // Hide splash shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen antialiased font-sans relative">
      <AnimatedBackground />
      <AnimatePresence>{showSplash && <SplashScreen key="splash" />}</AnimatePresence>
      {!adminMode && <Navbar />}
      <div className={`${adminMode ? 'pt-6' : 'pt-20'} mx-auto max-w-screen-2xl px-4`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/challenges" element={<PageWrapper><Challenges /></PageWrapper>} />
            <Route path="/leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
            <Route path="/badges" element={<PageWrapper><Badges /></PageWrapper>} />
            <Route path="/community" element={<PageWrapper><Community /></PageWrapper>} />
            <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
            <Route path="/editor" element={<PageWrapper><Editor /></PageWrapper>} />
            <Route path="/play/:id" element={<PageWrapper><PlayGame /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/create-quiz" element={<PageWrapper><CreateQuiz /></PageWrapper>} />
            <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
            <Route path="/how-it-works" element={<PageWrapper><HowItWorks /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      {!adminMode && <Footer />}
    </div>
  )
}
