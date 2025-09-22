import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { differenceInCalendarDays } from '../utils/date.js'

const initialState = {
  user: {
    id: 'u-001',
    name: 'Eco Learner',
    avatar: null,
    class: 'Global',
  },
  xp: 0,
  level: 1,
  badges: [],
  streak: 0,
  lastActive: null,
  completedChallenges: {}, // challengeId: score
  xpLog: [], // {date, delta, reason}
}

const levelForXP = (xp) => Math.max(1, Math.floor(xp / 500) + 1)  // 500 xp per level

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      addXP: (delta, reason = 'Activity') => {
        const xp = get().xp + delta
        const level = levelForXP(xp)
        const entry = { date: new Date().toISOString(), delta, reason }
        set(state => ({ xp, level, xpLog: [...state.xpLog, entry] }))
      },
      awardBadge: (badgeId) => {
        if (get().badges.includes(badgeId)) return
        set(state => ({ badges: [...state.badges, badgeId] }))
      },
      markChallengeComplete: (id, score) => {
        set(state => ({
          completedChallenges: { ...state.completedChallenges, [id]: score }
        }))
      },
      touchDailyStreak: () => {
        const last = get().lastActive
        const now = new Date()
        if (!last) {
          set({ streak: 1, lastActive: now.toISOString() })
          return { type: 'start' }
        }
        const diff = differenceInCalendarDays(now, new Date(last))
        if (diff === 0) {
          set({ lastActive: now.toISOString() })
          return { type: 'same-day' }
        }
        if (diff === 1) {
          set(state => ({ streak: state.streak + 1, lastActive: now.toISOString() }))
          return { type: 'increment' }
        }
        set({ streak: 1, lastActive: now.toISOString() })
        return { type: 'reset' }
      },
      resetProgress: () => set(initialState),
    }),
    {
      name: 'aversoltix_game',
      partialize: (state) =>
        ({ xp: state.xp, level: state.level, badges: state.badges, streak: state.streak, lastActive: state.lastActive, completedChallenges: state.completedChallenges, xpLog: state.xpLog, user: state.user }),
    }
  )
)

