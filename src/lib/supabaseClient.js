// Enhanced Supabase client with better error handling and state management
import { createClient } from '@supabase/supabase-js'

let _supabase = null
let _connectionState = 'disconnected' // 'disconnected' | 'connecting' | 'connected' | 'error'
let _listeners = new Set()

// Connection state management
export function getConnectionState() {
  return _connectionState
}

export function onConnectionStateChange(callback) {
  _listeners.add(callback)
  return () => _listeners.delete(callback)
}

function setConnectionState(state) {
  if (_connectionState !== state) {
    _connectionState = state
    _listeners.forEach(callback => {
      try {
        callback(state)
      } catch (error) {
        console.error('Connection state listener error:', error)
      }
    })
  }
}

export function getSupabase() {
  if (_supabase) return _supabase
  
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.warn('Supabase credentials not found. Some features may not work.')
    return null
  }
  
  setConnectionState('connecting')
  
  try {
    _supabase = createClient(url, anonKey, {
      auth: { 
        persistSession: false,
        autoRefreshToken: false // We handle auth via our JWT system
      },
      realtime: { 
        params: { 
          eventsPerSecond: 10 // Increased for better real-time performance
        } 
      },
      global: {
        headers: {
          'x-client-info': 'eeg-app@1.0.0'
        }
      }
    })
    
    // Test connection
    _supabase.from('users').select('count', { count: 'exact', head: true })
      .then(() => {
        setConnectionState('connected')
        console.log('✅ Supabase connected successfully')
      })
      .catch((error) => {
        setConnectionState('error')
        console.error('❌ Supabase connection failed:', error)
      })
    
    return _supabase
  } catch (error) {
    setConnectionState('error')
    console.error('❌ Failed to initialize Supabase:', error)
    return null
  }
}

