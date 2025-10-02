// Supabase client and helpers for presence, typing, realtime messages, and storage uploads
import { createClient } from '@supabase/supabase-js'

let _supabase = null

export function getSupabase() {
  if (_supabase) return _supabase
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  _supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  })
  return _supabase
}

// Convert data URL to Blob
export function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes(',')) return null
  const [header, base64] = dataUrl.split(',')
  const m = /data:(.*?);base64/.exec(header)
  const mime = m ? m[1] : 'application/octet-stream'
  const bin = atob(base64)
  const u8 = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
  return new Blob([u8], { type: mime })
}

// Upload a single attachment to Supabase Storage and return a public URL
export async function uploadMessageAttachment({ bucket = 'attachments', scope = 'messages', userId, fileName, dataUrl, mimeType }) {
  const sb = getSupabase()
  if (!sb) return null
  const ts = Date.now()
  const safeName = (fileName || `file-${ts}`).replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${scope}/${userId}/${ts}-${safeName}`
  const blob = dataUrlToBlob(dataUrl)
  if (!blob) return null
  const { error } = await sb.storage.from(bucket).upload(path, blob, { contentType: mimeType || blob.type, upsert: false })
  if (error) throw error
  const { data } = sb.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || null
}

// Presence channel: tracks online status and emits full presence state on sync
export function connectPresenceChannel({ userId, onSync }) {
  const sb = getSupabase()
  if (!sb || !userId) return () => {}
  const channel = sb.channel('presence', { config: { presence: { key: userId } } })
  channel.on('presence', { event: 'sync' }, () => {
    try { onSync?.(channel.presenceState?.() || {}) } catch {}
  })
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      try { await channel.track({ online_at: new Date().toISOString() }) } catch {}
    }
  })
  return () => { try { channel.untrack(); channel.unsubscribe() } catch {} }
}

// Typing broadcast per DM thread
const _typingChannels = new Map()
export function ensureTypingChannel(threadKey, onTyping) {
  const sb = getSupabase()
  if (!sb || !threadKey) return () => {}
  if (_typingChannels.has(threadKey)) return _typingChannels.get(threadKey)
  const ch = sb.channel(`typing:${threadKey}`)
  ch.on('broadcast', { event: 'typing' }, ({ payload }) => {
    try { onTyping?.(payload) } catch {}
  })
  ch.subscribe()
  const cleanup = () => { try { ch.unsubscribe() } catch {} ; _typingChannels.delete(threadKey) }
  _typingChannels.set(threadKey, cleanup)
  return cleanup
}
export function sendTypingEvent(threadKey, userId) {
  const sb = getSupabase()
  if (!sb || !threadKey || !userId) return
  const ch = sb.channel(`typing:${threadKey}`)
  ch.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      ch.send({ type: 'broadcast', event: 'typing', payload: { userId, at: Date.now() } })
      setTimeout(() => { try { ch.unsubscribe() } catch {} }, 1500)
    }
  })
}

// Realtime subscriptions for new messages
export function subscribeDmInserts(onInsert) {
  const sb = getSupabase()
  if (!sb) return () => {}
  const ch = sb.channel('dm_messages_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dm_messages' }, (payload) => onInsert?.(payload.new))
  ch.subscribe()
  return () => { try { ch.unsubscribe() } catch {} }
}
export function subscribeGroupInserts(onInsert) {
  const sb = getSupabase()
  if (!sb) return () => {}
  const ch = sb.channel('group_messages_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages' }, (payload) => onInsert?.(payload.new))
  ch.subscribe()
  return () => { try { ch.unsubscribe() } catch {} }
}
