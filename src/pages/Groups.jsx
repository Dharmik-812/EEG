import { useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCommunityStore } from '../store/communityStore'
import { motion } from 'framer-motion'

export default function Groups() {
  const { currentUser } = useAuthStore()
  const {
    groups,
    searchGroups,
    createGroup,
    joinGroup,
    leaveGroup,
  } = useCommunityStore()

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('trending')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', tags: '', isPrivate: false })

  const myId = currentUser?.id
  const results = useMemo(() => searchGroups({ query, sort }), [searchGroups, query, sort])

  const submitCreate = (e) => {
    e.preventDefault()
    if (!myId) return
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    createGroup({ name: form.name, description: form.description, tags, isPrivate: form.isPrivate }, myId)
    setForm({ name: '', description: '', tags: '', isPrivate: false })
    setCreating(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search groups by topic..."
          className="flex-1 px-3 sm:px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60"
        />
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
          <option value="trending">Most Active</option>
          <option value="newest">Newest</option>
          <option value="active">Largest</option>
        </select>
        <button
          disabled={!currentUser}
          onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Create Group
        </button>
      </div>

      {creating && (
        <form onSubmit={submitCreate} className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Group name" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40" />
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40" />
          </div>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40" />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPrivate} onChange={e => setForm({ ...form, isPrivate: e.target.checked })} />
            Private group (invite only)
          </label>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Create</button>
            <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map(g => {
          const isMember = !!myId && g.members.includes(myId)
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{g.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{g.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(g.tags || []).map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100/60 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Members: {g.members.length}</div>
                  <div className="text-xs text-slate-500">ID: {g.id}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!isMember ? (
                  <button disabled={!myId} onClick={() => myId && joinGroup({ groupId: g.id, userId: myId })} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50">Join</button>
                ) : (
                  <button onClick={() => myId && leaveGroup({ groupId: g.id, userId: myId })} className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-sm">Leave</button>
                )}
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/community?group=${g.id}`)} className="px-3 py-1.5 rounded-lg text-sm border">Copy Link</button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


