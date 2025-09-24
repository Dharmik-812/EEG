<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
>>>>>>> Stashed changes
import { useSubmissionsStore } from '../store/submissionsStore'
import Card from '../components/Card'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import SEO from '../components/SEO.jsx'
<<<<<<< Updated upstream

export default function Admin() {
=======
import { 
  Users, School, GraduationCap, BookOpen, TrendingUp, 
  Settings, Play, Gamepad2, Award, BarChart3, Zap,
  Eye, CheckCircle, XCircle, Activity, Plus, Edit, Trash2,
  Building, MapPin, Calendar, Search, Filter, Download,
  Upload, Bell, AlertTriangle, Shield, Globe, Database,
  Server, Cpu, HardDrive, Wifi, Lock, UserPlus, UserMinus,
  MessageSquare, FileText, Image, Volume2, Video, Package,
  RefreshCw, Clock, Star, ThumbsUp, ThumbsDown, Flag,
  MoreHorizontal, ChevronDown, ChevronRight, Layers
} from 'lucide-react'

// Import playground component for admin area
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
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [newInstitution, setNewInstitution] = useState({ name: '', type: 'school', address: '', email: '', phone: '' })
  const [editingInstitution, setEditingInstitution] = useState(null)
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    storage: 38,
    bandwidth: 78,
    activeUsers: 247,
    totalRequests: 15439,
    avgResponseTime: 120
  })
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const { pendingGames, approveGame, rejectGame, pendingQuizzes, approveQuiz, rejectQuiz } = useSubmissionsStore(s => ({
    pendingGames: s.pendingGames,
    approveGame: s.approveGame,
    rejectGame: s.rejectGame,
    pendingQuizzes: s.pendingQuizzes,
    approveQuiz: s.approveQuiz,
    rejectQuiz: s.rejectQuiz,
  }))
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
=======
=======
>>>>>>> Stashed changes
  const { 
    currentUser, 
    getAnalytics, 
    getInstitutions, 
    createInstitution, 
    updateInstitution, 
    deleteInstitution 
  } = useAuthStore(s => ({ 
    currentUser: s.currentUser, 
    getAnalytics: s.getAnalytics,
    getInstitutions: s.getInstitutions,
    createInstitution: s.createInstitution,
    updateInstitution: s.updateInstitution,
    deleteInstitution: s.deleteInstitution
  }))
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

