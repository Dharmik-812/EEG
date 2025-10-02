import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(({ 
  type = 'text',
  label,
  placeholder,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  containerClassName,
  ...props 
}, ref) => {
  const baseClasses = 'block border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'
  
  const variants = {
    default: 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500',
    error: 'border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20 dark:text-red-100'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm', 
    lg: 'px-5 py-3 text-base'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const variant = error ? 'error' : 'default'

  return (
    <div className={clsx('space-y-1', fullWidth && 'w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className={clsx(iconSizes[size], error ? 'text-red-400' : 'text-slate-400')} />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            baseClasses,
            variants[variant],
            sizes[size],
            Icon && iconPosition === 'left' && 'pl-10',
            Icon && iconPosition === 'right' && 'pr-10',
            error && 'pr-10', // Space for error icon
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon className={clsx(iconSizes[size], error ? 'text-red-400' : 'text-slate-400')} />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className={clsx(iconSizes[size], 'text-red-400')} />
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <motion.p 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'text-xs',
            error ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Password input with toggle visibility
export const PasswordInput = forwardRef(({ 
  showPassword: controlledShowPassword,
  onTogglePassword,
  ...props 
}, ref) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false)
  
  const showPassword = controlledShowPassword !== undefined ? controlledShowPassword : internalShowPassword
  const togglePassword = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword))
  
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        iconPosition="right"
        {...props}
      />
      <button
        type="button"
        onClick={togglePassword}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'

export default Input
