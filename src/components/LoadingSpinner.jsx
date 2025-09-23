import { motion } from 'framer-motion'
import { Leaf, Droplets, Sun, Recycle } from 'lucide-react'

const LoadingSpinner = ({ size = 'md', message = 'Loading...', variant = 'leaf' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  }

  const IconComponent = {
    leaf: Leaf,
    droplets: Droplets,
    sun: Sun,
    recycle: Recycle
  }[variant] || Leaf

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 p-0.5`}>
          <div className="bg-white dark:bg-slate-900 rounded-full h-full w-full flex items-center justify-center">
            <IconComponent className={`${sizeClasses[size]} text-emerald-500 -m-2`} />
          </div>
        </div>
        
        {/* Floating particles */}
        <motion.div
          className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 h-1.5 w-1.5 rounded-full bg-sky-400"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>
      
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          {message}
        </div>
        <motion.div
          className="flex justify-center gap-1 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-1 w-1 rounded-full bg-emerald-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

// Skeleton loader for page content
export const PageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Card skeleton
export const CardSkeleton = () => {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
      </div>
    </div>
  )
}

export default LoadingSpinner