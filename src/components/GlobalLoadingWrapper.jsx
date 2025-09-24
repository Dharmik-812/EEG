import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import AnimatedLoadingScreen from './AnimatedLoadingScreen'
import SimpleLoadingScreen from './SimpleLoadingScreen'
import ErrorBoundary from './ErrorBoundary'

const GlobalLoadingWrapper = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showApp, setShowApp] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    // Show loading screen immediately
    setIsInitialized(true)
    
    // Simulate app initialization tasks
    const initializeApp = async () => {
      try {
        // Ensure minimum 3-second loading time for the full animation
        const minLoadTime = 3000
        const startTime = Date.now()
        
        // Simulate loading tasks (you can add real initialization here)
        await Promise.all([
          // Preload critical resources
          new Promise(resolve => setTimeout(resolve, 100)),
          // Initialize stores
          new Promise(resolve => setTimeout(resolve, 200)),
          // Setup animations
          new Promise(resolve => setTimeout(resolve, 300)),
        ])
        
        // Ensure we've shown the loading screen for at least 3 seconds
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadTime - elapsedTime)
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime))
        }
        
        // Loading tasks complete - this will trigger the loading screen completion
      } catch (error) {
        console.error('App initialization failed:', error)
        // Still proceed to show loading screen
      }
    }

    initializeApp()
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setShowApp(true)
    }, 100)
  }

  // Add responsive viewport meta handling
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]')
    if (metaViewport) {
      metaViewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
      )
    }

    // Add mobile-specific meta tags if missing
    const addMetaTag = (name, content) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta')
        meta.name = name
        meta.content = content
        document.head.appendChild(meta)
      }
    }

    addMetaTag('mobile-web-app-capable', 'yes')
    addMetaTag('apple-mobile-web-app-capable', 'yes')
    addMetaTag('apple-mobile-web-app-status-bar-style', 'default')
    addMetaTag('theme-color', '#10b981')

    // Handle safe area insets for devices with notches
    const rootElement = document.documentElement
    rootElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)')
    rootElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)')
    rootElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)')
    rootElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)')
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && isInitialized && (
          <ErrorBoundary 
            key="loading"
            onError={() => setUseFallback(true)}
          >
            {useFallback ? (
              <SimpleLoadingScreen 
                onComplete={handleLoadingComplete}
              />
            ) : (
              <AnimatedLoadingScreen 
                onComplete={handleLoadingComplete}
              />
            )}
          </ErrorBoundary>
        )}
      </AnimatePresence>
      
      {/* App content with responsive wrapper - only show after loading is complete */}
      {showApp && (
        <div 
          className="min-h-screen w-full"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {children}
        </div>
      )}
    </>
  )
}

export default GlobalLoadingWrapper