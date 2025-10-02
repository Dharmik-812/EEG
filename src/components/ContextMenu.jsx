import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContextMenu({ open, x, y, items = [], onClose }) {
  useEffect(() => {
    if (!open) return
    const onDocClick = () => onClose?.()
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="fixed z-50 min-w-[180px] rounded-md border bg-white/95 dark:bg-slate-900/95 shadow-xl overflow-hidden"
          style={{ left: x, top: y }}
          role="menu"
        >
          {items.map((it, idx) => (
            <button
              key={idx}
              onClick={() => { it.onClick?.(); onClose?.() }}
              disabled={it.disabled}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${it.danger ? 'text-red-600' : ''}`}
              role="menuitem"
            >
              {it.icon && <it.icon className="h-4 w-4" />}
              <span>{it.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
