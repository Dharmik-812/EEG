import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { api } from '../lib/api'
import {
  uploadMessageAttachment,
  presenceManager,
  typingManager,
  realtimeManager,
  getConnectionState,
  onConnectionStateChange,
  getSupabase
} from '../lib/supabaseClient'
import {
  subscribeDmInserts,
  subscribeGroupInserts,
  ensureTypingChannel
} from '../lib/supabase'

const seedGroups = [
  {
    id: 'grp-climate',
    name: 'Climate Change',
    description: 'Discuss climate science, policy, and solutions.',
    tags: ['Climate Change', 'Policy'],
    isPrivate: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'admin-1',
    members: ['admin-1'],
    activityScore: 8,
  },
  {
    id: 'grp-recycling',
    name: 'Recycling & Zero Waste',
    description: 'Tips, tools, and local initiatives for reducing waste.',
    tags: ['Recycling', 'Zero Waste'],
    isPrivate: false,
    createdAt: '2024-07-12T12:00:00Z',
    createdBy: 'college-student-1',
    members: ['college-student-1'],
    activityScore: 5,
  }
]

const newId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export const useCommunityStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Connection state
        connectionState: 'disconnected',
        isInitialized: false,
        
        // Data
        groups: seedGroups,
        groupMessages: {}, // { [groupId]: Array<{ id, userId, content, type, createdAt, attachments?: any[] }> }
        groupMeta: {}, // { [groupId]: { unread: { [userId]: number }, lastReadAt: { [userId]: number }, pinned: string[] } }
        friends: [], // Array<{ id, userId, friendUserId, since }>
        friendRequests: [], // Array<{ id, fromUserId, toUserId, status: 'pending'|'accepted'|'declined', createdAt }>
        dms: {}, // { [threadId]: Array<message> }, threadId is sorted pair "userA|userB"
        dmMeta: {}, // { [threadId]: { unread: { [userId]: number }, lastReadAt: { [userId]: number } } }
        typing: {}, // { [threadId]: { [userId]: number /* last typing timestamp */ } }
        reports: [], // Array<{ id, byUserId, targetType, targetId, reason, evidenceUrls: string[], createdAt, status }>
        
        // Loading states
        loading: {
          dms: false,
          groups: false,
          friends: false,
          messages: {}
        },
        
        // Error states
        errors: {
          dms: null,
          groups: null,
          friends: null,
          messages: {}
        },

        // Derived helpers
      getGroupById: (groupId) => get().groups.find(g => g.id === groupId) || null,
      getUserThreadId: (a, b) => [a, b].sort().join('|'),

      // Ensure DM meta exists
      _ensureDMMeta: (threadId) => {
        const meta = get().dmMeta[threadId]
        if (!meta) {
          set(state => ({
            dmMeta: {
              ...state.dmMeta,
              [threadId]: { unread: {}, lastReadAt: {} }
            }
          }))
        }
      },

      // Ensure Group meta exists
      _ensureGroupMeta: (groupId) => {
        const meta = get().groupMeta[groupId]
        if (!meta) {
          set(state => ({
            groupMeta: {
              ...state.groupMeta,
              [groupId]: { unread: {}, lastReadAt: {}, pinned: [] }
            }
          }))
        }
      },

      // Typing indicators for DMs
      setTyping: ({ threadId, userId }) => {
        set(state => ({
          typing: {
            ...state.typing,
            [threadId]: {
              ...(state.typing[threadId] || {}),
              [userId]: Date.now()
            }
          }
        }))
        try { typingManager.sendTyping(threadId, userId) } catch {}
      },
      isTyping: ({ threadId, userId, windowMs = 3000 }) => {
        const t = get().typing?.[threadId]?.[userId]
        if (!t) return false
        return Date.now() - t < windowMs
      },

      // Return user's DM conversations with last message and unread count
      listDMConversations: async (userId) => {
        // Fetch from backend and map to local structure
        const res = await api.dmList()
        const convs = res.conversations || []
        return convs.map(c => ({
          threadId: c.threadKey,
          otherUserId: c.otherUserId,
          lastMessage: c.lastMessage ? { id: c.lastMessage.id, userId: c.lastMessage.userId, content: c.lastMessage.content, createdAt: c.lastMessage.createdAt } : null,
          unread: c.unread || 0,
        }))
      },

      // Unread helpers
      getUnreadCount: (userId, threadId) => {
        const meta = get().dmMeta[threadId]
        if (!meta) return 0
        return meta.unread[userId] || 0
      },
      markThreadRead: async ({ threadId, userId }) => {
        try { await api.dmRead(threadId) } catch {}
        get()._ensureDMMeta(threadId)
        set(state => ({
          dmMeta: {
            ...state.dmMeta,
            [threadId]: {
              unread: { ...(state.dmMeta[threadId]?.unread || {}), [userId]: 0 },
              lastReadAt: { ...(state.dmMeta[threadId]?.lastReadAt || {}), [userId]: Date.now() }
            }
          }
        }))
      },

      // Friend request helpers
      getPendingRequestsForUser: (userId) => get().friendRequests.filter(r => r.toUserId === userId && r.status === 'pending'),
      getOutgoingRequestsForUser: (userId) => get().friendRequests.filter(r => r.fromUserId === userId && r.status === 'pending'),

      // Groups
      createGroup: ({ name, description, tags = [], isPrivate = false }, currentUserId) => {
        if (!currentUserId) throw new Error('Must be logged in to create group')
        const group = {
          id: newId('grp'),
          name,
          description,
          tags,
          isPrivate,
          createdAt: new Date().toISOString(),
          createdBy: currentUserId,
          members: [currentUserId],
          roles: { [currentUserId]: 'admin' },
          activityScore: 0,
          inviteCode: newId('invite'),
        }
        set(state => ({ groups: [group, ...state.groups] }))
        // init group meta
        get()._ensureGroupMeta(group.id)
        return group
      },
      joinGroup: async ({ groupId, userId }) => {
        await api.groupJoin(groupId)
        // best-effort local update
        set(state => ({
          groups: state.groups.map(g => g.id === groupId && !g.members.includes(userId)
            ? { ...g, members: [...g.members, userId], roles: { ...(g.roles || {}), [userId]: 'member' } }
            : g
          )
        }))
        get()._ensureGroupMeta(groupId)
      },
      leaveGroup: async ({ groupId, userId }) => {
        try { await api.groupLeave(groupId) } catch {}
        set(state => ({
          groups: state.groups.map(g => g.id === groupId
            ? { ...g, members: g.members.filter(id => id !== userId) }
            : g
          )
        }))
      },
      searchGroups: async ({ query = '', sort = 'trending' }) => {
        const q = query.trim()
        try {
          const res = await api.groups(q)
          const groups = Array.isArray(res) ? res : (res.groups || [])
          const sorted = (() => {
            if (sort === 'newest') return [...groups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            if (sort === 'active') return [...groups].sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
            return [...groups].sort((a, b) => (b.activityScore || 0) - (a.activityScore || 0))
          })()
          return sorted
        } catch {
          // fallback to local
          const ql = q.toLowerCase()
          const loc = get().groups.filter(g => !q || g.name.toLowerCase().includes(ql) || g.description.toLowerCase().includes(ql) || (g.tags || []).some(t => t.toLowerCase().includes(ql)))
          if (sort === 'newest') return [...loc].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          if (sort === 'active') return [...loc].sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
          return [...loc].sort((a, b) => (b.activityScore || 0) - (a.activityScore || 0))
        }
      },

      // Group chat (text only placeholder; later integrate realtime)
      sendGroupMessage: async ({ groupId, userId, content, type = 'text', attachments, replyTo }) => {
        // Upload attachments to Supabase Storage if available, replace dataUrl with URL
        let uploaded = attachments
        try {
          const sb = getSupabase()
          if (sb && Array.isArray(attachments) && attachments.length) {
            const results = await Promise.all(attachments.map(async (att) => {
              if (att?.dataUrl) {
                const url = await uploadMessageAttachment({
                  userId,
                  fileName: att.name,
                  dataUrl: att.dataUrl,
                  mimeType: att.mimeType || att.type,
                  scope: 'group'
                })
                return { ...att, url, dataUrl: undefined }
              }
              return att
            }))
            uploaded = results
          }
        } catch (e) { console.warn('Attachment upload failed; sending as-is', e) }
        const payload = { content, attachments: uploaded, replyToId: replyTo }
        const res = await api.groupSend(groupId, payload)
        const msg = { id: res.id || newId('msg'), userId, content: payload.content, type, attachments: uploaded, replyTo, createdAt: res.createdAt || new Date().toISOString(), reactions: [] }
        set(state => ({
          groupMessages: { ...state.groupMessages, [groupId]: [...(state.groupMessages[groupId] || []), msg] }
        }))
        // bump activity
        set(state => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, activityScore: (g.activityScore || 0) + 1 } : g) }))
        get()._ensureGroupMeta(groupId)
        return msg
      },

      // Friends & DMs
      addFriend: ({ userId, friendUserId }) => {
        const exists = get().friends.some(f => (f.userId === userId && f.friendUserId === friendUserId) || (f.userId === friendUserId && f.friendUserId === userId))
        if (exists) return
        const rel = { id: newId('fr'), userId, friendUserId, since: new Date().toISOString() }
        set(state => ({ friends: [rel, ...state.friends] }))
        return rel
      },

      // Group helpers: unread counts and read markers
      getGroupUnreadCount: ({ groupId, userId }) => {
        const meta = get().groupMeta[groupId]
        if (!meta) return 0
        return meta.unread[userId] || 0
      },
      markGroupRead: ({ groupId, userId }) => {
        get()._ensureGroupMeta(groupId)
        set(state => ({
          groupMeta: {
            ...state.groupMeta,
            [groupId]: {
              unread: { ...(state.groupMeta[groupId]?.unread || {}), [userId]: 0 },
              lastReadAt: { ...(state.groupMeta[groupId]?.lastReadAt || {}), [userId]: Date.now() },
              pinned: state.groupMeta[groupId]?.pinned || []
            }
          }
        }))
      },

      // Group reactions
      reactGroupMessage: async ({ groupId, messageId, userId, emoji }) => {
        await api.groupReact(messageId, emoji)
        set(state => ({
          groupMessages: {
            ...state.groupMessages,
            [groupId]: (state.groupMessages[groupId] || []).map(m => {
              if (m.id !== messageId) return m
              const reactions = Array.isArray(m.reactions) ? m.reactions : []
              const existing = reactions.find(r => r.emoji === emoji)
              let updated
              if (existing) {
                const hasUser = existing.users?.includes(userId)
                updated = hasUser
                  ? reactions.map(r => r.emoji === emoji ? { ...r, users: r.users.filter(u => u !== userId) } : r)
                  : reactions.map(r => r.emoji === emoji ? { ...r, users: [...(r.users || []), userId] } : r)
              } else {
                updated = [...reactions, { emoji, users: [userId] }]
              }
              return { ...m, reactions: updated }
            })
          }
        }))
      },

      deleteGroupMessage: ({ groupId, messageId, userId }) => {
        const group = get().groups.find(g => g.id === groupId)
        const isAdmin = group?.roles?.[userId] === 'admin'
        set(state => ({
          groupMessages: {
            ...state.groupMessages,
            [groupId]: (state.groupMessages[groupId] || []).filter(m => {
              if (m.id !== messageId) return true
              // allow delete if owner or admin
              return !(m.userId === userId || isAdmin)
            })
          }
        }))
      },

      // Group settings and roles
      updateGroupSettings: async ({ groupId, name, description, isPrivate }) => {
        try { await api.groupSettings(groupId, { name, description, isPrivate }) } catch {}
        set(state => ({
          groups: state.groups.map(g => g.id === groupId ? {
            ...g,
            name: name ?? g.name,
            description: description ?? g.description,
            isPrivate: typeof isPrivate === 'boolean' ? isPrivate : g.isPrivate,
          } : g)
        }))
      },
      setGroupRole: ({ groupId, userId, role }) => {
        set(state => ({
          groups: state.groups.map(g => g.id === groupId ? {
            ...g,
            roles: { ...(g.roles || {}), [userId]: role }
          } : g)
        }))
      },
      regenerateGroupInvite: ({ groupId }) => {
        set(state => ({
          groups: state.groups.map(g => g.id === groupId ? { ...g, inviteCode: newId('invite') } : g)
        }))
      },
      // Invite helpers (server-backed if available)
      getInviteLink: async ({ groupId }) => {
        try { const res = await api.groupInviteLink(groupId); return res?.link || null } catch { return null }
      },
      joinGroupByInvite: async ({ code, userId }) => {
        const res = await api.groupJoinByCode(code)
        const grp = res?.group
        if (grp?.id) {
          set(state => ({
            groups: state.groups.some(g => g.id === grp.id)
              ? state.groups.map(g => g.id === grp.id ? { ...g, members: Array.from(new Set([...(g.members||[]), userId])) } : g)
              : [ { ...grp, members: Array.from(new Set([...(grp.members||[]), userId])) }, ...state.groups ]
          }))
          get()._ensureGroupMeta(grp.id)
          return grp
        }
        return null
      },
      pinGroupMessage: async ({ groupId, messageId }) => {
        await api.groupPin(groupId, messageId)
        get()._ensureGroupMeta(groupId)
        set(state => ({
          groupMeta: {
            ...state.groupMeta,
            [groupId]: {
              unread: state.groupMeta[groupId]?.unread || {},
              lastReadAt: state.groupMeta[groupId]?.lastReadAt || {},
              pinned: Array.from(new Set([...(state.groupMeta[groupId]?.pinned || []), messageId]))
            }
          }
        }))
      },
      unpinGroupMessage: async ({ groupId, messageId }) => {
        await api.groupUnpin(groupId, messageId)
        get()._ensureGroupMeta(groupId)
        set(state => ({
          groupMeta: {
            ...state.groupMeta,
            [groupId]: {
              unread: state.groupMeta[groupId]?.unread || {},
              lastReadAt: state.groupMeta[groupId]?.lastReadAt || {},
              pinned: (state.groupMeta[groupId]?.pinned || []).filter(id => id !== messageId)
            }
          }
        }))
      },

      // List groups for user (fallback to local; could be replaced with api.groups())
      listGroupsForUser: (userId) => {
        return get().groups
          .filter(g => g.members?.includes(userId))
          .map(g => {
            const msgs = get().groupMessages[g.id] || []
            const lastMessage = msgs[msgs.length - 1] || null
            const unread = get().getGroupUnreadCount({ groupId: g.id, userId })
            return { groupId: g.id, group: g, lastMessage, unread }
          })
          .sort((a, b) => {
            const ta = new Date(a.lastMessage?.createdAt || 0).getTime()
            const tb = new Date(b.lastMessage?.createdAt || 0).getTime()
            return tb - ta
          })
      },
      removeFriend: ({ userId, friendUserId }) => {
        set(state => ({
          friends: state.friends.filter(f => !(f.userId === userId && f.friendUserId === friendUserId) && !(f.userId === friendUserId && f.friendUserId === userId))
        }))
      },
      // Friend requests flow
      requestFriend: async ({ fromUserId, toUserId }) => {
        await api.friendRequest(toUserId)
        // refresh requests lists
        const incoming = await api.friendRequests('incoming')
        const outgoing = await api.friendRequests('outgoing')
        set({ friendRequests: [ ...(incoming.requests || []), ...(outgoing.requests || []) ] })
      },
      cancelFriendRequest: async ({ requestId, userId }) => {
        await api.friendCancel(requestId)
        const incoming = await api.friendRequests('incoming')
        const outgoing = await api.friendRequests('outgoing')
        set({ friendRequests: [ ...(incoming.requests || []), ...(outgoing.requests || []) ] })
      },
      acceptFriendRequest: async ({ requestId, userId }) => {
        await api.friendAccept(requestId)
        const incoming = await api.friendRequests('incoming')
        const outgoing = await api.friendRequests('outgoing')
        set({ friendRequests: [ ...(incoming.requests || []), ...(outgoing.requests || []) ] })
      },
      declineFriendRequest: async ({ requestId, userId }) => {
        await api.friendDecline(requestId)
        const incoming = await api.friendRequests('incoming')
        const outgoing = await api.friendRequests('outgoing')
        set({ friendRequests: [ ...(incoming.requests || []), ...(outgoing.requests || []) ] })
      },
      sendDM: async ({ fromUserId, toUserId, content, type = 'text', attachments, replyTo }) => {
        // Upload attachments to Supabase Storage if available, replace dataUrl with URL
        let uploaded = attachments
        try {
          const sb = getSupabase()
          if (sb && Array.isArray(attachments) && attachments.length) {
            const results = await Promise.all(attachments.map(async (att) => {
              if (att?.dataUrl) {
                const url = await uploadMessageAttachment({
                  userId: fromUserId,
                  fileName: att.name,
                  dataUrl: att.dataUrl,
                  mimeType: att.mimeType || att.type,
                  scope: 'dm'
                })
                return { ...att, url, dataUrl: undefined }
              }
              return att
            }))
            uploaded = results
          }
        } catch (e) { console.warn('Attachment upload failed; sending as-is', e) }
        // E2EE for DMs: derive symmetric key via ECDH
        const me = fromUserId
        const other = await api.userById(toUserId)
        const otherPub = other?.user?.publicKeyJwk ? JSON.parse(other.user.publicKeyJwk || '{}') : null
        let payload = { content, attachments: uploaded, replyToId: replyTo }
        try {
          if (otherPub) {
            const mod = await import('../lib/crypto')
            const { getPrivateKeyJwk, deriveSharedAesKey, aesEncrypt } = mod
            const myPriv = getPrivateKeyJwk()
            if (myPriv) {
              const aes = await deriveSharedAesKey(myPriv, otherPub)
              const enc = await aesEncrypt(aes, content)
              payload.content = JSON.stringify({ e2ee: true, cipherText: enc.cipherText, iv: enc.iv })
            }
          }
        } catch (e) {
          console.warn('E2EE encrypt failed; sending plaintext', e)
        }
        const res = await api.dmSend(toUserId, payload)
        const threadId = res.threadKey
        const msg = { id: res.id, userId: me, content: payload.content, type, attachments: uploaded, createdAt: res.createdAt, reactions: [], editedAt: null, replyTo }
        set(state => ({ dms: { ...state.dms, [threadId]: [...(state.dms[threadId] || []), msg] } }))
        return { threadId, msg }
      },

      editDM: async ({ threadId, messageId, userId, content }) => {
        try { await api.dmEdit(messageId, content) } catch {}
        set(state => ({
          dms: {
            ...state.dms,
            [threadId]: (state.dms[threadId] || []).map(m => (
              m.id === messageId && m.userId === userId ? { ...m, content, editedAt: Date.now() } : m
            ))
          }
        }))
      },

      deleteDM: async ({ threadId, messageId, userId }) => {
        try { await api.dmDelete(messageId) } catch {}
        set(state => ({
          dms: {
            ...state.dms,
            [threadId]: (state.dms[threadId] || []).filter(m => !(m.id === messageId && m.userId === userId))
          }
        }))
      },

      reactDM: async ({ threadId, messageId, userId, emoji }) => {
        try { await api.dmReact(messageId, emoji) } catch {}
        set(state => ({
          dms: {
            ...state.dms,
            [threadId]: (state.dms[threadId] || []).map(m => {
              if (m.id !== messageId) return m
              const reactions = Array.isArray(m.reactions) ? m.reactions : []
              const existing = reactions.find(r => r.emoji === emoji)
              let updated
              if (existing) {
                const hasUser = existing.users?.includes(userId)
                updated = hasUser
                  ? reactions.map(r => r.emoji === emoji ? { ...r, users: r.users.filter(u => u !== userId) } : r)
                  : reactions.map(r => r.emoji === emoji ? { ...r, users: [...(r.users || []), userId] } : r)
              } else {
                updated = [...reactions, { emoji, users: [userId] }]
              }
              return { ...m, reactions: updated }
            })
          }
        }))
      },

      // Reports
      report: async ({ byUserId, targetType, targetId, reason, evidenceUrls = [] }) => {
        try {
          const rep = await api.reportCreate({ targetType, targetId, reason, evidenceUrls })
          const report = rep?.report || { id: newId('rpt'), byUserId, targetType, targetId, reason, evidenceUrls, createdAt: new Date().toISOString(), status: 'open' }
          set(state => ({ reports: [report, ...state.reports] }))
          return report
        } catch {
          const report = { id: newId('rpt'), byUserId, targetType, targetId, reason, evidenceUrls, createdAt: new Date().toISOString(), status: 'open' }
          set(state => ({ reports: [report, ...state.reports] }))
          return report
        }
      },
      updateReportStatus: async ({ id, status }) => {
        try { await api.reportUpdate(id, { status }) } catch {}
        set(state => ({ reports: state.reports.map(r => r.id === id ? { ...r, status } : r) }))
      }
    }),
    { name: 'aversoltix_community' }
  )
)
)

