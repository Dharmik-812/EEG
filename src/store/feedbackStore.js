import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFeedbackStore = create(
  persist(
    (set, get) => ({
      feedbackSubmissions: [],
      supportSubmissions: [],

      submitFeedback: (feedbackData) => {
        const id = `fb-${Date.now()}`
        const submission = {
          id,
          type: 'feedback',
          ...feedbackData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set(state => ({
          feedbackSubmissions: [submission, ...state.feedbackSubmissions]
        }))
        
        return submission
      },

      submitSupport: (supportData) => {
        const id = `sp-${Date.now()}`
        const submission = {
          id,
          type: 'support',
          ...supportData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set(state => ({
          supportSubmissions: [submission, ...state.supportSubmissions]
        }))
        
        return submission
      },

      updateFeedbackStatus: (id, status, adminNotes = '') => {
        set(state => ({
          feedbackSubmissions: state.feedbackSubmissions.map(submission =>
            submission.id === id
              ? { ...submission, status, adminNotes, updatedAt: new Date().toISOString() }
              : submission
          )
        }))
      },

      updateSupportStatus: (id, status, adminNotes = '') => {
        set(state => ({
          supportSubmissions: state.supportSubmissions.map(submission =>
            submission.id === id
              ? { ...submission, status, adminNotes, updatedAt: new Date().toISOString() }
              : submission
          )
        }))
      },

      deleteFeedback: (id) => {
        set(state => ({
          feedbackSubmissions: state.feedbackSubmissions.filter(submission => submission.id !== id)
        }))
      },

      deleteSupport: (id) => {
        set(state => ({
          supportSubmissions: state.supportSubmissions.filter(submission => submission.id !== id)
        }))
      },

      getFeedbackStats: () => {
        const feedback = get().feedbackSubmissions
        const support = get().supportSubmissions
        
        return {
          totalFeedback: feedback.length,
          totalSupport: support.length,
          pendingFeedback: feedback.filter(f => f.status === 'pending').length,
          pendingSupport: support.filter(s => s.status === 'pending').length,
          resolvedFeedback: feedback.filter(f => f.status === 'resolved').length,
          resolvedSupport: support.filter(s => s.status === 'resolved').length,
          recentSubmissions: [...feedback, ...support]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
        }
      }
    }),
    { name: 'aversoltix_feedback_v1' }
  )
)
