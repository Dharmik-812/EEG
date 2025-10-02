import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setTokens, getAccessToken, getRefreshToken } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      users: [],
      institutions: [
        {
          id: '1',
          name: 'Green Valley High School',
          type: 'school',
          address: '123 Education Lane, Green Valley, CA 91390',
          email: 'admin@greenvalley.edu',
          phone: '+1 (555) 123-4567',
          createdAt: '2024-01-15T10:30:00Z',
          isActive: true,
          userCount: 0,
          teachers: 0,
          students: 0
        },
        {
          id: '2',
          name: 'Environmental Studies College',
          type: 'college',
          address: '456 Learning Blvd, Eco City, WA 98765',
          email: 'info@envirocolege.edu',
          phone: '+1 (555) 987-6543',
          createdAt: '2024-02-10T14:15:00Z',
          isActive: true,
          userCount: 0,
          teachers: 0,
          students: 0
        }
      ],
      currentUser: null,

      login: async (email, password) => {
        const response = await api.login(email, password)
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        })
        set({ currentUser: response.user })
        try {
          const { ensureUserKeypairUploaded } = await import('../lib/crypto')
          await ensureUserKeypairUploaded(api, { getState: () => ({ currentUser: response.user }) })
        } catch {}
        // refresh users list for friend discovery, etc.
        const list = await api.users()
        set({ users: list.users || [] })
        return response.user
      },

      register: async (userData) => {
        const { name, email, password } = userData
        const response = await api.register(name, email, password)
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn
        })
        set({ currentUser: response.user })
        try {
          const { ensureUserKeypairUploaded } = await import('../lib/crypto')
          await ensureUserKeypairUploaded(api, { getState: () => ({ currentUser: response.user }) })
        } catch {}
        const list = await api.users()
        set({ users: list.users || [] })
        return response.user
      },

      refreshMe: async () => {
        const accessToken = getAccessToken()
        if (!accessToken) return null
        try {
          const { user } = await api.me()
          set({ currentUser: user })
          const list = await api.users()
          set({ users: list.users || [] })
          return user
        } catch (e) {
          setTokens({ accessToken: null, refreshToken: null, expiresIn: 0 })
          set({ currentUser: null })
          return null
        }
      },

      logout: () => { 
        setTokens({ accessToken: null, refreshToken: null, expiresIn: 0 })
        set({ currentUser: null }) 
      },

      isAdmin: () => get().currentUser?.role === 'admin',
      isTeacher: () => {
        const role = get().currentUser?.role
        return role === 'school-teacher' || role === 'college-teacher'
      },
      isStudent: () => {
        const role = get().currentUser?.role
        return role === 'school-student' || role === 'college-student'
      },

      // Institution management methods (unchanged, can be migrated later)
      createInstitution: (institutionData) => {
        const user = get().currentUser
        const isTeacher = get().isTeacher()
        
        if (!user || !isTeacher) throw new Error('Only teachers can create institutions')
        
        const newInstitution = {
          id: `inst-${Date.now()}`,
          ...institutionData,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          userCount: 0,
          teachers: 0,
          students: 0,
          isActive: true,
          activeQuizzes: 0
        }
        
        // Update current user with institution if they don't have one
        const updatedUser = user.institution ? user : { ...user, institution: newInstitution }
        
        set(state => ({
          institutions: [...(state.institutions || []), newInstitution],
          currentUser: updatedUser,
          users: state.users.map(u => u.id === user.id ? updatedUser : u)
        }))
        
        return newInstitution
      },

      updateInstitution: (id, updates) => {
        set(state => ({
          institutions: (state.institutions || []).map(inst =>
            inst.id === id ? { ...inst, ...updates } : inst
          )
        }))
      },

      deleteInstitution: (id) => {
        set(state => ({
          institutions: (state.institutions || []).filter(inst => inst.id !== id)
        }))
      },

      getInstitutions: () => {
        const state = get()
        const institutions = state.institutions || []
        const users = state.users || []

        return institutions.map(inst => ({
          ...inst,
          userCount: users.filter(u => u.institution?.id === inst.id).length,
          teachers: users.filter(u => u.institution?.id === inst.id && u.role.includes('teacher')).length,
          students: users.filter(u => u.institution?.id === inst.id && u.role.includes('student')).length
        }))
      },

      getAnalytics: () => {
        const users = get().users
        const total = users.length
        const roles = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {})
        
        const institutions = users
          .filter(u => u.institution)
          .map(u => u.institution.name)
          .filter((name, index, arr) => arr.indexOf(name) === index)

        return {
          totalUsers: total,
          roleDistribution: roles,
          totalInstitutions: institutions.length,
          institutions,
          recentUsers: users.slice(-5),
          totalXP: users.reduce((sum, u) => sum + (u.stats?.xp || 0), 0),
          totalQuizzes: users.reduce((sum, u) => sum + (u.stats?.completedQuizzes || 0), 0)
        }
      },

      // Admin moderation helpers (server-backed)
      adminBanUser: async ({ userId, reason, until }) => {
        await api.adminBanUser({ userId, reason, until })
        return true
      },
      adminUnbanUser: async ({ userId }) => {
        await api.adminUnbanUser({ userId })
        return true
      },
    }),
    { name: 'aversoltix_auth' }
  )
)
