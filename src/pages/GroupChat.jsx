import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCommunityStore } from '../store/communityStore'

export default function GroupChat() {
  const { currentUser } = useAuthStore()
  const { groups, getGroupById, sendGroupMessage, joinGroup } = useCommunityStore()
  const [params] = useSearchParams()
  const [input, setInput] = useState('')

  const groupId = params.get('id') || params.get('group')
  const group = useMemo(() => (groupId ? getGroupById(groupId) : null), [groupId, getGroupById])
  const myId = currentUser?.id

  const isMember = !!(group && myId && group.members.includes(myId))

  // Simple in-memory messages from the store
  const { groupMessages } = useCommunityStore()
  const messages = (groupId && groupMessages[groupId]) || []

  if (!groupId || !group) {
    return <div className="py-16 text-center text-slate-600 dark:text-slate-300">Invalid or missing group. Open from Groups discovery.</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{group.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{group.description}</p>
          </div>
          <div className="text-sm text-slate-500">ID: {group.id}</div>
        </div>
      </div>

      {!isMember ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="mb-3">You are not a member of this group.</p>
          <button
            disabled={!myId}
            onClick={() => myId && joinGroup({ groupId: group.id, userId: myId })}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Join Group
          </button>
        </div>
      ) : (
        <div className="p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60">
          <div className="h-[55vh] sm:h-[60vh] overflow-y-auto space-y-2 mb-3 pr-1">
            {messages.map(m => (
              <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${m.userId === myId ? 'ml-auto bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {m.content}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!input.trim() || !myId) return
              sendGroupMessage({ groupId: group.id, userId: myId, content: input.trim() })
              setInput('')
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message to the group..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/40 min-w-0"
            />
            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}


