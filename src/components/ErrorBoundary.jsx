import { Component } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div 
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md w-full">
            <motion.div 
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-emerald-200/50 dark:border-slate-700/50 rounded-2xl p-8 shadow-xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block"
                >
                  <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  Oops! Something went wrong
                </h2>
                
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Don't worry, even the best eco-warriors face challenges! 
                  Let's get you back on track to save the planet.
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full btn bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Try Again
                  </button>
                  
                  <Link 
                    to="/"
                    className="w-full btn-outline flex items-center justify-center gap-2"
                  >
                    <Home className="h-5 w-5" />
                    Go Home
                  </Link>
                </div>
              </div>
              
              {(process.env.NODE_ENV === 'development' || import.meta?.env?.MODE === 'development') && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer text-slate-500">Error Details</summary>
                  <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo?.componentStack || ''}
                  </pre>
                </details>
              )}
            </motion.div>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary