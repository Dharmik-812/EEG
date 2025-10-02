import { useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCommunityStore } from '../store/communityStore'
import { motion } from 'framer-motion'

export default function ChatFriends() {
  const { currentUser } = useAuthStore()
  const {
    friends,
    dms,
    getUserThreadId,
    addFriend,
    removeFriend,
    sendDM,
  } = useCommunityStore()

  const [selectedFriendId, setSelectedFriendId] = useState(null)
  const [message, setMessage] = useState('')
  const myId = currentUser?.id

  const myFriends = useMemo(() => {
    return friends
      .filter(f => f.userId === myId || f.friendUserId === myId)
      .map(f => (f.userId === myId ? f.friendUserId : f.userId))
  }, [friends, myId])

  const threadId = selectedFriendId && myId ? getUserThreadId(myId, selectedFriendId) : null
  const threadMessages = (threadId && dms[threadId]) || []

  if (!currentUser) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-700 dark:text-slate-200 font-medium">Please log in to access Chat & Friends.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-1 p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60 min-h-[200px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Friends</h2>
          <button
            onClick={() => {
              const id = prompt('Enter user ID to add as friend:')
              if (id && myId && id !== myId) addFriend({ userId: myId, friendUserId: id })
            }}
            className="text-sm px-3 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2 max-h-[50vh] overflow-auto pr-1">
          {myFriends.length === 0 && (
            <li className="text-sm text-slate-600 dark:text-slate-400">No friends yet. Add one to start a DM.</li>
          )}
          {myFriends.map(fid => (
            <li key={fid}>
              <button
                onClick={() => setSelectedFriendId(fid)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  selectedFriendId === fid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'hover:bg-emerald-50/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className="font-medium">User {fid}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-2 p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-emerald-200/40 dark:border-slate-700/60">
        {!selectedFriendId ? (
          <div className="h-[40vh] sm:h-64 flex items-center justify-center text-slate-600 dark:text-slate-400">
            Select a friend to start chatting.
          </div>
        ) : (
          <div className="flex flex-col h-[55vh] sm:h-[60vh]">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/40 dark:border-slate-700/60">
              <h3 className="font-semibold">Chat with User {selectedFriendId}</h3>
              <button
                onClick={() => { if (myId) removeFriend({ userId: myId, friendUserId: selectedFriendId }); setSelectedFriendId(null) }}
                className="text-sm text-red-600 hover:underline"
              >
                Remove friend
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {threadMessages.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${m.userId === myId ? 'ml-auto bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  {m.content}
                </motion.div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!message.trim() || !myId || !selectedFriendId) return
                sendDM({ fromUserId: myId, toUserId: selectedFriendId, content: message.trim() })
                setMessage('')
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/40 min-w-0"
              />
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}


