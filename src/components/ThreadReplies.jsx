import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function ThreadReplies({ messages, parentId, onReply }) {
  const replies = useMemo(() => messages.filter(m => m.replyTo === parentId), [messages, parentId])
  if (!replies.length) return null
  return (
    <div className="space-y-2">
      {replies.map(m => (
        <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={clsx('px-3 py-2 rounded-xl text-xs bg-slate-200/70 dark:bg-slate-700/70')}>
          {m.content}
          <div className="mt-1 text-[11px] opacity-80">
            <button className="underline" onClick={() => onReply?.(parentId, m.content)}>Reply</button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