// Initialize Supabase realtime listeners and presence/typing bridges
export function initRealtimeCommunity(store, currentUserId) {
  const sb = getSupabase()
  if (!sb) return () => {}
  const unsubDm = subscribeDmInserts((row) => {
    const threadId = row.thread_key || row.threadKey
    if (!threadId) return
    const msg = {
      id: row.id,
      userId: row.user_id || row.userId,
      content: row.content,
      attachments: row.attachments || [],
      replyTo: row.reply_to_id || row.replyToId || null,
      createdAt: row.created_at || row.createdAt,
      reactions: [],
    }
    store.setState((state) => {
      const list = state.dms[threadId] || []
      if (list.some(m => m.id === msg.id)) return state
      return { dms: { ...state.dms, [threadId]: [...list, msg] } }
    })
  })
  const unsubGroup = subscribeGroupInserts((row) => {
    const groupId = row.group_id || row.groupId
    if (!groupId) return
    const msg = {
      id: row.id,
      userId: row.user_id || row.userId,
      content: row.content,
      attachments: row.attachments || [],
      replyTo: row.reply_to_id || row.replyToId || null,
      createdAt: row.created_at || row.createdAt,
      reactions: [],
    }
    store.setState((state) => {
      const list = state.groupMessages[groupId] || []
      if (list.some(m => m.id === msg.id)) return state
      return { groupMessages: { ...state.groupMessages, [groupId]: [...list, msg] } }
    })
  })
  return () => { try { unsubDm() } catch {}; try { unsubGroup() } catch {} }
}

