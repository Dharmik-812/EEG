import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import LoadingSpinner from '../LoadingSpinner'

// Skeleton loader for text content
export const TextSkeleton = ({ lines = 3, className }) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
        style={{ width: `${Math.random() * 40 + 60}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      />
    ))}
  </div>
)

// Skeleton loader for message bubbles
export const MessageSkeleton = ({ count = 3, className }) => (
  <div className={clsx('space-y-4', className)}>
    {Array.from({ length: count }).map((_, i) => {
      const isOwn = Math.random() > 0.5
      return (
        <motion.div
          key={i}
          className={clsx(
            'flex gap-3 max-w-[80%]',
            isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {!isOwn && (
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          )}
          <div className="flex flex-col gap-2">
            <div className={clsx(
              'px-4 py-3 rounded-2xl animate-pulse',
              isOwn 
                ? 'bg-emerald-200 dark:bg-emerald-800' 
                : 'bg-slate-200 dark:bg-slate-700'
            )}>
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2" style={{ width: `${Math.random() * 100 + 100}px` }} />
              {Math.random() > 0.7 && (
                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded" style={{ width: `${Math.random() * 80 + 50}px` }} />
              )}
            </div>
            <div className={clsx(
              'h-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
              isOwn ? 'self-end' : 'self-start'
            )} style={{ width: '60px' }} />
          </div>
        </motion.div>
      )
    })}
  </div>
)

// Skeleton loader for user list
export const UserListSkeleton = ({ count = 5, className }) => (
  <div className={clsx('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="flex items-center gap-3 p-3 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.05 }}
      >
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${Math.random() * 60 + 80}px` }} />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${Math.random() * 80 + 60}px` }} />
        </div>
        <div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
      </motion.div>
    ))}
  </div>
)

// Full page loading state
export const PageLoading = ({ message = 'Loading...', className }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={clsx(
      'flex flex-col items-center justify-center min-h-[400px] space-y-4',
      className
    )}
  >
    <LoadingSpinner size="lg" />
    <p className="text-slate-600 dark:text-slate-400 text-sm">{message}</p>
  </motion.div>
)

// Empty state component
export const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  className 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={clsx(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      className
    )}
  >
    {Icon && (
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
    )}
    {title && (
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
    )}
    {description && (
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
        {description}
      </p>
    )}
    {action}
  </motion.div>
)

// Error state component
export const ErrorState = ({ 
  title = 'Something went wrong',
  description = 'Please try again later.',
  onRetry,
  className 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={clsx(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      className
    )}
  >
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
      {title}
    </h3>
    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
      {description}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </motion.div>
)

// Connection status indicator
export const ConnectionStatus = ({ status, className }) => {
  const statusConfig = {
    connected: {
      color: 'bg-emerald-500',
      text: 'Connected',
      pulse: false
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting...',
      pulse: true
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      pulse: false
    },
    error: {
      color: 'bg-red-500',
      text: 'Connection Error',
      pulse: false
    }
  }

  const config = statusConfig[status] || statusConfig.disconnected

  return (
    <div className={clsx('flex items-center gap-2 text-xs', className)}>
      <div className={clsx(
        'w-2 h-2 rounded-full',
        config.color,
        config.pulse && 'animate-pulse'
      )} />
      <span className="text-slate-600 dark:text-slate-400">
        {config.text}
      </span>
    </div>
  )
}

// Typing indicator
export const TypingIndicator = ({ users = [], className }) => {
  if (users.length === 0) return null

  const displayText = users.length === 1 
    ? `${users[0]} is typing...`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing...`
    : `${users[0]} and ${users.length - 1} others are typing...`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx('flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-4 py-2', className)}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
      <span>{displayText}</span>
    </motion.div>
  )
}

export default {
  TextSkeleton,
  MessageSkeleton,
  UserListSkeleton,
  PageLoading,
  EmptyState,
  ErrorState,
  ConnectionStatus,
  TypingIndicator
}
