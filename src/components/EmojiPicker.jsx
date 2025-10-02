import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'

const DEFAULT_EMOJIS = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','🤪','😝','🤤','😒','😓','😔','😕','🙃','🫠','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','🤬','🤢','🤮','🤧','😷','🤒','🤕','🫡','👍','👎','👏','🙌','🙏','💪','🔥','❤️','🧡','💛','💚','💙','💜','🤍','🤎','🖤','💯','🎉','✨','🫶'
]

export default function EmojiPicker({ isOpen, onClose, onSelect, anchor='bottom-right' }) {
  const [query, setQuery] = useState('')

  const emojis = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DEFAULT_EMOJIS
    return DEFAULT_EMOJIS.filter(e => e.toLowerCase().includes(q))
  }, [query])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute z-50 w-56 rounded-lg border bg-white/95 dark:bg-slate-900/95 shadow-xl"
          style={{ [anchor.includes('right') ? 'right' : 'left']: 0, [anchor.includes('bottom') ? 'top' : 'bottom']: '100%' }}
          role="dialog"
          aria-label="Emoji picker"
        >
          <div className="p-2 border-b">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="p-2 max-h-56 overflow-y-auto grid grid-cols-8 gap-1">
            {emojis.map(e => (
              <button
                key={e}
                onClick={() => { onSelect?.(e); onClose?.() }}
                className="text-xl hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                {e}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
