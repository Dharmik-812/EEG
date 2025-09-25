import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RefreshCw, Home, AlertCircle } from 'lucide-react'

// This component helps handle new tab navigation issues
export default function RouteGuard({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isStuck, setIsStuck] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  // Track scrolling activity
  useEffect(() => {
    let scrollTimeout
    const handleScroll = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  useEffect(() => {
    // Reset stuck state on route change
    setIsStuck(false)
    setRetryCount(0)

    // Only set stuck timer for actual navigation, not scrolling
    // Check if this is a real route change by comparing with previous pathname
    const currentPath = location.pathname
    const isRouteChange = currentPath !== window.location.pathname

    if (isRouteChange) {
      // Set a timer to detect if the route is stuck loading only for actual navigation
      const stuckTimer = setTimeout(() => {
        // Only trigger if we're still on the same route AND it's been a while since last interaction
        const timeSinceLastInteraction = Date.now() - (window.lastUserInteraction || 0)
        const isPageInteractive = document.readyState === 'complete'
        const hasContent = document.body && document.body.children.length > 0

        // Only show stuck error if:
        // 1. We're on the same route
        // 2. No user interaction for 10+ seconds
        // 3. Page is not interactive OR has no content
        // 4. User is not currently scrolling
        if (location.pathname === window.location.pathname &&
          timeSinceLastInteraction > 10000 &&
          (!isPageInteractive || !hasContent) &&
          !isScrolling) {
          setIsStuck(true)
        }
      }, 10000) // Increased to 10 seconds for actual route changes

      return () => clearTimeout(stuckTimer)
    }
  }, [location.pathname, isScrolling])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setIsStuck(false)

    // Try different recovery strategies based on retry count
    if (retryCount === 0) {
      // First retry: reload current route
      window.location.reload()
    } else if (retryCount === 1) {
      // Second retry: navigate to same route programmatically
      navigate(location.pathname, { replace: true })
    } else {
      // Third retry: go to home page
      navigate('/', { replace: true })
    }
  }

  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  if (isStuck) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex items-center justify-center p-6"
      >
        <div className="text-center max-w-md mx-auto">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <AlertCircle className="w-full h-full text-amber-500" />
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Navigation Issue Detected
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This page seems to be taking longer than expected to load. This sometimes happens when opening AverSoltix in a new tab.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
            >
              <RefreshCw className="h-5 w-5" />
              {retryCount === 0 ? 'Reload Page' : retryCount === 1 ? 'Try Again' : 'Reset Navigation'}
            </button>

            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              <Home className="h-5 w-5" />
              Go to Homepage
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Retry attempt: {retryCount + 1}/3
          </p>
        </div>
      </motion.div>
    )
  }

  return children
}