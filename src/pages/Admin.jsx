import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import Card from '../components/Card'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import toast from 'react-hot-toast'
import {
  Users, School, GraduationCap, BookOpen, TrendingUp,
  Settings, Gamepad2, BarChart3, Zap,
  Eye, CheckCircle, XCircle, Activity, Plus, Edit, Trash2,
  Building, MapPin, Calendar, Search, Filter, Download,
  Server, Cpu, HardDrive, Wifi, Globe, RefreshCw, MoreHorizontal,
  Database, Award, UserPlus, UserMinus, MessageSquare,
  FileText, Image, Volume2, Video, Package, Clock, Star,
  ThumbsUp, ThumbsDown, Flag, ChevronDown, ChevronRight,
  Layers, Bell, AlertTriangle, Shield, Lock, Upload
} from 'lucide-react'

const AnimationPlayground = React.lazy(() => import('./animation-playground.tsx'))

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Platform analytics and insights' },
  { id: 'users', label: 'User Management', icon: Users, description: 'Manage users and permissions' },
  { id: 'institutions', label: 'Institutions', icon: Building, description: 'School and college management' },
  { id: 'content', label: 'Content Moderation', icon: BookOpen, description: 'Review and approve content' },
  { id: 'analytics', label: 'Advanced Analytics', icon: TrendingUp, description: 'Detailed platform metrics' },
  { id: 'system', label: 'System Health', icon: Server, description: 'Monitor system performance' },
  { id: 'settings', label: 'Platform Settings', icon: Settings, description: 'Configure platform settings' },
  { id: 'playground', label: 'Dev Tools', icon: Zap, description: 'Development utilities and testing' },
]

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    type: 'school',
    address: '',
    email: '',
    phone: '',
    website: '',
    contactPerson: '',
    establishedYear: '',
    description: ''
  })
  const [editingInstitution, setEditingInstitution] = useState(null)
  const [userFilter, setUserFilter] = useState('all')
  const [institutionFilter, setInstitutionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    storage: 38,
    bandwidth: 78,
    activeUsers: 247,
    totalRequests: 15439,
    avgResponseTime: 120,
    errorRate: 0.2,
    uptime: 99.9
  })
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'High CPU usage detected', time: new Date(Date.now() - 5 * 60000) },
    { id: 2, type: 'info', message: 'New user registration surge', time: new Date(Date.now() - 15 * 60000) },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: new Date(Date.now() - 30 * 60000) }
  ])

  const users = useAuthStore(s => s.users)
  const {
    pendingGames,
    approvedGames,
    approveGame,
    rejectGame,
    pendingQuizzes,
    approvedQuizzes,
    approveQuiz,
    rejectQuiz
  } = useSubmissionsStore(s => ({
    pendingGames: s.pendingGames,
    approvedGames: s.approvedGames,
    approveGame: s.approveGame,
    rejectGame: s.rejectGame,
    pendingQuizzes: s.pendingQuizzes,
    approvedQuizzes: s.approvedQuizzes,
    approveQuiz: s.approveQuiz,
    rejectQuiz: s.rejectQuiz,
  }))

  const {
    currentUser,
    getAnalytics,
    getInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    updateUserRole,
    deleteUser,
    getUserActivity,
    getSystemLogs
  } = useAuthStore(s => ({
    currentUser: s.currentUser,
    getAnalytics: s.getAnalytics,
    getInstitutions: s.getInstitutions,
    createInstitution: s.createInstitution,
    updateInstitution: s.updateInstitution,
    deleteInstitution: s.deleteInstitution,
    updateUserRole: s.updateUserRole,
    deleteUser: s.deleteUser,
    getUserActivity: s.getUserActivity,
    getSystemLogs: s.getSystemLogs
  }))

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const analytics = getAnalytics()
  const institutions = getInstitutions()
  const totalGames = (approvedGames?.length || 0) + (pendingGames?.length || 0)
  const totalQuizzes = (approvedQuizzes?.length || 0) + (pendingQuizzes?.length || 0)
  const countsByRole = {
    admin: analytics.roleDistribution.admin || 0,
    visitor: analytics.roleDistribution.visitor || 0,
    schoolStudents: analytics.roleDistribution['school-student'] || 0,
    collegeStudents: analytics.roleDistribution['college-student'] || 0,
    schoolTeachers: analytics.roleDistribution['school-teacher'] || 0,
    collegeTeachers: analytics.roleDistribution['college-teacher'] || 0,
    genericUsers: analytics.roleDistribution.user || 0,
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, prev.memory + (Math.random() - 0.5) * 8)),
        storage: Math.max(10, Math.min(80, prev.storage + (Math.random() - 0.5) * 5)),
        bandwidth: Math.max(40, Math.min(100, prev.bandwidth + (Math.random() - 0.5) * 15)),
        activeUsers: Math.max(100, Math.min(500, prev.activeUsers + Math.floor((Math.random() - 0.5) * 20))),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 50),
        avgResponseTime: Math.max(50, Math.min(300, prev.avgResponseTime + (Math.random() - 0.5) * 40)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5)),
        uptime: Math.max(95, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1))
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Filter and sort users
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = userFilter === 'all' ||
      (userFilter === 'students' && user.role.includes('student')) ||
      (userFilter === 'teachers' && user.role.includes('teacher')) ||
      (userFilter === 'admins' && user.role === 'admin') ||
      (userFilter === 'recent' && user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    let aValue = a[sortBy] || ''
    let bValue = b[sortBy] || ''

    if (sortBy === 'createdAt') {
      aValue = new Date(aValue || 0)
      bValue = new Date(bValue || 0)
    }

    if (sortBy === 'xp') {
      aValue = a.stats?.xp || 0
      bValue = b.stats?.xp || 0
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const StatCard = ({ title, value, change, icon: Icon, color, trend, isLive, onClick }) => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg relative`}>
          <Icon className="h-6 w-6" />
          {isLive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          )}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
            trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
          {change}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{title}</p>
      </div>
    </motion.div>
  )

  const NotificationCard = ({ notification, onDismiss }) => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 rounded-lg border-l-4 ${notification.type === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
            notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
              'bg-blue-50 border-blue-500 text-blue-800'
        } dark:bg-opacity-10`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notification.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
          {notification.type === 'error' && <XCircle className="h-5 w-5" />}
          {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {notification.type === 'info' && <Bell className="h-5 w-5" />}
          <div>
            <p className="font-medium">{notification.message}</p>
            <p className="text-sm opacity-75">{notification.time.toLocaleTimeString()}</p>
          </div>
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="p-1 hover:bg-black/10 rounded"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )

  const OverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Admin Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 -mx-6 -mt-6 px-6 pt-6 pb-8 mb-10 border-b border-slate-200 dark:border-slate-700">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white leading-tight">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentUser?.name || 'Admin'}
                </span>!
                <span className="inline-block ml-2 text-3xl">⚡</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
                  Platform Administrator
                </span>

                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
                  <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
                  <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    System Uptime: {systemMetrics.uptime.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admin Quick Actions */}
      <div className="mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            Admin Quick Actions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Essential admin tools and management features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {[
            { id: 'users', label: 'Manage Users', icon: Users, color: 'blue', count: analytics.totalUsers },
            { id: 'content', label: 'Content Review', icon: BookOpen, color: 'purple', count: pendingGames.length + pendingQuizzes.length },
            { id: 'institutions', label: 'Institutions', icon: Building, color: 'emerald', count: institutions.length },
            { id: 'system', label: 'System Health', icon: Server, color: 'orange', status: systemMetrics.uptime > 99 ? 'Excellent' : 'Good' },
          ].map((action, i) => {
            const Icon = action.icon
            const colorClasses = {
              blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20', icon: 'bg-blue-500', hover: 'hover:shadow-blue-500/20' },
              purple: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/20', icon: 'bg-purple-500', hover: 'hover:shadow-purple-500/20' },
              emerald: { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/20', icon: 'bg-emerald-500', hover: 'hover:shadow-emerald-500/20' },
              orange: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/20', icon: 'bg-orange-500', hover: 'hover:shadow-orange-500/20' },
            }
            const colors = colorClasses[action.color]

            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(action.id)}
                className={`group relative p-6 ${colors.bg} rounded-2xl border-2 border-white dark:border-slate-700 ${colors.hover} transition-all duration-300 text-left shadow-lg hover:shadow-xl overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 transform rotate-12 translate-x-6 -translate-y-6">
                  <Icon className="w-full h-full" />
                </div>

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl ${colors.icon} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    {action.label}
                  </h3>

                  <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-200 mb-2">
                    {action.count !== undefined ? action.count.toLocaleString() : action.status}
                  </div>

                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Manage</span>
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              System Notifications
            </h3>
            <button
              onClick={() => setNotifications([])}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {notifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                />
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          change="+12%"
          icon={Users}
          color="from-blue-500 to-blue-600"
          trend="up"
          onClick={() => setActiveTab('users')}
        />
        <StatCard
          title="Active Sessions"
          value={systemMetrics.activeUsers.toLocaleString()}
          change="+8%"
          icon={Activity}
          color="from-emerald-500 to-emerald-600"
          trend="up"
          isLive={true}
        />
        <StatCard
          title="Total Requests"
          value={systemMetrics.totalRequests.toLocaleString()}
          change="+23%"
          icon={Globe}
          color="from-purple-500 to-purple-600"
          trend="up"
          isLive={true}
        />
        <StatCard
          title="Response Time"
          value={`${Math.round(systemMetrics.avgResponseTime)}ms`}
          change="-2%"
          icon={Zap}
          color="from-amber-500 to-amber-600"
          trend="down"
          isLive={true}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Games"
          value={totalGames.toLocaleString()}
          change={`${pendingGames.length} pending`}
          icon={Gamepad2}
          color="from-emerald-500 to-teal-600"
          trend="up"
          onClick={() => setActiveTab('content')}
        />
        <StatCard
          title="Total Quizzes"
          value={totalQuizzes.toLocaleString()}
          change={`${pendingQuizzes.length} pending`}
          icon={BookOpen}
          color="from-sky-500 to-blue-600"
          trend="up"
          onClick={() => setActiveTab('content')}
        />
        <StatCard
          title="Students (School/College)"
          value={`${countsByRole.schoolStudents + countsByRole.collegeStudents}`}
          change={`${countsByRole.schoolStudents}/${countsByRole.collegeStudents}`}
          icon={GraduationCap}
          color="from-indigo-500 to-purple-600"
          trend="up"
        />
        <StatCard
          title="Teachers (School/College)"
          value={`${countsByRole.schoolTeachers + countsByRole.collegeTeachers}`}
          change={`${countsByRole.schoolTeachers}/${countsByRole.collegeTeachers}`}
          icon={School}
          color="from-rose-500 to-orange-600"
          trend="up"
        />
      </div>

      {/* System Health & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Live Activity Feed
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-500">Live</span>
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[
              { action: 'New user registered', user: 'Sarah Johnson', time: Math.floor(Math.random() * 60), type: 'user' },
              { action: 'Quiz completed', user: 'Alex Chen', time: Math.floor(Math.random() * 60), type: 'quiz' },
              { action: 'Game submitted', user: 'Maria Lopez', time: Math.floor(Math.random() * 60), type: 'game' },
              { action: 'Institution created', user: 'Dr. Smith', time: Math.floor(Math.random() * 60), type: 'institution' },
              { action: 'Badge earned', user: 'John Doe', time: Math.floor(Math.random() * 60), type: 'badge' },
              { action: 'Course enrolled', user: 'Emily Davis', time: Math.floor(Math.random() * 60), type: 'course' },
              { action: 'System backup completed', user: 'System', time: Math.floor(Math.random() * 60), type: 'system' },
              { action: 'Security scan passed', user: 'Security Bot', time: Math.floor(Math.random() * 60), type: 'security' }
            ].map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full animate-pulse ${activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'quiz' ? 'bg-purple-500' :
                      activity.type === 'game' ? 'bg-emerald-500' :
                        activity.type === 'institution' ? 'bg-orange-500' :
                          activity.type === 'badge' ? 'bg-amber-500' :
                            activity.type === 'system' ? 'bg-red-500' :
                              activity.type === 'security' ? 'bg-indigo-500' :
                                'bg-slate-500'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.user} • {activity.time}s ago</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" />
            System Health Monitor
          </h3>
          <div className="space-y-4">
            {Object.entries(systemMetrics).filter(([key]) => ['cpu', 'memory', 'storage', 'bandwidth'].includes(key)).map(([key, value]) => {
              const config = {
                cpu: { label: 'CPU Usage', icon: Cpu, color: value > 80 ? 'red' : value > 60 ? 'yellow' : 'green' },
                memory: { label: 'Memory', icon: HardDrive, color: value > 90 ? 'red' : value > 70 ? 'yellow' : 'green' },
                storage: { label: 'Storage', icon: Database, color: value > 75 ? 'red' : value > 50 ? 'yellow' : 'green' },
                bandwidth: { label: 'Bandwidth', icon: Wifi, color: value > 95 ? 'red' : value > 80 ? 'yellow' : 'green' }
              }[key]

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <config.icon className="h-5 w-5 text-slate-500" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{config.label}</span>
                      <span className={`font-bold ${config.color === 'red' ? 'text-red-600' :
                          config.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                        }`}>{Math.round(value)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-3 rounded-full transition-all duration-1000 ease-out ${config.color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            config.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                              'bg-gradient-to-r from-green-500 to-green-600'
                          }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Additional System Stats */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{systemMetrics.uptime.toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{systemMetrics.errorRate.toFixed(2)}%</p>
                <p className="text-sm text-slate-500">Error Rate</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
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
                user: { color: 'bg-gray-500', label: 'Generic Users' }
              }[role] || { color: 'bg-slate-400', label: role }

              return (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => {
                    setUserFilter(role)
                    setActiveTab('users')
                  }}
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
            Recent User Activity
          </h3>
          <div className="space-y-3">
            {analytics.recentUsers.slice(0, 8).map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => {
                  setSearchTerm(user.name)
                  setActiveTab('users')
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role.replace('-', ' ')} • {user.institution?.name || 'No institution'}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Legacy'}
                  </div>
                  <div className="text-xs font-medium text-emerald-600">
                    {user.stats?.xp || 0} XP
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Institution Overview */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-500" />
            Institution Overview
          </h3>
          <button
            onClick={() => setActiveTab('institutions')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {institutions.slice(0, 3).map((inst, i) => (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setActiveTab('institutions')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${inst.type === 'school' ? 'bg-purple-100 dark:bg-purple-900/20' :
                    inst.type === 'college' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      'bg-emerald-100 dark:bg-emerald-900/20'
                  }`}>
                  {inst.type === 'school' ?
                    <School className="h-5 w-5 text-purple-600 dark:text-purple-400" /> :
                    inst.type === 'college' ?
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" /> :
                      <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  }
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{inst.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{inst.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-semibold text-blue-600">{inst.teachers || 0}</p>
                  <p className="text-slate-500">Teachers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600">{inst.students || 0}</p>
                  <p className="text-slate-500">Students</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {institutions.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No institutions created yet</p>
            <button
              onClick={() => setActiveTab('institutions')}
              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Create your first institution →
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  )

  const UsersTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* User Management Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h2>
          <p className="text-slate-600 dark:text-slate-300">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2">
            <Upload className="h-4 w-4" /> Import Users
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Users
          </button>
          <button className="btn-eco flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Users</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
              <option value="admins">Administrators</option>
              <option value="recent">Recent (7 days)</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="xp-desc">Highest XP</option>
              <option value="xp-asc">Lowest XP</option>
            </select>
          </div>
        </div>
      </Card>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{filteredUsers.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {userFilter === 'all' ? 'Total Users' :
                  userFilter === 'students' ? 'Students' :
                    userFilter === 'teachers' ? 'Teachers' :
                      userFilter === 'admins' ? 'Administrators' :
                        'Recent Users'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredUsers.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">New This Week</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredUsers.filter(u => u.role.includes('student')).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Students</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <School className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredUsers.filter(u => u.role.includes('teacher')).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Teachers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">{selectedUsers.length} users selected</span>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Send Message
                </button>
                <button className="btn-outline text-sm flex items-center gap-2">
                  <Download className="h-4 w-4" /> Export Selected
                </button>
                <button className="btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Selected
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(paginatedUsers.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">User</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Institution</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Progress</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Joined</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedUsers.includes(user.id) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                    }`}
                >
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={user.role}
                      onChange={(e) => {
                        if (updateUserRole) {
                          updateUserRole(user.id, e.target.value)
                          toast.success(`Updated ${user.name}'s role to ${e.target.value.replace('-', ' ')}`)
                        }
                      }}
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-emerald-500 ${user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          user.role.includes('teacher') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                            user.role.includes('student') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                    >
                      <option value="visitor">Visitor</option>
                      <option value="user">User</option>
                      <option value="school-student">School Student</option>
                      <option value="college-student">College Student</option>
                      <option value="school-teacher">School Teacher</option>
                      <option value="college-teacher">College Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    {user.institution ? (
                      <div>
                        <p className="font-medium text-sm">{user.institution.name}</p>
                        <p className="text-xs text-slate-500">{user.institution.type}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>XP: {user.stats?.xp || 0}</span>
                          <span>Level {Math.floor((user.stats?.xp || 0) / 500) + 1}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, ((user.stats?.xp || 0) % 500) / 5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Legacy'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Profile"
                        onClick={() => {
                          // View user profile logic
                          toast.info(`Viewing ${user.name}'s profile`)
                        }}
                      >
                        <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit User"
                        onClick={() => {
                          // Edit user logic
                          toast.info(`Editing ${user.name}`)
                        }}
                      >
                        <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                        title="Delete User"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                            if (deleteUser) {
                              deleteUser(user.id)
                              toast.success(`Deleted ${user.name}`)
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="More Options"
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No users found</p>
              <p className="text-sm text-slate-500 mt-1">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'Users will appear here once they register'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm border rounded-lg ${currentPage === pageNum
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )

  const InstitutionsTab = () => {
    const filteredInstitutions = institutions.filter(inst => {
      if (institutionFilter === 'all') return true
      return inst.type === institutionFilter
    })

    const handleCreateInstitution = () => {
      if (!newInstitution.name || !newInstitution.email) {
        toast.error('Name and email are required')
        return
      }

      try {
        createInstitution({
          ...newInstitution,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          userCount: 0,
          teachers: 0,
          students: 0
        })
        setNewInstitution({
          name: '',
          type: 'school',
          address: '',
          email: '',
          phone: '',
          website: '',
          contactPerson: '',
          establishedYear: '',
          description: ''
        })
        toast.success('Institution created successfully!')
      } catch (error) {
        toast.error('Failed to create institution')
      }
    }

    const handleUpdateInstitution = () => {
      if (!editingInstitution) return

      try {
        updateInstitution(editingInstitution.id, editingInstitution)
        setEditingInstitution(null)
        toast.success('Institution updated successfully!')
      } catch (error) {
        toast.error('Failed to update institution')
      }
    }

    const handleDeleteInstitution = (id, name) => {
      if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        try {
          deleteInstitution(id)
          toast.success('Institution deleted successfully!')
        } catch (error) {
          toast.error('Failed to delete institution')
        }
      }
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Institution Management Header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Institution Management</h2>
            <p className="text-slate-600 dark:text-slate-300">Manage schools, colleges, and universities on the platform</p>
          </div>
          <div className="flex gap-2">
            <select
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Types</option>
              <option value="school">Schools</option>
              <option value="college">Colleges</option>
              <option value="university">Universities</option>
            </select>
          </div>
        </div>

        {/* Institution Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{filteredInstitutions.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {institutionFilter === 'all' ? 'Total Institutions' :
                    institutionFilter === 'school' ? 'Schools' :
                      institutionFilter === 'college' ? 'Colleges' : 'Universities'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <School className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {institutions.filter(i => i.type === 'school').length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Schools</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {institutions.filter(i => i.type === 'college').length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Colleges</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {institutions.filter(i => i.type === 'university').length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Universities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Institution */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-500" />
            Create New Institution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Institution Name *</label>
              <input
                type="text"
                value={newInstitution.name}
                onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter institution name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                value={newInstitution.type}
                onChange={(e) => setNewInstitution({ ...newInstitution, type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="school">School</option>
                <option value="college">College</option>
                <option value="university">University</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={newInstitution.email}
                onChange={(e) => setNewInstitution({ ...newInstitution, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="admin@institution.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={newInstitution.phone}
                onChange={(e) => setNewInstitution({ ...newInstitution, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={newInstitution.website}
                onChange={(e) => setNewInstitution({ ...newInstitution, website: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="https://institution.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Person</label>
              <input
                type="text"
                value={newInstitution.contactPerson}
                onChange={(e) => setNewInstitution({ ...newInstitution, contactPerson: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={newInstitution.address}
                onChange={(e) => setNewInstitution({ ...newInstitution, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="123 Education St, Learning City, LC 12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Established Year</label>
              <input
                type="number"
                value={newInstitution.establishedYear}
                onChange={(e) => setNewInstitution({ ...newInstitution, establishedYear: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="2000"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={newInstitution.description}
                onChange={(e) => setNewInstitution({ ...newInstitution, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Brief description of the institution"
                rows="3"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleCreateInstitution}
              className="btn-primary flex items-center gap-2"
              data-ripple
            >
              <Plus className="h-4 w-4" /> Create Institution
            </button>
          </div>
        </Card>

        {/* Existing Institutions */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            Existing Institutions ({filteredInstitutions.length})
          </h3>
          {filteredInstitutions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No institutions found</p>
              <p className="text-sm">
                {institutionFilter === 'all'
                  ? 'Create your first institution above'
                  : `No ${institutionFilter}s found. Try changing the filter or create a new one.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstitutions.map((inst, i) => (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
                >
                  {editingInstitution?.id === inst.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <input
                            type="text"
                            value={editingInstitution.name}
                            onChange={(e) => setEditingInstitution({ ...editingInstitution, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={editingInstitution.type}
                            onChange={(e) => setEditingInstitution({ ...editingInstitution, type: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                          >
                            <option value="school">School</option>
                            <option value="college">College</option>
                            <option value="university">University</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input
                            type="email"
                            value={editingInstitution.email}
                            onChange={(e) => setEditingInstitution({ ...editingInstitution, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                          <input
                            type="tel"
                            value={editingInstitution.phone || ''}
                            onChange={(e) => setEditingInstitution({ ...editingInstitution, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Website</label>
                          <input
                            type="url"
                            value={editingInstitution.website || ''}
                            onChange={(e) => setEditingInstitution({ ...editingInstitution, website: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={editingInstitution.contactPerson || ''}
                            onChange={(e) => setEditingInstitution({ ...editingInstitution, contactPerson: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium mb-1">Address</label>
                          <input
                            type="text"
                            value={editingInstitution.address || ''}
                            onChange={(e) => setEditingInstitution({ ...editingInstitution, address: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdateInstitution} className="btn-primary text-sm">
                          Save Changes
                        </button>
                        <button onClick={() => setEditingInstitution(null)} className="btn-outline text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-3 rounded-lg ${inst.type === 'school' ? 'bg-purple-100 dark:bg-purple-900/20' :
                              inst.type === 'college' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                'bg-emerald-100 dark:bg-emerald-900/20'
                            }`}>
                            {inst.type === 'school' ?
                              <School className="h-6 w-6 text-purple-600 dark:text-purple-400" /> :
                              inst.type === 'college' ?
                                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" /> :
                                <Building className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            }
                          </div>
                          <div>
                            <h4 className="font-semibold text-xl">{inst.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{inst.type}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                          {inst.address && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{inst.address}</span>
                            </div>
                          )}
                          {inst.email && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <span>📧</span>
                              <span>{inst.email}</span>
                            </div>
                          )}
                          {inst.phone && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <span>📞</span>
                              <span>{inst.phone}</span>
                            </div>
                          )}
                          {inst.website && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Globe className="h-4 w-4 flex-shrink-0" />
                              <a href={inst.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                                {inst.website}
                              </a>
                            </div>
                          )}
                          {inst.contactPerson && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <span>👤</span>
                              <span>{inst.contactPerson}</span>
                            </div>
                          )}
                          {inst.establishedYear && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>Est. {inst.establishedYear}</span>
                            </div>
                          )}
                        </div>

                        {inst.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                            {inst.description}
                          </p>
                        )}

                        <div className="flex gap-6 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {inst.userCount || 0} total users
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">
                            {inst.teachers || 0} teachers
                          </span>
                          <span className="text-purple-600 dark:text-purple-400">
                            {inst.students || 0} students
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(inst.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-6">
                        <button
                          onClick={() => setEditingInstitution(inst)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit institution"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInstitution(inst.id, inst.name)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete institution"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    )
  }

  const ContentTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Content Moderation Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Content Moderation</h2>
          <p className="text-slate-600 dark:text-slate-300">Review and moderate user-submitted games and quizzes</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span>{pendingGames.length + pendingQuizzes.length} items pending review</span>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{pendingGames.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Pending Games</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{pendingQuizzes.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Pending Quizzes</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{approvedGames.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Approved Games</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{approvedQuizzes.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Approved Quizzes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Games */}
      <Card>
        <div className="font-semibold mb-4 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-purple-500" />
          Pending Games ({pendingGames.length})
        </div>
        <div className="space-y-3">
          {pendingGames.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p className="font-medium">No pending games</p>
              <p className="text-sm">All games have been reviewed!</p>
            </div>
          ) : (
            pendingGames.map(g => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Gamepad2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{g.title}</h4>
                      <p className="text-sm text-slate-500">
                        By {g.ownerId} • {new Date(g.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {g.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 ml-12 mb-2">
                      {g.description}
                    </p>
                  )}
                  <div className="flex gap-4 ml-12 text-xs text-slate-500">
                    {g.category && <span>Category: {g.category}</span>}
                    {g.difficulty && <span>Difficulty: {g.difficulty}</span>}
                    {g.tags && g.tags.length > 0 && (
                      <span>Tags: {g.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    onClick={() => {
                      approveGame(g.id)
                      toast.success(`Game "${g.title}" approved!`)
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to reject "${g.title}"?`)) {
                        rejectGame(g.id)
                        toast.success(`Game "${g.title}" rejected`)
                      }
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Pending Quizzes */}
      <Card>
        <div className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Pending Quizzes ({pendingQuizzes.length})
        </div>
        <div className="space-y-3">
          {pendingQuizzes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
              <p className="font-medium">No pending quizzes</p>
              <p className="text-sm">All quizzes have been reviewed!</p>
            </div>
          ) : (
            pendingQuizzes.map(q => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{q.quiz.title}</h4>
                      <p className="text-sm text-slate-500">
                        Topic: {q.quiz.topic} • {new Date(q.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {q.quiz.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 ml-12 mb-2">
                      {q.quiz.description}
                    </p>
                  )}
                  <div className="flex gap-4 ml-12 text-xs text-slate-500">
                    <span>{q.quiz.questions?.length || 0} questions</span>
                    {q.quiz.difficulty && <span>Difficulty: {q.quiz.difficulty}</span>}
                    {q.quiz.timeLimit && <span>Time: {q.quiz.timeLimit} min</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    onClick={() => {
                      approveQuiz(q.id)
                      toast.success(`Quiz "${q.quiz.title}" approved!`)
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to reject "${q.quiz.title}"?`)) {
                        rejectQuiz(q.id)
                        toast.success(`Quiz "${q.quiz.title}" rejected`)
                      }
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      {/* Recently Approved Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-emerald-500" />
            Recently Approved Games
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {approvedGames.slice(0, 5).map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                  <Gamepad2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{game.title}</p>
                  <p className="text-xs text-slate-500">
                    Approved {new Date(game.approvedAt || game.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-slate-500">{game.rating || '4.5'}</span>
                </div>
              </motion.div>
            ))}
            {approvedGames.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No approved games yet</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Recently Approved Quizzes
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {approvedQuizzes.slice(0, 5).map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{quiz.quiz.title}</p>
                  <p className="text-xs text-slate-500">
                    {quiz.quiz.topic} • Approved {new Date(quiz.approvedAt || quiz.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-slate-500">{quiz.rating || '4.3'}</span>
                </div>
              </motion.div>
            ))}
            {approvedQuizzes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No approved quizzes yet</p>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  )

  const SystemTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">System Health & Monitoring</h2>
        <p className="text-slate-600 dark:text-slate-300">Monitor system performance, logs, and health metrics</p>
      </div>

      {/* System Alerts */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          System Alerts
        </h3>
        <div className="space-y-3">
          {[
            { level: 'warning', message: 'High CPU usage detected on server-2', time: '5 minutes ago' },
            { level: 'info', message: 'Database backup completed successfully', time: '1 hour ago' },
            { level: 'success', message: 'SSL certificates renewed', time: '2 hours ago' }
          ].map((alert, i) => (
            <div key={i} className={`p-3 rounded-lg border-l-4 ${alert.level === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                alert.level === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
                  alert.level === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                    'bg-blue-50 border-blue-500 text-blue-800'
              } dark:bg-opacity-10`}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{alert.message}</p>
                <span className="text-sm opacity-75">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" />
            Server Performance
          </h3>
          <div className="space-y-4">
            {[
              { name: 'CPU Usage', value: systemMetrics.cpu, max: 100, unit: '%', color: 'blue' },
              { name: 'Memory Usage', value: systemMetrics.memory, max: 100, unit: '%', color: 'purple' },
              { name: 'Disk Usage', value: systemMetrics.storage, max: 100, unit: '%', color: 'green' },
              { name: 'Network I/O', value: systemMetrics.bandwidth, max: 100, unit: '%', color: 'amber' }
            ].map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className={`text-sm font-bold text-${metric.color}-600`}>
                    {Math.round(metric.value)}{metric.unit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600 transition-all duration-1000`}
                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Live Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{systemMetrics.activeUsers}</p>
              <p className="text-sm text-slate-500">Active Users</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{systemMetrics.totalRequests.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Requests</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{Math.round(systemMetrics.avgResponseTime)}ms</p>
              <p className="text-sm text-slate-500">Avg Response</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{systemMetrics.errorRate.toFixed(2)}%</p>
              <p className="text-sm text-slate-500">Error Rate</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )

  const AnalyticsTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
      <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
      <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">Advanced Analytics</p>
      <p className="text-slate-500 mt-2">Detailed platform metrics and insights coming soon</p>
    </motion.div>
  )

  const SettingsTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
      <Settings className="h-16 w-16 mx-auto mb-4 text-slate-400" />
      <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">Platform Settings</p>
      <p className="text-slate-500 mt-2">Configure platform-wide settings and preferences</p>
    </motion.div>
  )

  const PlaygroundTab = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header (restored entrance animation) */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Dashboard</span>
              </h1>
              <button
                onClick={() => navigate('/')}
                className="px-3 py-2 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                title="Return to main site"
              >
                ← Back to Site
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Manage users, content, and monitor platform analytics</p>
          </motion.div>

          {/* Enhanced Tab Navigation (animated once on mount) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id
                          ? 'bg-white/20'
                          : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20'
                        }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm">{tab.label}</div>
                        <div className={`text-xs mt-1 opacity-70 ${activeTab === tab.id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                          {tab.description}
                        </div>
                      </div>
                    </div>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Tab Content - keep components mounted to prevent flicker */}
          <div className="relative">
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'overview' ? 1 : 0 }}
              style={{ display: activeTab === 'overview' ? 'block' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <OverviewTab />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'users' ? 1 : 0 }}
              style={{ display: activeTab === 'users' ? 'block' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <UsersTab />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'institutions' ? 1 : 0 }}
              style={{ display: activeTab === 'institutions' ? 'block' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <InstitutionsTab />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'content' ? 1 : 0 }}
              style={{ display: activeTab === 'content' ? 'block' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <ContentTab />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'analytics' ? 1 : 0 }}
              style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsTab />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'system' ? 1 : 0 }}
              style={{ display: activeTab === 'system' ? 'block' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <SystemTab />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'settings' ? 1 : 0 }}
              style={{ display: activeTab === 'settings' ? 'block' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <SettingsTab />
            </motion.div>
            {activeTab === 'playground' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <PlaygroundTab />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}