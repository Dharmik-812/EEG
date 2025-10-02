import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Image as ImageIcon, Save } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../lib/api'
import { useToastStore } from '../store/toastStore'

export default function ProfileDrawer({ isOpen, onClose }) {
  const { currentUser, refreshMe } = useAuthStore()
  const pushToast = useToastStore(s => s.push)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setEmail(currentUser.email || '')
      setBio(currentUser.bio || '')
      setAvatarUrl(currentUser.avatarUrl || '')
    }
  }, [currentUser, isOpen])

  const save = async () => {
    try {
      setSaving(true)
      await api.updateMe({ name, email, bio, avatarUrl })
      await refreshMe()
      pushToast({ title: 'Profile updated', variant: 'success' })
      onClose?.()
    } catch (e) {
      pushToast({ title: 'Update failed', description: e.message, variant: 'error' })
    } finally {
      setSaving(false)
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
            className="ml-auto h-full w-full max-w-md bg-white dark:bg-slate-900 border-l"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Edit profile"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Your Profile</h3>
              <button onClick={onClose} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-slate-500">Name</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <input value={name} onChange={e => setName(e.target.value)} className="flex-1 px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input value={email} onChange={e => setEmail(e.target.value)} className="flex-1 px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Avatar URL</label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                  <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" />
                </div>
                {avatarUrl && (
                  <div className="mt-2">
                    <img src={avatarUrl} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-500">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" />
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button disabled={saving} onClick={save} className="px-4 py-2 rounded bg-emerald-600 text-white inline-flex items-center gap-2 disabled:opacity-50">
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button type="button" onClick={() => setPwOpen(v => !v)} className="px-3 py-2 rounded border text-sm">{pwOpen ? 'Hide' : 'Change password'}</button>
              </div>

              {pwOpen && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded border bg-slate-50 dark:bg-slate-800/40">
                  <div className="mb-2">
                    <label className="text-xs text-slate-500">Current password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" />
                  </div>
                  <div className="mb-2">
                    <label className="text-xs text-slate-500">New password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded border bg-white/80 dark:bg-slate-900/40" />
                  </div>
                  <div>
                    <button disabled={changingPw || !currentPassword || !newPassword} onClick={async () => {
                      try {
                        setChangingPw(true)
                        await api.changePassword(currentPassword, newPassword)
                        setCurrentPassword(''); setNewPassword('')
                        pushToast({ title: 'Password changed', variant: 'success' })
                      } catch (e) {
                        pushToast({ title: 'Password change failed', description: e.message, variant: 'error' })
                      } finally {
                        setChangingPw(false)
                      }
                    }} className="px-3 py-1.5 rounded bg-emerald-600 text-white disabled:opacity-50">Update password</button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
