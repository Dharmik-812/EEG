import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { connectPresenceChannel } from '../lib/supabase'

export const usePresenceStore = create(persist((set, get) => ({
  // Map of userId -> { online: boolean, lastSeen: number }
  presence: {},
  _presenceCleanup: null,

  isOnline: (userId) => !!get().presence[userId]?.online,
  lastSeen: (userId) => get().presence[userId]?.lastSeen || null,

  setOnline: (userId) => set(state => ({
    presence: {
      ...state.presence,
      [userId]: { online: true, lastSeen: Date.now() }
    }
  })),

  setOffline: (userId) => set(state => ({
    presence: {
      ...state.presence,
      [userId]: { online: false, lastSeen: Date.now() }
    }
  })),

  toggle: (userId) => set(state => {
    const current = state.presence[userId]?.online
    return {
      presence: {
        ...state.presence,
        [userId]: { online: !current, lastSeen: Date.now() }
      }
    }
  }),

  // Supabase Realtime presence connect/disconnect
  connectRealtimePresence: (userId) => {
    try { get()._presenceCleanup?.() } catch {}
    const cleanup = connectPresenceChannel({
      userId,
      onSync: (state) => {
        const onlineIds = new Set(Object.keys(state || {}))
        set(prev => {
          const next = { ...prev.presence }
          // mark online ids
          onlineIds.forEach(id => { next[id] = { online: true, lastSeen: Date.now() } })
          // mark others offline
          Object.keys(next).forEach(id => { if (!onlineIds.has(id)) next[id] = { online: false, lastSeen: Date.now() } })
          return { presence: next }
        })
      }
    })
    set({ _presenceCleanup: cleanup })
    return cleanup
  },

  // Simulate random presence changes for demo
  simulatePresence: (userIds = []) => {
    const ids = Array.isArray(userIds) && userIds.length ? userIds : Object.keys(get().presence)
    ids.forEach(id => {
      if (Math.random() > 0.5) {
        get().setOnline(id)
      } else {
        get().setOffline(id)
      }
    })
  }
}), { name: 'aversoltix_presence' }))
