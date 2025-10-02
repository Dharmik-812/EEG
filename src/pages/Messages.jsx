import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCommunityStore, initRealtimeCommunity, subscribeTypingForThread } from '../store/communityStore'
import { usePresenceStore } from '../store/presenceStore'
import { clsx } from 'clsx'
import { Edit3, Trash2, Smile, Image as ImageIcon, Paperclip, Send, X, Settings, Pin, PinOff, Link as LinkIcon, UserCircle2 } from 'lucide-react'
import Toasts from '../components/Toasts'
import { useToastStore } from '../store/toastStore'
import EmojiPicker from '../components/EmojiPicker'
import ContextMenu from '../components/ContextMenu'
import GroupSettingsDrawer from '../components/GroupSettingsDrawer'
import ConfirmDialog from '../components/ConfirmDialog'
import GroupMembersPanel from '../components/GroupMembersPanel'
import MentionAutocomplete from '../components/MentionAutocomplete'
import ThreadReplies from '../components/ThreadReplies'
import ProfileDrawer from '../components/ProfileDrawer'

function PresenceDot({ online }) {
  return (
    <span className={clsx('inline-block w-2.5 h-2.5 rounded-full', online ? 'bg-emerald-500' : 'bg-slate-400')} />
  )
}

export default function Messages() {
  const { currentUser, users, refreshMe } = useAuthStore()
  const myId = currentUser?.id

  const {
    friends,
    friendRequests,
    requestFriend,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    listDMConversations,
    sendDM,
    getUserThreadId,
    getUnreadCount,
    markThreadRead,
    dms,
    // Groups + meta
    groups,
    groupMessages,
    listGroupsForUser,
    sendGroupMessage,
    getGroupUnreadCount,
    markGroupRead,
    // DM actions & reactions
    editDM,
    deleteDM,
    reactDM,
    // Group reactions
    reactGroupMessage,
    // Typing
    setTyping,
    isTyping,
    // Pins/meta access
    groupMeta,
    pinGroupMessage,
    unpinGroupMessage,
    deleteGroupMessage,
  } = useCommunityStore()

  const { isOnline, setOnline, setOffline, connectRealtimePresence } = usePresenceStore()

  const [tab, setTab] = useState('dms') // 'friends' | 'dms' | 'groups'
  const [active, setActive] = useState({ type: null, id: null }) // { type: 'dm'|'group', id: string|null }
  const [input, setInput] = useState('')
  const pushToast = useToastStore(s => s.push)
  const [editingTarget, setEditingTarget] = useState(null) // { threadId, messageId } or null
  const [attachedFile, setAttachedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [tick, setTick] = useState(0) // re-render ticker for typing indicator
  const [decrypted, setDecrypted] = useState({}) // { [messageId]: plaintext }
  const [friendQuery, setFriendQuery] = useState('')
  const [showGroupSettings, setShowGroupSettings] = useState(false)
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0, message: null })
  const [emoji, setEmoji] = useState({ open: false, forMessageId: null, anchor: 'top-right' })
  const [replyTarget, setReplyTarget] = useState(null) // { id, content, userId }
  const [confirm, setConfirm] = useState({ open: false, title: '', description: '', onConfirm: null })
  const [showMembers, setShowMembers] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [highlightId, setHighlightId] = useState(null)
  const [openThreads, setOpenThreads] = useState({}) // { [messageId]: boolean }
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const inputRef = useRef(null)
  const friendSearchRef = useState(null)[0]
  const [params] = useSearchParams()

  useEffect(() => {
    if (!myId) return
    // ensure session
    refreshMe().catch(() => {})
    // Mark myself online and connect realtime presence
    setOnline(myId)
    const cleanupPresence = connectRealtimePresence?.(myId)
    return () => { try { cleanupPresence?.() } catch {}; setOffline(myId) }
  }, [myId, setOnline, setOffline, refreshMe, connectRealtimePresence])

  const myFriends = useMemo(() => {
    if (!myId) return []
    const ids = friends
      .filter(f => f.userId === myId || f.friendUserId === myId)
      .map(f => (f.userId === myId ? f.friendUserId : f.userId))
    return users.filter(u => ids.includes(u.id))
  }, [friends, myId, users])

  const dmList = useMemo(() => (myId ? listDMConversations(myId) : []), [listDMConversations, myId])
  const groupList = useMemo(() => (myId ? listGroupsForUser(myId) : []), [listGroupsForUser, myId])

  const activeThreadId = active.type === 'dm' ? active.id : null
  const activeGroupId = active.type === 'group' ? active.id : null
  const activeMessages = activeThreadId ? (dms[activeThreadId] || []) : (activeGroupId ? (groupMessages[activeGroupId] || []) : [])

  const openThreadWith = (otherId) => {
    if (!myId) return
    const id = getUserThreadId(myId, otherId)
    setActive({ type: 'dm', id })
    markThreadRead({ threadId: id, userId: myId })
    setTab('dms')
  }

  const openGroup = (groupId) => {
    if (!myId) return
    setActive({ type: 'group', id: groupId })
    markGroupRead({ groupId, userId: myId })
    setTab('groups')
  }

  // typing ticker for DM header + subscribe for realtime typing
  useEffect(() => {
    if (!activeThreadId) return
    const unsubTyping = subscribeTypingForThread?.(useCommunityStore, activeThreadId)
    const iv = setInterval(() => setTick(t => t + 1), 1000)
    return () => { try { unsubTyping?.() } catch {}; clearInterval(iv) }
  }, [activeThreadId])

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target?.files || [])
    if (!files.length) return
    // allow up to 5 files, 10MB each
    const limited = files.slice(0, 5).filter(f => f.size <= 10 * 1024 * 1024)
    const newPreviews = limited.map(f => f.type?.startsWith('image/') ? URL.createObjectURL(f) : null)
    setAttachedFile(prev => (prev ? [...prev, ...limited] : [...limited]))
    setPreviewUrl(prev => (prev ? [...prev, ...newPreviews] : [...newPreviews]))
  }, [])

  // Initialize realtime for messages and open deep links to dm/group and scroll to mid if provided
  useEffect(() => {
    if (myId) {
      try {
        const cleanup = initRealtimeCommunity?.(useCommunityStore, myId)
        return () => cleanup?.()
      } catch {}
    }
  }, [myId])

  useEffect(() => {
    const dm = params.get('dm')
    const group = params.get('group')
    const mid = params.get('mid')
    if (dm && myId) {
      setActive({ type: 'dm', id: dm })
      markThreadRead({ threadId: dm, userId: myId })
      setTab('dms')
    } else if (group && myId) {
      setActive({ type: 'group', id: group })
      markGroupRead({ groupId: group, userId: myId })
      setTab('groups')
    }
    if (mid) {
      setTimeout(() => {
        const el = document.getElementById(`msg-${mid}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setHighlightId(mid)
          setTimeout(() => setHighlightId(null), 2200)
        }
      }, 200)
    }
  }, [params, markThreadRead, markGroupRead, myId, setActive, setTab])

  // Decrypt E2EE DM messages when active thread changes
  useEffect(() => {
    async function run() {
      if (!activeThreadId) { setDecrypted({}); return }
      const [a, b] = activeThreadId.split('|')
      const otherId = a === myId ? b : a
      const other = users.find(u => u.id === otherId)
      const otherPubJwk = other?.publicKeyJwk ? (typeof other.publicKeyJwk === 'string' ? JSON.parse(other.publicKeyJwk) : other.publicKeyJwk) : null
      if (!otherPubJwk) return
      const { deriveSharedAesKey, getPrivateKeyJwk, aesDecrypt } = await import('../lib/crypto')
      const priv = getPrivateKeyJwk()
      if (!priv) return
      const key = await deriveSharedAesKey(priv, otherPubJwk)
      const out = {}
      for (const m of activeMessages) {
        try {
          if (typeof m.content === 'string' && m.content.startsWith('{')) {
            const obj = JSON.parse(m.content)
            if (obj.e2ee && obj.cipherText && obj.iv) {
              out[m.id] = await aesDecrypt(key, obj.cipherText, obj.iv)
            }
          }
        } catch {}
      }
      setDecrypted(out)
    }
    run().catch(() => {})
  }, [activeThreadId, activeMessages, users, myId])

  if (!currentUser) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-700 dark:text-slate-200 font-medium">Please log in to use Messages.</p>
      </div>
    )
  }

  // Persist tab/panel state
  useEffect(() => {
    const savedTab = localStorage.getItem('messages_tab')
    if (savedTab) setTab(savedTab)
    const savedShowMembers = localStorage.getItem('messages_show_members')
    const savedShowSettings = localStorage.getItem('messages_show_settings')
    if (savedShowMembers === '1') setShowMembers(true)
    if (savedShowSettings === '1') setShowGroupSettings(true)
  }, [])
  useEffect(() => { localStorage.setItem('messages_tab', tab) }, [tab])
  useEffect(() => { localStorage.setItem('messages_show_members', showMembers ? '1' : '0') }, [showMembers])
  useEffect(() => { localStorage.setItem('messages_show_settings', showGroupSettings ? '1' : '0') }, [showGroupSettings])

  // Global shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && ['1','2','3'].includes(e.key)) {
        e.preventDefault()
        const map = { '1': 'friends', '2': 'dms', '3': 'groups' }
        setTab(map[e.key])
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const el = document.querySelector('#friend-search')
        el?.focus()
      }
      if (e.key === 'Escape') {
        setMenu(m => ({ ...m, open: false }))
        setEmoji(e => ({ ...e, open: false }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Mention highlighting render helper
  const renderContentWithMentions = useCallback((text) => {
    if (!text) return null
    const parts = []
    const memberIds = activeGroupId ? (groups.find(g => g.id === activeGroupId)?.members || []) : []
    const my = users.find(u => u.id === myId)
    const rx = /@([A-Za-z0-9_.-]+)/g
    let lastIndex = 0
    let match
    while ((match = rx.exec(text)) !== null) {
      const [full, token] = match
      const start = match.index
      if (start > lastIndex) parts.push(text.slice(lastIndex, start))
      // Try match by id or by name
      const byId = memberIds.find(id => id === token)
      const byName = users.find(u => u.name?.replace(/\s+/g, '') === token) // simple name token match
      const isMe = (token === my?.id) || (my?.name && token === my.name.replace(/\s+/g, ''))
      if (byId || byName) {
        parts.push(
          <span key={start} className={clsx('px-1 rounded', isMe ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100' : 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-white')}>@{token}</span>
        )
      } else {
        parts.push(full)
      }
      lastIndex = start + full.length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }, [activeGroupId, groups, users, myId])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Left column: tabs and lists */}
      <div className="xl:col-span-1 p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60">
        <div className="flex gap-2 mb-3">
          {['friends','dms','groups'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={clsx('px-3 py-1.5 rounded-lg text-sm', tab === t ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700')}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === 'friends' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Friends</h3>
            </div>

            {/* Friend discovery */}
            <div className="mb-3">
              <input
                id="friend-search"
                value={friendQuery}
                onChange={(e) => setFriendQuery(e.target.value)}
                placeholder="Search users by name or email... (Ctrl+K)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/40"
                aria-label="Search users"
              />
              {friendQuery.trim() && (
                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                  {users
                    .filter(u => (u.name?.toLowerCase().includes(friendQuery.toLowerCase()) || u.email?.toLowerCase().includes(friendQuery.toLowerCase())))
                    .filter(u => u.id !== myId)
                    .slice(0, 8)
                    .map(u => (
                      <li key={u.id} className="flex items-center justify-between px-3 py-1 rounded bg-white/60 dark:bg-slate-900/30 border">
                        <div className="flex items-center gap-2">
                          <PresenceDot online={isOnline(u.id)} />
                          <div className="text-sm">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                        <button onClick={() => { requestFriend({ fromUserId: myId, toUserId: u.id }); pushToast({ title: 'Request sent', description: `To ${u.name}`, variant: 'success' }) }} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white">Request</button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <ul className="space-y-2">
              {myFriends.length === 0 && <li className="text-sm text-slate-500">No friends yet.</li>}
              {myFriends.map(u => (
                <li key={u.id}>
                  <button onClick={() => openThreadWith(u.id)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-900/30 border">
                    <div className="flex items-center gap-2">
                      <PresenceDot online={isOnline(u.id)} />
                      <span className="font-medium">{u.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">Chat</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">Incoming Requests</h4>
              <ul className="space-y-2">
                {friendRequests.filter(r => r.toUserId === myId && r.status === 'pending').length === 0 && (
                  <li className="text-xs text-slate-500">No pending requests.</li>
                )}
                {friendRequests
                  .filter(r => r.toUserId === myId && r.status === 'pending')
                  .map(r => {
                    const from = users.find(u => u.id === r.fromUserId)
                    return (
                      <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-900/30 border">
                        <div className="flex items-center gap-2">
                          <PresenceDot online={isOnline(r.fromUserId)} />
                          <span className="text-sm">{from?.name || r.fromUserId}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { acceptFriendRequest({ requestId: r.id, userId: myId }); pushToast({ title: 'Friend request accepted', description: `You are now friends with ${from?.name || r.fromUserId}`, variant: 'success' }) }} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white">Accept</button>
                          <button onClick={() => { declineFriendRequest({ requestId: r.id, userId: myId }); pushToast({ title: 'Friend request declined', variant: 'info' }) }} className="text-xs px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700">Decline</button>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">Outgoing Requests</h4>
              <ul className="space-y-2">
                {friendRequests.filter(r => r.fromUserId === myId && r.status === 'pending').length === 0 && (
                  <li className="text-xs text-slate-500">No outgoing requests.</li>
                )}
                {friendRequests
                  .filter(r => r.fromUserId === myId && r.status === 'pending')
                  .map(r => {
                    const to = users.find(u => u.id === r.toUserId)
                    return (
                      <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-900/30 border">
                        <div className="flex items-center gap-2">
                          <PresenceDot online={isOnline(r.toUserId)} />
                          <span className="text-sm">{to?.name || r.toUserId}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { cancelFriendRequest({ requestId: r.id, userId: myId }); pushToast({ title: 'Friend request canceled', variant: 'info' }) }} className="text-xs px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700">Cancel</button>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>
        )}

        {tab === 'dms' && (
          <ul className="space-y-2">
            {dmList.length === 0 && <li className="text-sm text-slate-500">No conversations yet.</li>}
            {dmList.map(c => {
              const user = users.find(u => u.id === c.otherUserId)
              return (
                <li key={c.threadId}>
                  <button onClick={() => { setActive({ type: 'dm', id: c.threadId }); markThreadRead({ threadId: c.threadId, userId: myId }) }} className={clsx('w-full flex items-center justify-between px-3 py-2 rounded-lg border', activeThreadId === c.threadId ? 'bg-emerald-50/60 dark:bg-emerald-900/20' : 'bg-white/60 dark:bg-slate-900/30')}>
                    <div className="flex items-center gap-2 min-w-0">
                      <PresenceDot online={isOnline(c.otherUserId)} />
                      <div className="text-left min-w-0">
                        <div className="font-medium truncate">{user?.name || c.otherUserId}</div>
                        <div className="text-xs text-slate-500 truncate">{c.lastMessage?.content || 'No messages yet'}</div>
                      </div>
                    </div>
                    {c.unread > 0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white">{c.unread}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {tab === 'groups' && (
          <ul className="space-y-2">
            {groupList.length === 0 && <li className="text-sm text-slate-500">No groups yet. Join one from Groups.</li>}
            {groupList.map(g => (
              <li key={g.groupId}>
                <button onClick={() => openGroup(g.groupId)} className={clsx('w-full flex items-center justify-between px-3 py-2 rounded-lg border', activeGroupId === g.groupId ? 'bg-emerald-50/60 dark:bg-emerald-900/20' : 'bg-white/60 dark:bg-slate-900/30')}>
                  <div className="text-left min-w-0">
                    <div className="font-medium truncate">{g.group.name}</div>
                    <div className="text-xs text-slate-500 truncate">{g.lastMessage?.content || 'No messages yet'}</div>
                  </div>
                  {g.unread > 0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white">{g.unread}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right column: active chat */}
      <div className="xl:col-span-3 p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60 min-h-[60vh] flex flex-col">
        {!activeThreadId && !activeGroupId ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Select a DM or Group from the list.</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/40 dark:border-slate-700/60">
              {activeThreadId ? (
                (() => {
                  const [a, b] = activeThreadId.split('|')
                  const otherId = a === myId ? b : a
                  const other = users.find(u => u.id === otherId)
                  const typing = isTyping({ threadId: activeThreadId, userId: otherId }) && tick >= 0 // trigger re-eval
                  return (
                    <div className="flex items-center gap-2 min-w-0">
                      <PresenceDot online={isOnline(otherId)} />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{other?.name || otherId}</div>
                        <div className="text-xs text-slate-500 truncate" aria-live="polite">
                          {typing ? 'typing…' : (isOnline(otherId) ? 'online' : 'offline')}
                        </div>
                      </div>
                    </div>
                  )
                })()
              ) : (
                (() => {
                  const g = groups.find(x => x.id === activeGroupId)
                  return (
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{g?.name || activeGroupId}</div>
                      <div className="text-xs text-slate-500 truncate">{g?.description}</div>
                    </div>
                  )
                })()
              )}
              {/* Right header actions */}
              <div className="flex items-center gap-2">
                {currentUser && (
                  <button onClick={() => setShowProfile(true)} className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-2" aria-label="Profile">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <UserCircle2 className="h-5 w-5" />
                    )}
                    <span className="hidden sm:inline text-sm truncate max-w-[120px]">{currentUser.name}</span>
                  </button>
                )}
                {activeGroupId && (
                  <>
                    <button onClick={() => setShowMembers(true)} className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1" aria-label="Group members">
                      <UserCircle2 className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">Members</span>
                    </button>
                    <button onClick={() => setShowGroupSettings(true)} className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1" aria-label="Group settings">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">Settings</span>
                    </button>
                  </>
                )}
                {editingTarget && (
                  <div className="text-xs text-amber-600">Editing your message</div>
                )}
              </div>
            </div>

            {/* Pinned banner for groups */}
            {activeGroupId && (() => {
              const pins = groupMeta?.[activeGroupId]?.pinned || []
              if (pins.length === 0) return null
              const msgs = (groupMessages[activeGroupId] || []).filter(m => pins.includes(m.id))
              return (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="text-xs font-medium mb-1">Pinned messages</div>
                  <div className="flex gap-2 overflow-x-auto">
                    {msgs.map(m => (
                      <div key={m.id} className="px-2 py-1 rounded bg-white/80 dark:bg-slate-900/40 text-xs whitespace-nowrap flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{m.content || '[attachment]'}</span>
                        <button onClick={() => unpinGroupMessage({ groupId: activeGroupId, messageId: m.id })} className="text-amber-700 dark:text-amber-300 hover:underline">Unpin</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" role="log" aria-live="polite">
              {activeMessages.map(m => (
                <motion.div
                  key={m.id}
                  id={`msg-${m.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx('relative group max-w-[80%] px-3 py-2 rounded-xl text-sm', m.userId === myId ? 'ml-auto bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700', highlightId === m.id ? 'ring-2 ring-amber-400' : '')}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    const items = []
                    // Reply & link copy
                    items.push({ label: 'Reply', onClick: () => setReplyTarget({ id: m.id, content: m.content, userId: m.userId }) })
                    items.push({ label: 'Copy link', onClick: async () => {
                      const link = activeThreadId
                        ? `${window.location.origin}/messages?dm=${activeThreadId}&mid=${m.id}`
                        : `${window.location.origin}/messages?group=${activeGroupId}&mid=${m.id}`
                      try { await navigator.clipboard.writeText(link); pushToast({ title: 'Link copied', variant: 'success' }) } catch { pushToast({ title: 'Copy failed', variant: 'error' }) }
                    }, icon: LinkIcon })
                    if (activeThreadId && m.userId === myId) {
                      items.push({ label: 'Edit', onClick: () => { setEditingTarget({ threadId: activeThreadId, messageId: m.id }); setInput(m.content || '') }, icon: Edit3 })
                      items.push({ label: 'Delete', onClick: () => setConfirm({ open: true, title: 'Delete this message?', description: 'This action cannot be undone.', onConfirm: () => { deleteDM({ threadId: activeThreadId, messageId: m.id, userId: myId }); pushToast({ title: 'Message deleted', variant: 'info' }) } }), icon: Trash2, danger: true })
                    }
                    items.push({ label: 'Add Reaction', onClick: () => setEmoji({ open: true, forMessageId: m.id, anchor: 'top-right' }) })
                    if (activeGroupId) {
                      const isPinned = (groupMeta?.[activeGroupId]?.pinned || []).includes(m.id)
                      items.push({ label: isPinned ? 'Unpin' : 'Pin', onClick: () => isPinned ? unpinGroupMessage({ groupId: activeGroupId, messageId: m.id }) : pinGroupMessage({ groupId: activeGroupId, messageId: m.id }), icon: isPinned ? PinOff : Pin })
                      if (m.userId === myId) {
                        items.push({ label: 'Delete', onClick: () => setConfirm({ open: true, title: 'Delete this message?', description: 'This action cannot be undone.', onConfirm: () => { deleteGroupMessage({ groupId: activeGroupId, messageId: m.id, userId: myId }); pushToast({ title: 'Message deleted', variant: 'info' }) } }), icon: Trash2, danger: true })
                      }
                    }
                    setMenu({ open: true, x: e.clientX, y: e.clientY, message: m, items })
                  }}
                >
                  {/* Quote preview when replying */}
                  {m.replyTo && (() => {
                    const target = activeMessages.find(mm => mm.id === m.replyTo)
                    return (
                      <div className="mb-1 px-2 py-1 rounded bg-white/40 dark:bg-black/20 text-xs cursor-pointer" onClick={() => {
                        const el = document.getElementById(`msg-${m.replyTo}`)
                        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setHighlightId(m.replyTo); setTimeout(() => setHighlightId(null), 2200) }
                      }}>
                        Replying to: <span className="opacity-80">{target?.content ? (target.content.length > 80 ? target.content.slice(0,80)+'…' : target.content) : 'original message'}</span>
                      </div>
                    )
                  })()}

                  {/* Text with mentions */}
                  {(m.content || decrypted[m.id]) && (
                    <div className="whitespace-pre-wrap">
                      {renderContentWithMentions(decrypted[m.id] || m.content)}
                    </div>
                  )}
                  {/* Attachments grid */}
                  {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                    <div className={m.attachments.length > 1 ? 'mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2' : 'mt-2'}>
                      {m.attachments.map((att, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden border border-white/20">
                          {att.mimeType?.startsWith('image/') ? (
                            <img src={att.dataUrl || att.url} alt={att.name || 'image'} className="h-40 w-full object-cover" />
                          ) : (
                            <div className="px-3 py-2 text-xs bg-black/10 dark:bg-white/10 truncate">
                              {att.name || 'file'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Reactions */}
                  <div className="mt-1 flex items-center gap-1 flex-wrap">
                    {Array.isArray(m.reactions) && m.reactions.map(r => (
                      <button key={r.emoji} onClick={() => {
                        if (activeThreadId) {
                          reactDM({ threadId: activeThreadId, messageId: m.id, userId: myId, emoji: r.emoji })
                        } else if (activeGroupId) {
                          reactGroupMessage({ groupId: activeGroupId, messageId: m.id, userId: myId, emoji: r.emoji })
                        }
                      }} className="text-xs px-1.5 py-0.5 rounded-full bg-white/40 dark:bg-black/20">
                        {r.emoji} {r.users?.length || 0}
                      </button>
                    ))}
                    {/* quick reactions */}
                    {['👍','❤️','😂','🎉','😮'].map(emo => (
                      <button key={emo} onClick={() => {
                        if (activeThreadId) {
                          reactDM({ threadId: activeThreadId, messageId: m.id, userId: myId, emoji: emo })
                        } else if (activeGroupId) {
                          reactGroupMessage({ groupId: activeGroupId, messageId: m.id, userId: myId, emoji: emo })
                        }
                      }} className="text-xs px-1.5 py-0.5 rounded-full hover:bg-white/50 dark:hover:bg-black/30">
                        {emo}
                      </button>
                    ))}
                    {/* Emoji picker trigger */}
                    <div className="relative inline-block">
                      <button onClick={() => setEmoji({ open: true, forMessageId: m.id, anchor: 'top-right' })} className="text-xs px-1.5 py-0.5 rounded-full hover:bg-white/50 dark:hover:bg-black/30 inline-flex items-center gap-1">
                        <Smile className="h-3.5 w-3.5" /> More
                      </button>
                      {emoji.open && emoji.forMessageId === m.id && (
                        <EmojiPicker
                          isOpen={true}
                          onClose={() => setEmoji({ open: false, forMessageId: null, anchor: 'top-right' })}
                          onSelect={(e) => {
                            if (activeThreadId) {
                              reactDM({ threadId: activeThreadId, messageId: m.id, userId: myId, emoji: e })
                            } else if (activeGroupId) {
                              reactGroupMessage({ groupId: activeGroupId, messageId: m.id, userId: myId, emoji: e })
                            }
                          }}
                          anchor={emoji.anchor}
                        />
                      )}
                    </div>
                  </div>
                  {/* Replies inline toggle */}
                  {(() => {
                    const count = activeMessages.filter(xx => xx.replyTo === m.id).length
                    if (!count) return null
                    const isOpen = openThreads[m.id]
                    return (
                      <div className="mt-1">
                        <button className="text-xs underline opacity-80" onClick={() => setOpenThreads(o => ({ ...o, [m.id]: !isOpen }))}>
                          {isOpen ? 'Hide' : 'View'} {count} repl{count > 1 ? 'ies' : 'y'}
                        </button>
                        {isOpen && (
                          <div className="mt-1 pl-3 border-l-2 border-emerald-300">
                            <ThreadReplies
                              messages={activeMessages}
                              parentId={m.id}
                              onReply={(id, text) => setReplyTarget({ id, content: text })}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* DM-only actions for own messages */}
                  {activeThreadId && m.userId === myId && (
                    <div className="mt-1 flex items-center gap-2 text-xs opacity-80">
                      <button onClick={() => { setEditingTarget({ threadId: activeThreadId, messageId: m.id }); setInput(m.content || '') }} className="inline-flex items-center gap-1 hover:underline"><Edit3 className="h-3 w-3" /> Edit</button>
                      <button onClick={() => { deleteDM({ threadId: activeThreadId, messageId: m.id, userId: myId }); pushToast({ title: 'Message deleted', variant: 'info' }) }} className="inline-flex items-center gap-1 hover:underline"><Trash2 className="h-3 w-3" /> Delete</button>
                      {m.editedAt && <span className="text-[10px] italic">(edited)</span>}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!input.trim() && (!attachedFile || attachedFile.length === 0)) return
                if (activeThreadId) {
                  const [a, b] = activeThreadId.split('|')
                  const other = a === myId ? b : a
                  if (editingTarget) {
                    editDM({ threadId: activeThreadId, messageId: editingTarget.messageId, userId: myId, content: input.trim() })
                    pushToast({ title: 'Message edited', variant: 'success' })
                  } else {
                    const attachments = (attachedFile || []).map((f, idx) => ({
                      type: f.type?.startsWith('image/') ? 'image' : 'file',
                      mimeType: f.type,
                      name: f.name,
                      size: f.size,
                      dataUrl: (previewUrl || [])[idx] || undefined,
                    }))
                    sendDM({ fromUserId: myId, toUserId: other, content: input.trim(), attachments: attachments.length ? attachments : undefined, replyTo: replyTarget?.id })
                    pushToast({ title: 'Message sent', variant: 'success' })
                  }
                  setInput('')
                  setEditingTarget(null)
                  setReplyTarget(null)
                  setAttachedFile(null)
                  setPreviewUrl(null)
                  markThreadRead({ threadId: activeThreadId, userId: myId })
                } else if (activeGroupId) {
                  const attachments = (attachedFile || []).map((f, idx) => ({
                    type: f.type?.startsWith('image/') ? 'image' : 'file',
                    mimeType: f.type,
                    name: f.name,
                    size: f.size,
                    dataUrl: (previewUrl || [])[idx] || undefined,
                  }))
                  sendGroupMessage({ groupId: activeGroupId, userId: myId, content: input.trim(), attachments: attachments.length ? attachments : undefined, replyTo: replyTarget?.id })
                  pushToast({ title: 'Message sent to group', variant: 'success' })
                  setInput('')
                  setAttachedFile(null)
                  setReplyTarget(null)
                  setPreviewUrl(null)
                  markGroupRead({ groupId: activeGroupId, userId: myId })
                }
              }}
              className="mt-3 flex items-end gap-2"
              role="form"
            >
              {/* Replying banner */}
              {replyTarget && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-10 left-0 right-0 mx-2 px-3 py-2 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                  <div className="truncate">Replying to: {replyTarget.content ? (replyTarget.content.length > 80 ? replyTarget.content.slice(0,80)+'…' : replyTarget.content) : 'message'}</div>
                  <button type="button" className="ml-2 px-1 py-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800" onClick={() => setReplyTarget(null)}>Cancel</button>
                </motion.div>
              )}
              {/* Attach */}
              <label className="p-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-700/60 cursor-pointer" aria-label="Attach file(s)">
                <input type="file" className="hidden" onChange={handleFileChange} multiple />
                <Paperclip className="h-4 w-4" />
              </label>
              <div className="flex-1 min-w-0 relative" onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }} onDrop={(e) => {
                e.preventDefault()
                const files = Array.from(e.dataTransfer.files || []).slice(0, 5)
                if (!files.length) return
                const newPrevs = files.map(f => f.type?.startsWith('image/') ? URL.createObjectURL(f) : null)
                setAttachedFile(prev => (prev ? [...prev, ...files] : [...files]))
                setPreviewUrl(prev => (prev ? [...prev, ...newPrevs] : [...newPrevs]))
              }}>
                {(previewUrl && Array.isArray(previewUrl) && previewUrl.length > 0) && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {previewUrl.map((url, idx) => (
                      <div key={idx} className="relative inline-flex items-center gap-2 px-2 py-1 rounded bg-slate-200 dark:bg-slate-700">
                        {url ? (
                          <img src={url} alt={`preview-${idx}`} className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <span className="text-xs">{(attachedFile || [])[idx]?.name}</span>
                        )}
                        <button type="button" onClick={() => {
                          setAttachedFile(arr => (arr || []).filter((_, i) => i !== idx))
                          setPreviewUrl(arr => (arr || []).filter((_, i) => i !== idx))
                        }} className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <MentionAutocomplete
                  isOpen={mentionOpen}
                  items={(activeGroupId ? (groups.find(g => g.id === activeGroupId)?.members || []) : [myId]).map(id => ({ id, name: (users.find(u => u.id === id)?.name) || id }))}
                  query={mentionQuery}
                  index={mentionIndex}
                  onSelect={(it) => {
                    const el = inputRef.current
                    if (!el) return
                    const val = input
                    const caret = el.selectionStart || val.length
                    const pre = val.slice(0, caret)
                    const atPos = Math.max(pre.lastIndexOf('@'), pre.lastIndexOf('@{'))
                    const before = val.slice(0, atPos)
                    const after = val.slice(caret)
                    const token = `@{${it.name}}`
                    const next = before + token + after
                    setInput(next)
                    setMentionOpen(false)
                    // set caret after inserted token
                    const newPos = (before + token).length
                    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(newPos, newPos) })
                  }}
                />
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    const val = e.target.value
                    setInput(val)
                    // mention detection: find last '@' token before caret
                    const caret = e.target.selectionStart || val.length
                    const pre = val.slice(0, caret)
                    const atIdx = Math.max(pre.lastIndexOf('@'), pre.lastIndexOf('@{'))
                    let query = ''
                    if (atIdx >= 0) {
                      const after = pre.slice(atIdx + 1)
                      const ws = after.search(/\s|$/)
                      query = after.slice(0, ws >= 0 ? ws : undefined).replace(/^\{/, '')
                    }
                    if (query && query.length >= 1) {
                      setMentionOpen(true)
                      setMentionQuery(query)
                      setMentionIndex(0)
                    } else {
                      setMentionOpen(false)
                      setMentionQuery('')
                    }
                    if (activeThreadId) {
                      setTyping({ threadId: activeThreadId, userId: myId })
                    }
                  }}
                  onKeyDown={(e) => {
                    if (mentionOpen) {
                      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => i + 1); return }
                      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => Math.max(0, i - 1)); return }
                      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('mention-item-'+mentionIndex)?.click(); return }
                      if (e.key === 'Escape') { setMentionOpen(false); return }
                    }
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      e.currentTarget.form?.requestSubmit()
                    }
                  }}
                  placeholder={editingTarget ? 'Edit your message…' : 'Type a message…'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/40 min-w-0"
                  rows={2}
                  aria-label="Message input"
                />
              </div>
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1" aria-label={editingTarget ? 'Update message' : 'Send message'}>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">{editingTarget ? 'Update' : 'Send'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    <>
      <ContextMenu
        open={menu.open}
        x={menu.x}
        y={menu.y}
        items={menu.items || []}
        onClose={() => setMenu(m => ({ ...m, open: false }))}
      />
      {activeGroupId && (
        <>
          <GroupSettingsDrawer isOpen={showGroupSettings} onClose={() => setShowGroupSettings(false)} groupId={activeGroupId} />
          <GroupMembersPanel isOpen={showMembers} onClose={() => setShowMembers(false)} groupId={activeGroupId} />
        </>
      )}
      <ProfileDrawer isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm(c => ({ ...c, open: false }))}
      />
      <Toasts />
    </>
    </div>
  )
}
