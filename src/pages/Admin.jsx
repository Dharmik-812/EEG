import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubmissionsStore } from '../store/submissionsStore'
import Card from '../components/Card'
import { useAuthStore } from '../store/authStore'
import { Navigate, Routes, Route } from 'react-router-dom'
import toast from 'react-hot-toast'
import SEO from '../components/SEO.jsx'
import { 
  Users, School, GraduationCap, BookOpen, TrendingUp, 
  Settings, Play, Gamepad2, Award, BarChart3, Zap,
  Eye, CheckCircle, XCircle, Activity
} from 'lucide-react'

// Import playground component for admin area
const AnimationPlayground = React.lazy(() => import('./animation-playground.tsx'))

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'content', label: 'Content', icon: BookOpen },
  { id: 'playground', label: 'Dev Tools', icon: Zap },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview')
  const { pendingGames, approveGame, rejectGame, pendingQuizzes, approveQuiz, rejectQuiz } = useSubmissionsStore(s => ({
    pendingGames: s.pendingGames,
    approveGame: s.approveGame,
    rejectGame: s.rejectGame,
    pendingQuizzes: s.pendingQuizzes,
    approveQuiz: s.approveQuiz,
    rejectQuiz: s.rejectQuiz,
  }))
  const { currentUser, getAnalytics } = useAuthStore(s => ({ currentUser: s.currentUser, getAnalytics: s.getAnalytics }))

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const analytics = getAnalytics()

  const OverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Users',
            value: analytics.totalUsers,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            change: '+12%'
          },
          {
            label: 'Institutions',
            value: analytics.totalInstitutions,
            icon: School,
            color: 'from-emerald-500 to-emerald-600',
            change: '+8%'
          },
          {
            label: 'Total XP Earned',
            value: analytics.totalXP.toLocaleString(),
            icon: Award,
            color: 'from-amber-500 to-amber-600',
            change: '+23%'
          },
          {
            label: 'Quizzes Completed',
            value: analytics.totalQuizzes,
            icon: BookOpen,
            color: 'from-purple-500 to-purple-600',
            change: '+18%'
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-transform duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            User Roles Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.roleDistribution).map(([role, count]) => {
              const percentage = ((count / analytics.totalUsers) * 100).toFixed(1)
              const roleConfig = {
                admin: { color: 'bg-red-500', label: 'Administrators' },
                'school-teacher': { color: 'bg-emerald-500', label: 'School Teachers' },
                'college-teacher': { color: 'bg-blue-500', label: 'College Teachers' },
                'school-student': { color: 'bg-purple-500', label: 'School Students' },
                'college-student': { color: 'bg-indigo-500', label: 'College Students' },
                visitor: { color: 'bg-slate-500', label: 'Visitors' },
              }[role] || { color: 'bg-slate-400', label: role }
              
              return (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${roleConfig.color}`} />
                    <span className="font-medium">{roleConfig.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{count}</span>
                    <span className="text-sm text-slate-500 ml-2">({percentage}%)</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {analytics.recentUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role.replace('-', ' ')} • {user.institution?.name || 'No institution'}</p>
                </div>
                <div className="text-xs text-slate-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Legacy'}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  )

  const UsersTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <h3 className="font-semibold mb-4">All Users</h3>
        <div className="space-y-2">
          {analytics.recentUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <p className="text-xs text-slate-400">{user.role.replace('-', ' ')} • {user.institution?.name || 'No institution'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{user.stats?.xp || 0} XP</p>
                <p className="text-sm text-slate-500">{user.stats?.completedQuizzes || 0} quizzes</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )

  const ContentTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <div className="font-semibold mb-4 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-purple-500" />
          Pending Games
        </div>
        <div className="space-y-3">
          {pendingGames.length === 0 && <div className="text-sm text-slate-500 p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">No pending games.</div>}
          {pendingGames.map(g => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-purple-500"
            >
              <div>
                <div className="font-medium">{g.title}</div>
                <div className="text-sm text-slate-500">By {g.ownerId} • {new Date(g.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors" onClick={() => { approveGame(g.id); toast.success('Game approved!') }}>
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" onClick={() => { rejectGame(g.id); toast.success('Game rejected') }}>
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Pending Quizzes
        </div>
        <div className="space-y-3">
          {pendingQuizzes.length === 0 && <div className="text-sm text-slate-500 p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">No pending quizzes.</div>}
          {pendingQuizzes.map(q => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-blue-500"
            >
              <div>
                <div className="font-medium">{q.quiz.title}</div>
                <div className="text-sm text-slate-500">Topic: {q.quiz.topic} • {new Date(q.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors" onClick={() => { approveQuiz(q.id); toast.success('Quiz approved!') }}>
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" onClick={() => { rejectQuiz(q.id); toast.success('Quiz rejected') }}>
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )

  const PlaygroundTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">🛠️ Development Tools</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          This area contains developer tools and animation testing utilities. Only visible to administrators.
        </p>
      </div>
      <React.Suspense fallback={<div className="p-8 text-center">Loading animation playground...</div>}>
        <AnimationPlayground />
      </React.Suspense>
    </motion.div>
  )

  return (
    <>
      <SEO title="Admin Dashboard" description="Comprehensive admin panel for AverSoltix platform management." noIndex={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Dashboard</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300">Manage users, content, and monitor platform analytics</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20">
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                    data-ripple
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab key="overview" />}
            {activeTab === 'users' && <UsersTab key="users" />}
            {activeTab === 'content' && <ContentTab key="content" />}
            {activeTab === 'playground' && <PlaygroundTab key="playground" />}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

