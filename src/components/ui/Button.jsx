import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import LoadingSpinner from '../LoadingSpinner'

const Button = forwardRef(({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  children, 
  className,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed relative overflow-hidden'
  
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400 shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500 disabled:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
    outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500 disabled:border-emerald-300 disabled:text-emerald-300 dark:hover:bg-emerald-900/20',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500 disabled:text-slate-400 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400 shadow-lg hover:shadow-xl',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400 shadow-lg hover:shadow-xl'
  }
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4', 
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  }

  const isDisabled = loading || disabled

  return (
    <motion.button
      ref={ref}
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <LoadingSpinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
        </div>
      )}
      
      {/* Content */}
      <div className={clsx('flex items-center gap-2', loading && 'opacity-0')}>
        {Icon && iconPosition === 'left' && (
          <Icon className={iconSizes[size]} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className={iconSizes[size]} />
        )}
      </div>
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button
