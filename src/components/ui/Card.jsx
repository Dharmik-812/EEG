import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Card = forwardRef(({ 
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  children,
  className,
  ...props 
}, ref) => {
  const baseClasses = 'rounded-2xl transition-all duration-200'
  
  const variants = {
    default: 'bg-white/70 dark:bg-slate-800/60',
    solid: 'bg-white dark:bg-slate-800',
    glass: 'bg-white/40 backdrop-blur-sm dark:bg-slate-800/40',
    gradient: 'bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-800 dark:to-slate-900'
  }
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const borders = {
    none: '',
    default: 'border border-emerald-200/40 dark:border-slate-700/60',
    strong: 'border-2 border-emerald-200 dark:border-slate-700'
  }

  const borderClass = border === true ? borders.default : border === false ? borders.none : borders[border] || borders.default

  return (
    <motion.div
      ref={ref}
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        shadows[shadow],
        borderClass,
        hover && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        className
      )}
      whileHover={hover ? { y: -2 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

// Card Header Component
export const CardHeader = ({ title, subtitle, action, className, ...props }) => (
  <div className={clsx('flex items-center justify-between mb-4', className)} {...props}>
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
)

// Card Content Component
export const CardContent = ({ children, className, ...props }) => (
  <div className={clsx('text-slate-700 dark:text-slate-300', className)} {...props}>
    {children}
  </div>
)

// Card Footer Component
export const CardFooter = ({ children, className, ...props }) => (
  <div className={clsx('mt-4 pt-4 border-t border-slate-200 dark:border-slate-700', className)} {...props}>
    {children}
  </div>
)

export default Card
