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
import RouteGuard from './components/RouteGuard.jsx'
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

// Enhanced loading fallback for better new tab experience
function EnhancedPageFallback() {
  const [showFallback, setShowFallback] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    // Only show fallback after a brief delay to avoid flash
    const timer = setTimeout(() => setShowFallback(true), 100)

    // If loading takes too long, show a more prominent indicator
    const timeoutTimer = setTimeout(() => setTimeoutReached(true), 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(timeoutTimer)
    }
  }, [])

  if (!showFallback) {
    return <div className="min-h-[60vh]" />
  }

  if (timeoutReached) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Loading your eco-adventure...</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">This is taking longer than expected. Please wait...</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return <PageFallback />
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
      <RouteGuard>
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
          <Suspense fallback={<EnhancedPageFallback />}>{children}</Suspense>
        </motion.main>
      </RouteGuard>
    </ErrorBoundary>
  )
}

export default function App() {
  useTheme()

  const location = useLocation()
  const adminMode = location.pathname.startsWith('/admin')
  const [isNavigating, setIsNavigating] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [isAppReady, setIsAppReady] = useState(false)
  const reduced = useAnimationStore(s => s.reduced)

  useLenis({ smooth: true, enabled: !reduced })
  useBarbaTransitions({ enabled: !reduced })

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  // Ensure proper initialization for new tabs
  useEffect(() => {
    // Force a small delay to ensure all stores are initialized
    const initTimer = setTimeout(() => {
      // This helps with new tab navigation by ensuring stores are ready
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'))
      }
      setIsAppReady(true)
    }, 100)
    return () => clearTimeout(initTimer)
  }, [])

  // Handle browser navigation events for better tab support
  useEffect(() => {
    const handlePopState = () => {
      // Ensure app state is consistent on browser navigation
      setIsNavigating(true)
      setTimeout(() => setIsNavigating(false), 300)
    }

    const handleVisibilityChange = () => {
      // Handle tab switching and focus changes
      if (!document.hidden) {
        // Tab became visible, ensure stores are synced
        window.dispatchEvent(new Event('storage'))
      }
    }

    // Track user interactions to prevent false "stuck" detection
    const handleUserInteraction = () => {
      window.lastUserInteraction = Date.now()
    }

    window.addEventListener('popstate', handlePopState)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('scroll', handleUserInteraction, { passive: true })
    document.addEventListener('wheel', handleUserInteraction, { passive: true })
    document.addEventListener('touchstart', handleUserInteraction, { passive: true })
    document.addEventListener('click', handleUserInteraction, { passive: true })

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('scroll', handleUserInteraction)
      document.removeEventListener('wheel', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [])

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(splashTimer)
  }, [])

  // Don't render main app until it's ready to prevent blank screens
  if (!isAppReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Initializing AverSoltix...</p>
        </div>
      </div>
    )
  }

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
            className={`${adminMode ? 'pt-6 px-4' : 'pt-16 sm:pt-20'
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
