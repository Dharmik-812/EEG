import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useEffect } from 'react'
import { useToastStore } from '../store/toastStore'

const iconFor = (variant) => {
  if (variant === 'success') return CheckCircle2
  if (variant === 'error') return AlertTriangle
  return Info
}

export default function Toasts() {
  const { toasts, remove } = useToastStore()

  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => remove(t.id), 3500))
    return () => timers.forEach(clearTimeout)
  }, [toasts, remove])

  return (
    <div className="fixed top-4 right-4 z-[200] w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = iconFor(t.variant)
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto mb-2 rounded-lg border bg-white/90 dark:bg-slate-900/90 px-3 py-2 shadow-lg"
            >
              <div className="flex items-start gap-2">
                <Icon className={t.variant === 'error' ? 'text-red-500 h-4 w-4' : t.variant === 'success' ? 'text-emerald-600 h-4 w-4' : 'text-slate-500 h-4 w-4'} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.title}</div>
                  {t.description && <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{t.description}</div>}
                </div>
                <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"><X className="h-3.5 w-3.5" /></button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
