import { motion, AnimatePresence } from 'framer-motion'

export default function MentionAutocomplete({ isOpen, items = [], query = '', index = 0, onSelect }) {
  const filtered = (items || []).filter(it =>
    it.name?.toLowerCase().includes(query.toLowerCase()) || it.id?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  return (
    <AnimatePresence>
      {isOpen && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="absolute z-50 mt-1 w-64 rounded-md border bg-white/95 dark:bg-slate-900/95 shadow-xl"
          role="listbox"
        >
          {filtered.map((it, i) => (
            <button
              id={`mention-item-${i}`}
              key={it.id}
              onClick={() => onSelect?.(it)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${i===index ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              role="option"
              aria-selected={i===index}
            >
              <div className="font-medium truncate">{it.name}</div>
              <div className="text-xs text-slate-500 truncate">{it.id}</div>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