// Subscribe to typing events for a DM thread and update timestamps
export function subscribeTypingForThread(store, threadId) {
  const cleanup = ensureTypingChannel(threadId, (payload) => {
    const from = payload?.userId
    if (!from) return
    store.setState((state) => ({
      typing: {
        ...state.typing,
        [threadId]: { ...(state.typing[threadId] || {}), [from]: Date.now() }
      }
    }))
  })
  return cleanup
}

// Additional fetch helpers (non-persisted outside store scope)
export async function fetchDMMessagesToStore(store, threadId) {
  const res = await api.dmMessages(threadId)
  const list = (res.messages || []).map(m => ({
    id: m.id,
    userId: m.userId,
    content: m.content,
    attachments: m.attachments ? JSON.parse(m.attachments) : [],
    replyTo: m.replyToId || null,
    createdAt: m.createdAt,
  }))
  store.setState(state => ({ dms: { ...state.dms, [threadId]: list } }))
}

export async function fetchGroupMessagesToStore(store, groupId) {
  const res = await api.groupMessages(groupId)
  const list = (res.messages || []).map(m => ({
    id: m.id,
    userId: m.userId,
    content: m.content,
    attachments: m.attachments ? JSON.parse(m.attachments) : [],
    replyTo: m.replyToId || null,
    createdAt: m.createdAt,
  }))
  store.setState(state => ({ groupMessages: { ...state.groupMessages, [groupId]: list } }))
}

