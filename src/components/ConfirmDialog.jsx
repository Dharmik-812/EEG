import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function ConfirmDialog({ open, title = 'Are you sure?', description, confirmText = 'Delete', onConfirm, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="mx-auto mt-40 w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 shadow-xl border"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Confirmation"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-semibold text-sm">Confirm</h4>
              <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-2">
              <div className="font-medium">{title}</div>
              {description && <div className="text-sm text-slate-600 dark:text-slate-400">{description}</div>}
              <div className="mt-2 flex items-center justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1.5 rounded border">Cancel</button>
                <button onClick={() => { onConfirm?.(); onClose?.() }} className="px-3 py-1.5 rounded bg-red-600 text-white">{confirmText}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