<<<<<<< Updated upstream
  return (
    <>
      <SEO title="Admin" description="Admin panel to review and approve community games and quizzes." noIndex={true} />
    <section className="space-y-6">
      <Card>
        <div className="text-xl font-bold">Admin Panel</div>
        <div className="text-sm text-slate-500">Approve community games and quizzes. This area is only visible to administrators.</div>
      </Card>
      <Card>
        <div className="font-semibold mb-2">Pending Games</div>
        <div className="space-y-2">
          {pendingGames.length === 0 && <div className="text-sm text-slate-500">No pending games.</div>}
          {pendingGames.map(g => (
            <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">{g.title}</div>
                <div className="text-xs text-slate-500">By {g.ownerId} • {new Date(g.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline !px-3 !py-1" onClick={() => approveGame(g.id)}>Approve</button>
                <button className="btn-outline !px-3 !py-1" onClick={() => rejectGame(g.id)}>Reject</button>
              </div>
            </div>
          ))}
=======
  const analytics = getAnalytics()

  // Real-time system monitoring simulation
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
        avgResponseTime: Math.max(50, Math.min(300, prev.avgResponseTime + (Math.random() - 0.5) * 40))
      }))
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const StatCard = ({ title, value, change, icon: Icon, color, trend, isLive }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg relative`}>
          <Icon className="h-6 w-6" />
          {isLive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          )}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
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

  const OverviewTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          change="+12%"
          icon={Users}
          color="from-blue-500 to-blue-600"
          trend="up"
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

      {/* Real-time Monitoring Grid */}
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
            ].map((activity, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'quiz' ? 'bg-purple-500' :
                  activity.type === 'game' ? 'bg-emerald-500' :
                  activity.type === 'institution' ? 'bg-orange-500' :
                  activity.type === 'badge' ? 'bg-amber-500' :
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
                      <span className={`font-bold ${
                        config.color === 'red' ? 'text-red-600' :
                        config.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{Math.round(value)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                          config.color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          config.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'
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
        </Card>
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

  const UsersTab = () => {
    const filteredUsers = (users || []).filter(user => 
      !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* User Management Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-outline flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="btn-outline flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="btn-eco flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Add User
            </button>
          </div>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{filteredUsers.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Total Users</p>
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
                  {filteredUsers.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
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

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
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
                {filteredUsers.map((user, i) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
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
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                        user.role.includes('teacher') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                        user.role.includes('student') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {user.role.replace('-', ' ')}
                      </span>
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
                        >
                          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button 
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button 
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors" 
                          title="Delete User"
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
                  {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  const InstitutionsTab = () => {
    const institutions = getInstitutions()
    
    const handleCreateInstitution = () => {
      if (!newInstitution.name || !newInstitution.email) {
        toast.error('Name and email are required')
        return
      }
      createInstitution(newInstitution)
      setNewInstitution({ name: '', type: 'school', address: '', email: '', phone: '' })
      toast.success('Institution created successfully!')
    }
    
    const handleUpdateInstitution = () => {
      if (!editingInstitution) return
      updateInstitution(editingInstitution.id, editingInstitution)
      setEditingInstitution(null)
      toast.success('Institution updated successfully!')
    }
    
    const handleDeleteInstitution = (id) => {
      if (window.confirm('Are you sure you want to delete this institution?')) {
        deleteInstitution(id)
        toast.success('Institution deleted successfully!')
      }
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Create New Institution */}
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-500" />
            Create New Institution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-2">Type</label>
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
          </div>
          <div className="mt-4">
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
            Existing Institutions ({institutions.length})
          </h3>
          {institutions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No institutions created yet</p>
              <p className="text-sm">Create your first institution above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {institutions.map((inst, i) => (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {editingInstitution?.id === inst.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingInstitution.name}
                          onChange={(e) => setEditingInstitution({ ...editingInstitution, name: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        />
                        <select
                          value={editingInstitution.type}
                          onChange={(e) => setEditingInstitution({ ...editingInstitution, type: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        >
                          <option value="school">School</option>
                          <option value="college">College</option>
                          <option value="university">University</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdateInstitution} className="btn-primary text-sm">Save</button>
                        <button onClick={() => setEditingInstitution(null)} className="btn-outline text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            inst.type === 'school' ? 'bg-purple-100 dark:bg-purple-900/20' :
                            inst.type === 'college' ? 'bg-blue-100 dark:bg-blue-900/20' :
                            'bg-emerald-100 dark:bg-emerald-900/20'
                          }`}>
                            {inst.type === 'school' ? <School className="h-5 w-5 text-purple-600 dark:text-purple-400" /> :
                             inst.type === 'college' ? <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" /> :
                             <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{inst.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{inst.type}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {inst.address && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <MapPin className="h-4 w-4" />
                              {inst.address}
                            </div>
                          )}
                          {inst.email && (
                            <div className="text-slate-600 dark:text-slate-400">
                              📧 {inst.email}
                            </div>
                          )}
                          {inst.phone && (
                            <div className="text-slate-600 dark:text-slate-400">
                              📞 {inst.phone}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {inst.userCount} total users
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">
                            {inst.teachers} teachers
                          </span>
                          <span className="text-purple-600 dark:text-purple-400">
                            {inst.students} students
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(inst.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingInstitution(inst)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit institution"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInstitution(inst.id)}
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

          {/* Enhanced Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                    className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-white/20' 
                          : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm">{tab.label}</div>
                        <div className={`text-xs mt-1 opacity-70 ${
                          activeTab === tab.id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
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

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab key="overview" />}
            {activeTab === 'users' && <UsersTab key="users" />}
            {activeTab === 'institutions' && <InstitutionsTab key="institutions" />}
            {activeTab === 'content' && <ContentTab key="content" />}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">Advanced Analytics</p>
                <p className="text-slate-500 mt-2">Detailed platform metrics and insights coming soon</p>
              </motion.div>
            )}
            {activeTab === 'system' && (
              <motion.div key="system" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <Server className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">System Health</p>
                <p className="text-slate-500 mt-2">Detailed system monitoring and performance metrics</p>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                <Settings className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">Platform Settings</p>
                <p className="text-slate-500 mt-2">Configure platform-wide settings and preferences</p>
              </motion.div>
            )}
            {activeTab === 'playground' && <PlaygroundTab key="playground" />}
          </AnimatePresence>
>>>>>>> Stashed changes
        </div>
      </Card>

      <Card>
        <div className="font-semibold mb-2">Pending Quizzes</div>
        <div className="space-y-2">
          {pendingQuizzes.length === 0 && <div className="text-sm text-slate-500">No pending quizzes.</div>}
          {pendingQuizzes.map(q => (
            <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">{q.quiz.title}</div>
                <div className="text-xs text-slate-500">Topic: {q.quiz.topic} • {new Date(q.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline !px-3 !py-1" onClick={() => approveQuiz(q.id)}>Approve</button>
                <button className="btn-outline !px-3 !py-1" onClick={() => rejectQuiz(q.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
    </>
  )
}

