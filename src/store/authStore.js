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
      institutions: [
        {
          id: '1',
          name: 'Green Valley High School',
          type: 'school',
          address: '123 Education Lane, Green Valley, CA 91390',
          email: 'admin@greenvalley.edu',
          phone: '+1 (555) 123-4567',
          createdAt: '2024-01-15T10:30:00Z',
          isActive: true
        },
        {
          id: '2',
          name: 'Environmental Studies College',
          type: 'college',
          address: '456 Learning Blvd, Eco City, WA 98765',
          email: 'info@envirocolege.edu',
          phone: '+1 (555) 987-6543',
          createdAt: '2024-02-10T14:15:00Z',
          isActive: true
        }
      ],
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
      isTeacher: () => {
        const role = get().currentUser?.role
        return role === 'school-teacher' || role === 'college-teacher'
      },
      isStudent: () => {
        const role = get().currentUser?.role
        return role === 'school-student' || role === 'college-student'
      },

      // Institution management methods
      createInstitution: (institutionData) => {
        const newInstitution = {
          id: Date.now().toString(),
          ...institutionData,
          createdAt: new Date().toISOString(),
          userCount: 0,
          isActive: true
        }
        set(state => ({
          institutions: [...(state.institutions || []), newInstitution]
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
        const roles = {}
        users.forEach(u => {
          roles[u.role] = (roles[u.role] || 0) + 1
        })

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
    }),
    { name: 'aversoltix_auth' }
  )
)

