import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, RotateCcw, Lock, Unlock, Crown, X, User } from 'lucide-react'
import { useCommunityStore } from '../store/communityStore'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

export default function GroupSettingsDrawer({ isOpen, onClose, groupId }) {
  const pushToast = useToastStore(s => s.push)
  const { currentUser } = useAuthStore()
  const {
    getGroupById,
    updateGroupSettings,
    setGroupRole,
    regenerateGroupInvite,
    unpinGroupMessage,
    leaveGroup,
    groupMeta,
    groupMessages,
  } = useCommunityStore()

  const group = getGroupById(groupId)
  const [name, setName] = useState(group?.name || '')
  const [description, setDescription] = useState(group?.description || '')
  const [isPrivate, setIsPrivate] = useState(!!group?.isPrivate)

  // Sync when opening/changes
  useMemo(() => {
    setName(group?.name || '')
    setDescription(group?.description || '')
    setIsPrivate(!!group?.isPrivate)
  }, [groupId, group])

  if (!group) return null

  const myId = currentUser?.id
  const myRole = group.roles?.[myId] || 'member'
  const isAdmin = myRole === 'admin'

  const pinnedIds = groupMeta?.[group.id]?.pinned || []
  const pinned = (groupMessages[group.id] || []).filter(m => pinnedIds.includes(m.id))

  const saveBasics = () => {
    updateGroupSettings({ groupId: group.id, name, description, isPrivate })
    pushToast({ title: 'Group updated', variant: 'success' })
  }

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(group.inviteCode)
      pushToast({ title: 'Invite code copied', variant: 'success' })
    } catch {
      pushToast({ title: 'Copy failed', variant: 'error' })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="ml-auto h-full w-full max-w-lg bg-white dark:bg-slate-900 border-l"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Group settings"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Group Settings</h3>
              <button onClick={onClose} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-4 space-y-6">
              {/* Basics */}
              <section>
                <h4 className="font-medium mb-2">Basics</h4>
                <div className="space-y-2">
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" placeholder="Group name" />
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" placeholder="Description" />
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                    <span className="inline-flex items-center gap-1">{isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />} {isPrivate ? 'Private' : 'Public'}</span>
                  </label>
                  <div>
                    <button onClick={saveBasics} className="mt-2 px-3 py-1.5 rounded bg-emerald-600 text-white">Save</button>
                  </div>
                </div>
              </section>

              {/* Invite */}
              <section>
                <h4 className="font-medium mb-2">Invite</h4>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">{group.inviteCode}</code>
                  <button onClick={copyInvite} className="px-2 py-1 rounded border inline-flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy</button>
                  <button disabled={!isAdmin} onClick={() => { regenerateGroupInvite({ groupId: group.id }); pushToast({ title: 'Invite regenerated', variant: 'success' }) }} className="px-2 py-1 rounded border inline-flex items-center gap-1 disabled:opacity-50"><RotateCcw className="h-3.5 w-3.5" /> Regenerate</button>
                </div>
              </section>

              {/* Members */}
              <section>
                <h4 className="font-medium mb-2">Members</h4>
                <ul className="space-y-2">
                  {(group.members || []).map(uid => {
                    const role = group.roles?.[uid] || 'member'
                    const isMe = uid === myId
                    return (
                      <li key={uid} className="flex items-center justify-between px-3 py-2 rounded border">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{uid}{isMe ? ' (you)' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{role === 'admin' && <Crown className="h-3 w-3 text-amber-500" />} {role}</span>
                          {isAdmin && !isMe && (
                            role === 'admin' ? (
                              <button onClick={() => { setGroupRole({ groupId: group.id, userId: uid, role: 'member' }); pushToast({ title: 'Demoted to member', variant: 'info' }) }} className="px-2 py-1 rounded border">Make member</button>
                            ) : (
                              <button onClick={() => { setGroupRole({ groupId: group.id, userId: uid, role: 'admin' }); pushToast({ title: 'Promoted to admin', variant: 'success' }) }} className="px-2 py-1 rounded border inline-flex items-center gap-1"><Crown className="h-3 w-3 text-amber-500" /> Make admin</button>
                            )
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>

              {/* Pinned */}
              <section>
                <h4 className="font-medium mb-2">Pinned messages ({pinned.length})</h4>
                {pinned.length === 0 ? (
                  <div className="text-sm text-slate-500">No pinned messages.</div>
                ) : (
                  <ul className="space-y-2">
                    {pinned.map(m => (
                      <li key={m.id} className="px-3 py-2 rounded border bg-white/60 dark:bg-slate-900/40 text-sm flex justify-between items-center">
                        <span className="truncate">{m.content || '[attachment]'}</span>
                        <button disabled={!isAdmin} onClick={() => { unpinGroupMessage({ groupId: group.id, messageId: m.id }); pushToast({ title: 'Unpinned', variant: 'info' }) }} className="text-xs px-2 py-1 rounded border disabled:opacity-50">Unpin</button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Danger */}
              <section>
                <h4 className="font-medium mb-2">Danger zone</h4>
                <button onClick={() => { leaveGroup({ groupId: group.id, userId: myId }); pushToast({ title: 'Left group', variant: 'info' }); onClose?.() }} className="px-3 py-1.5 rounded bg-red-600 text-white">Leave group</button>
              </section>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
