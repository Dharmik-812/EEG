import { AnimatePresence, motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePresenceStore } from '../store/presenceStore'
import { useCommunityStore } from '../store/communityStore'

function PresenceDot({ online }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
}

export default function GroupMembersPanel({ isOpen, onClose, groupId }) {
  const { isOnline } = usePresenceStore()
  const { currentUser, users } = useAuthStore()
  const { getGroupById } = useCommunityStore()
  const group = getGroupById(groupId)

  const items = (group?.members || []).map(uid => {
    const u = users.find(x => x.id === uid)
    return { id: uid, name: u?.name || uid, role: group?.roles?.[uid] || 'member' }
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="fixed right-0 top-0 h-full w-full max-w-xs z-50 bg-white dark:bg-slate-900 border-l"
          onClick={onClose}
          role="dialog"
          aria-label="Group members"
        >
          <div className="p-4 border-b">
            <h4 className="font-semibold">Members ({items.length})</h4>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-56px)]" onClick={(e) => e.stopPropagation()}>
            {items.map(m => (
              <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded border bg-white/70 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 min-w-0">
                  <PresenceDot online={isOnline(m.id)} />
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{m.name}{m.id === currentUser?.id ? ' (you)' : ''}</div>
                    <div className="text-xs text-slate-500 truncate">{m.id}</div>
                  </div>
                </div>
                <div className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {m.role === 'admin' && <Crown className="h-3 w-3 text-amber-500" />} {m.role}
                </div>
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