// Enhanced file upload with progress tracking
export async function uploadMessageAttachment({ 
  bucket = 'attachments', 
  scope = 'messages', 
  userId, 
  fileName, 
  dataUrl, 
  mimeType,
  onProgress 
}) {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not available')
  
  const timestamp = Date.now()
  const safeName = (fileName || `file-${timestamp}`).replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${scope}/${userId}/${timestamp}-${safeName}`
  
  const blob = dataUrlToBlob(dataUrl)
  if (!blob) throw new Error('Invalid file data')
  
  // Validate file size (5MB limit)
  if (blob.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit')
  }
  
  try {
    const { data, error } = await sb.storage
      .from(bucket)
      .upload(path, blob, { 
        contentType: mimeType || blob.type, 
        upsert: false,
        onUploadProgress: onProgress
      })
    
    if (error) throw error
    
    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(path)
    
    return {
      path: data.path,
      url: urlData?.publicUrl,
      size: blob.size,
      type: mimeType || blob.type
    }
  } catch (error) {
    console.error('File upload failed:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }
}

// Convert data URL to Blob with validation
export function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
    return null
  }
  
  try {
    const [header, base64] = dataUrl.split(',')
    const mimeMatch = /data:(.*?);base64/.exec(header)
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
    
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return new Blob([bytes], { type: mime })
  } catch (error) {
    console.error('Failed to convert data URL to blob:', error)
    return null
  }
}

// Enhanced presence management
export class PresenceManager {
  constructor() {
    this.channel = null
    this.isTracking = false
    this.presenceState = {}
    this.listeners = new Set()
  }
  
  async startTracking(userId) {
    if (this.isTracking) return
    
    const sb = getSupabase()
    if (!sb) throw new Error('Supabase not available')
    
    this.channel = sb.channel('presence', {
      config: { 
        presence: { key: userId },
        broadcast: { self: true }
      }
    })
    
    this.channel
      .on('presence', { event: 'sync' }, () => {
        this.presenceState = this.channel.presenceState()
        this.notifyListeners('sync', this.presenceState)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.notifyListeners('join', { key, presences: newPresences })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.notifyListeners('leave', { key, presences: leftPresences })
      })
    
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel.track({
          online_at: new Date().toISOString(),
          user_id: userId
        })
        this.isTracking = true
      }
    })
  }
  
  async stopTracking() {
    if (!this.isTracking || !this.channel) return
    
    try {
      await this.channel.untrack()
      await this.channel.unsubscribe()
    } catch (error) {
      console.error('Error stopping presence tracking:', error)
    } finally {
      this.channel = null
      this.isTracking = false
      this.presenceState = {}
    }
  }
  
  onPresenceChange(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
  
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Presence listener error:', error)
      }
    })
  }
  
  getOnlineUsers() {
    return Object.keys(this.presenceState)
  }
  
  isUserOnline(userId) {
    return userId in this.presenceState
  }
}

// Enhanced typing indicators
export class TypingManager {
  constructor() {
    this.channels = new Map()
    this.typingStates = new Map()
    this.listeners = new Map()
  }
  
  async startTyping(threadId, userId) {
    const sb = getSupabase()
    if (!sb) return
    
    let channel = this.channels.get(threadId)
    if (!channel) {
      channel = sb.channel(`typing:${threadId}`)
      
      channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
        this.handleTypingEvent(threadId, payload)
      })
      
      await channel.subscribe()
      this.channels.set(threadId, channel)
    }
    
    // Send typing event
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, timestamp: Date.now(), typing: true }
    })
    
    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      this.stopTyping(threadId, userId)
    }, 3000)
  }
  
  async stopTyping(threadId, userId) {
    const channel = this.channels.get(threadId)
    if (!channel) return
    
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, timestamp: Date.now(), typing: false }
    })
  }
  
  handleTypingEvent(threadId, payload) {
    const { userId, timestamp, typing } = payload
    
    if (!this.typingStates.has(threadId)) {
      this.typingStates.set(threadId, new Map())
    }
    
    const threadTyping = this.typingStates.get(threadId)
    
    if (typing) {
      threadTyping.set(userId, timestamp)
    } else {
      threadTyping.delete(userId)
    }
    
    // Notify listeners
    const listeners = this.listeners.get(threadId) || new Set()
    listeners.forEach(callback => {
      try {
        callback(Array.from(threadTyping.keys()))
      } catch (error) {
        console.error('Typing listener error:', error)
      }
    })
    
    // Clean up old typing states (older than 5 seconds)
    const now = Date.now()
    for (const [uid, ts] of threadTyping.entries()) {
      if (now - ts > 5000) {
        threadTyping.delete(uid)
      }
    }
  }
  
  onTypingChange(threadId, callback) {
    if (!this.listeners.has(threadId)) {
      this.listeners.set(threadId, new Set())
    }
    
    const threadListeners = this.listeners.get(threadId)
    threadListeners.add(callback)
    
    return () => {
      threadListeners.delete(callback)
      if (threadListeners.size === 0) {
        this.listeners.delete(threadId)
        // Clean up channel if no listeners
        const channel = this.channels.get(threadId)
        if (channel) {
          channel.unsubscribe()
          this.channels.delete(threadId)
        }
      }
    }
  }
  
  getTypingUsers(threadId) {
    const threadTyping = this.typingStates.get(threadId)
    return threadTyping ? Array.from(threadTyping.keys()) : []
  }
}

// Enhanced realtime subscriptions with error handling
export class RealtimeManager {
  constructor() {
    this.subscriptions = new Map()
    this.isConnected = false
  }
  
  async subscribeDMMessages(callback) {
    const sb = getSupabase()
    if (!sb) throw new Error('Supabase not available')
    
    const channel = sb
      .channel('dm_messages_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'dm_messages' }, 
        (payload) => {
          try {
            callback('INSERT', payload.new)
          } catch (error) {
            console.error('DM message callback error:', error)
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'dm_messages' },
        (payload) => {
          try {
            callback('UPDATE', payload.new)
          } catch (error) {
            console.error('DM message callback error:', error)
          }
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'dm_messages' },
        (payload) => {
          try {
            callback('DELETE', payload.old)
          } catch (error) {
            console.error('DM message callback error:', error)
          }
        }
      )
    
    await channel.subscribe((status) => {
      console.log('DM messages subscription status:', status)
      this.isConnected = status === 'SUBSCRIBED'
    })
    
    this.subscriptions.set('dm_messages', channel)
    
    return () => {
      channel.unsubscribe()
      this.subscriptions.delete('dm_messages')
    }
  }
  
  async subscribeGroupMessages(callback) {
    const sb = getSupabase()
    if (!sb) throw new Error('Supabase not available')
    
    const channel = sb
      .channel('group_messages_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages' },
        (payload) => {
          try {
            callback('INSERT', payload.new)
          } catch (error) {
            console.error('Group message callback error:', error)
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'group_messages' },
        (payload) => {
          try {
            callback('UPDATE', payload.new)
          } catch (error) {
            console.error('Group message callback error:', error)
          }
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'group_messages' },
        (payload) => {
          try {
            callback('DELETE', payload.old)
          } catch (error) {
            console.error('Group message callback error:', error)
          }
        }
      )
    
    await channel.subscribe((status) => {
      console.log('Group messages subscription status:', status)
    })
    
    this.subscriptions.set('group_messages', channel)
    
    return () => {
      channel.unsubscribe()
      this.subscriptions.delete('group_messages')
    }
  }
  
  async subscribeReactions(callback) {
    const sb = getSupabase()
    if (!sb) throw new Error('Supabase not available')
    
    const channel = sb
      .channel('reactions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          try {
            callback(payload.eventType, payload.new || payload.old)
          } catch (error) {
            console.error('Reactions callback error:', error)
          }
        }
      )
    
    await channel.subscribe()
    this.subscriptions.set('reactions', channel)
    
    return () => {
      channel.unsubscribe()
      this.subscriptions.delete('reactions')
    }
  }
  
  disconnect() {
    for (const [key, channel] of this.subscriptions) {
      try {
        channel.unsubscribe()
      } catch (error) {
        console.error(`Error unsubscribing from ${key}:`, error)
      }
    }
    this.subscriptions.clear()
    this.isConnected = false
  }
}

// Global instances
export const presenceManager = new PresenceManager()
export const typingManager = new TypingManager()
export const realtimeManager = new RealtimeManager()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    presenceManager.stopTracking()
    realtimeManager.disconnect()
  })
}
