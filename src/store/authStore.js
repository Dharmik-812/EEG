import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const seedUsers = [
  { id: 'admin-1', name: 'Administrator', email: 'admin@aversoltix.com', password: 'admin123', role: 'admin' },
  { id: 'user-1', name: 'Eco Learner', email: 'student@aversoltix.com', password: 'student123', role: 'user' },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUser: null,

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password)
        if (!user) throw new Error('Invalid credentials')
        set({ currentUser: user })
        return user
      },

      register: (name, email, password) => {
        const exists = get().users.some(u => u.email === email)
        if (exists) throw new Error('Email already registered')
        const id = `u-${Date.now()}`
        const user = { id, name, email, password, role: 'user' }
        set(state => ({ users: [...state.users, user], currentUser: user }))
        return user
      },

      logout: () => set({ currentUser: null }),

      isAdmin: () => get().currentUser?.role === 'admin',
    }),
    { name: 'aversoltix_auth' }
  )
)

