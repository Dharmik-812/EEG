import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSubmissionsStore = create(
  persist(
    (set, get) => ({
      pendingGames: [],
      approvedGames: [],
      pendingQuizzes: [],
      approvedQuizzes: [],
      libraryAssets: [], // global pool of community assets from submitted/approved games

      _addLibraryAssets: (assets) => set(state => {
        const existing = state.libraryAssets
        const incoming = (assets || []).filter(a => a && a.type === 'image')
        const dedupById = new Map(existing.map(a => [a.id, a]))
        for (const a of incoming) { if (!dedupById.has(a.id)) dedupById.set(a.id, a) }
        return { libraryAssets: Array.from(dedupById.values()) }
      }),

      submitGame: ({ title, description, project, ownerId }) => {
        const id = `g-${Date.now()}`
        const item = { id, title, description, project, ownerId, createdAt: new Date().toISOString(), status: 'pending' }
        set(state => ({ pendingGames: [item, ...state.pendingGames] }))
        // also add assets to library immediately
        get()._addLibraryAssets(project?.assets)
        return item
      },

      submitQuiz: ({ quiz, ownerId }) => {
        const id = `q-${Date.now()}`
        const item = { id, quiz, ownerId, createdAt: new Date().toISOString(), status: 'pending' }
        set(state => ({ pendingQuizzes: [item, ...state.pendingQuizzes] }))
        return item
      },

      approveGame: (id) => {
        const item = get().pendingGames.find(i => i.id === id)
        if (!item) return
        set(state => ({
          pendingGames: state.pendingGames.filter(i => i.id !== id),
          approvedGames: [{ ...item, status: 'approved', approvedAt: new Date().toISOString() }, ...state.approvedGames],
        }))
        get()._addLibraryAssets(item.project?.assets)
      },

      rejectGame: (id) => {
        set(state => ({ pendingGames: state.pendingGames.filter(i => i.id !== id) }))
      },

      approveQuiz: (id) => {
        const item = get().pendingQuizzes.find(i => i.id === id)
        if (!item) return
        set(state => ({
          pendingQuizzes: state.pendingQuizzes.filter(i => i.id !== id),
          approvedQuizzes: [{ ...item, status: 'approved', approvedAt: new Date().toISOString() }, ...state.approvedQuizzes],
        }))
      },

      rejectQuiz: (id) => {
        set(state => ({ pendingQuizzes: state.pendingQuizzes.filter(i => i.id !== id) }))
      },
    }),
    { name: 'aversoltix_submissions' }
  )
)

