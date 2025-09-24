import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const seedUsers = [
  { 
    id: 'admin-1', 
    name: 'Administrator', 
    email: 'admin@aversoltix.com', 
    password: 'admin123', 
    role: 'admin'
  },
  { 
    id: 'school-teacher-1', 
    name: 'Sarah Johnson', 
    email: 'sarah@greenvalleyschool.edu', 
    password: 'teacher123', 
    role: 'school-teacher',
    institution: {
      name: 'Green Valley Elementary',
      type: 'school',
      code: 'GVE2024',
      location: 'California, USA'
    }
  },
  { 
    id: 'college-student-1', 
    name: 'Alex Chen', 
    email: 'alex@stanford.edu', 
    password: 'student123', 
    role: 'college-student',
    institution: {
      name: 'Stanford University',
      type: 'college',
      code: 'STAN2024',
      location: 'California, USA'
    }
  },
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

      register: (userData) => {
        const { name, email, password, role, institution } = userData
        const exists = get().users.some(u => u.email === email)
        if (exists) throw new Error('Email already registered')
        
        const id = `${role}-${Date.now()}`
        const user = { 
          id, 
          name, 
          email, 
          password, 
          role,
          institution,
          createdAt: new Date().toISOString(),
          stats: {
            xp: 0,
            badges: [],
            streak: 0,
            completedQuizzes: 0,
            createdContent: role.includes('teacher') ? 0 : undefined
          }
        }
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
      
      // Institution management
      createInstitution: (institutionData) => {
        const user = get().currentUser
        if (!user || !get().isTeacher()) throw new Error('Only teachers can create institutions')
        
        const institution = {
          ...institutionData,
          id: `inst-${Date.now()}`,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          studentCount: 0,
          activeQuizzes: 0
        }
        
        // Update current user with institution
        const updatedUser = { ...user, institution }
        set(state => ({
          currentUser: updatedUser,
          users: state.users.map(u => u.id === user.id ? updatedUser : u)
        }))
        
        return institution
      },
      
      // Analytics for admin
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
    }),
    { name: 'aversoltix_auth' }
  )
)

