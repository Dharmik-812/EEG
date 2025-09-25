import { useEffect, useState, Suspense, lazy } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import GlobalLoadingWrapper from './components/GlobalLoadingWrapper.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import useTheme from './store/useTheme.js'
import './styles/environmental-theme.css'
import { useLenis } from './animations/hooks/useLenis'
import { useAnimationStore } from './store/animationStore'
import { useFramerPreset, useBarbaTransitions } from './animations'

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Challenges = lazy(() => import('./pages/Challenges.jsx'))
const Leaderboard = lazy(() => import('./pages/Leaderboard.jsx'))
const Badges = lazy(() => import('./pages/Badges.jsx'))
const Community = lazy(() => import('./pages/Community.jsx'))
const Editor = lazy(() => import('./pages/Editor.jsx'))
const PlayGame = lazy(() => import('./pages/PlayGame.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const CreateQuiz = lazy(() => import('./pages/CreateQuiz.jsx'))
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))

// Suspense fallback
function PageFallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <LoadingSpinner
        size="lg"
        message="Preparing your eco-adventure..."
        variant="leaf"
      />
    </motion.div>
  )
}

function PageWrapper({ children }) {
  const location = useLocation()

  const getTransitionPreset = () => {
    if (location.pathname === '/') return 'route.zoom'
    if (location.pathname.startsWith('/editor')) return 'route.slideLeft'
    if (location.pathname.startsWith('/challenges')) return 'route.slideUp'
    return 'route.transition'
  }

  const rt = useFramerPreset(getTransitionPreset())

  return (
    <ErrorBoundary>
      <motion.main
        id="main"
        tabIndex="-1"
        {...(rt || {})}
        className="relative min-h-[60vh]"
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
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
      </motion.main>
    </ErrorBoundary>
  )
}

export default function App() {
  useTheme()

  const location = useLocation()
  const adminMode = location.pathname.startsWith('/admin')
  const [isNavigating, setIsNavigating] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const reduced = useAnimationStore(s => s.reduced)

  useLenis({ smooth: true, enabled: !reduced })
  useBarbaTransitions({ enabled: false })

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(splashTimer)
  }, [])

  return (
    <ErrorBoundary>
      <GlobalLoadingWrapper>
        <motion.div
          className="min-h-screen antialiased font-sans relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: showSplash ? 1.5 : 0 }}
        >
          <AnimatedBackground />
          <AnimatePresence>
            {showSplash && <SplashScreen key="splash" />}
          </AnimatePresence>

          {!adminMode && <Navbar />}

          <div
            className={`${
              adminMode ? 'pt-6 px-4' : 'pt-16 sm:pt-20'
            } mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 relative`}
          >
            {isNavigating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-sky-400 z-10"
              />
            )}

            <LayoutGroup>
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
            </LayoutGroup>
          </div>

          {!adminMode && <Footer />}
        </motion.div>
      </GlobalLoadingWrapper>
    </ErrorBoundary>
  )
}
