import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAdminRequestStore = create(
  persist(
    (set, get) => ({
      requests: [],

      submitAdminRequest: ({ userId, userName, userEmail, role, institution, scope, reason }) => {
        const id = `adm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const request = {
          id,
          userId,
          userName,
          userEmail,
          role,
          institution: institution || null,
          scope, // 'class' | 'institution'
          reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(state => ({ requests: [request, ...state.requests] }))
        return request
      },

      updateAdminRequestStatus: ({ id, status, adminNotes }) => {
        set(state => ({
          requests: state.requests.map(r =>
            r.id === id
              ? { ...r, status, adminNotes: adminNotes ?? r.adminNotes, updatedAt: new Date().toISOString() }
              : r
          )
        }))
      },

      getPendingAdminRequests: () => {
        return get().requests.filter(r => r.status === 'pending')
      },
    }),
    { name: 'aversoltix_admin_requests_v1' }
  )
)

