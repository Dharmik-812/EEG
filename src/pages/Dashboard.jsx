import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore.js'
import { useAuthStore } from '../store/authStore.js'
import Card from '../components/Card.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import StreakFlame from '../components/StreakFlame.jsx'
import BadgeComp from '../components/Badge.jsx'
import badgesData from '../data/badges.json'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { 
  TrendingUp, Award, Zap, Target, Users, BookOpen, Gamepad2, 
  Calendar, Clock, Star, GraduationCap, School, Building, 
  BarChart3, PieChart as PieChartIcon, Activity, Plus, 
  ChevronRight, Globe, Leaf, TreePine
} from 'lucide-react'

const ROLE_COLORS = {
  visitor: 'from-slate-500 to-gray-600',
  'school-student': 'from-blue-500 to-indigo-600',
  'school-teacher': 'from-emerald-500 to-green-600',
  'college-student': 'from-purple-500 to-violet-600',
  'college-teacher': 'from-orange-500 to-red-600',
  admin: 'from-red-500 to-pink-600'
}

export default function Dashboard() {
  const { xp, level, streak, badges, xpLog, touchDailyStreak } = useGameStore()
  const { currentUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [prevLevel, setPrevLevel] = useState(level)
  
  useEffect(() => { 
    touchDailyStreak() 
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [touchDailyStreak])
  
  // Check for level up
  useEffect(() => {
    if (level > prevLevel) {
      setShowLevelUp(true)
      setTimeout(() => setShowLevelUp(false), 3000)
    }
    setPrevLevel(level)
  }, [level, prevLevel])

  const nextLvlXP = level * 500
  const currentLevelBase = (level - 1) * 500
  const xpInLevel = xp - currentLevelBase

  const last7days = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayKey = d.toISOString().slice(0,10)
      const total = xpLog.filter(e => e.date.slice(0,10) === dayKey).reduce((sum, e) => sum + e.delta, 0)
      days.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), xp: total })
    }
    return days
  }, [xpLog])

  // Role-specific data
  const roleSpecificData = useMemo(() => {
    const role = currentUser?.role || 'visitor'
    
    const baseData = {
      quickActions: [
        { id: 'take-quiz', label: 'Take Quiz', icon: BookOpen, color: 'blue' },
        { id: 'play-game', label: 'Play Games', icon: Gamepad2, color: 'purple' },
        { id: 'view-leaderboard', label: 'Leaderboard', icon: Award, color: 'amber' },
      ],
      recentActivities: [
        { type: 'quiz', title: 'Climate Change Quiz', score: 85, date: '2 hours ago' },
        { type: 'badge', title: 'Earned "Eco Warrior" badge', date: '1 day ago' },
        { type: 'game', title: 'Completed "Forest Adventure"', score: 92, date: '2 days ago' },
      ]
    }

    if (role.includes('teacher')) {
      return {
        ...baseData,
        quickActions: [
          { id: 'create-quiz', label: 'Create Quiz', icon: Plus, color: 'emerald' },
          { id: 'manage-students', label: 'Manage Students', icon: Users, color: 'blue' },
          { id: 'view-analytics', label: 'Class Analytics', icon: BarChart3, color: 'purple' },
          { id: 'create-game', label: 'Create Game', icon: Gamepad2, color: 'orange' },
        ],
        teacherStats: {
          studentsCount: 24,
          quizzesCreated: 8,
          avgClassScore: 78,
          activeAssignments: 3
        }
      }
    }

    if (role === 'admin') {
      return {
        ...baseData,
        quickActions: [
          { id: 'admin-panel', label: 'Admin Panel', icon: Settings, color: 'red' },
          { id: 'user-management', label: 'Manage Users', icon: Users, color: 'blue' },
          { id: 'content-moderation', label: 'Content Review', icon: BookOpen, color: 'purple' },
          { id: 'system-health', label: 'System Health', icon: Activity, color: 'green' },
        ]
      }
    }

    return baseData
  }, [currentUser?.role])

  const institutionData = useMemo(() => {
    if (!currentUser?.institution) return null
    
    return {
      name: currentUser.institution.name,
      type: currentUser.institution.type,
      stats: {
        totalStudents: 156,
        activeClasses: 12,
        completedQuizzes: 342,
        avgEngagement: 87
      }
    }
  }, [currentUser?.institution])

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading your eco-progress..." variant="recycle" />
  }

  const QuickActionCard = ({ action, delay = 0 }) => {
    const Icon = action.icon
    const colorClasses = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20',
        icon: 'bg-blue-500 text-white',
        hover: 'hover:shadow-blue-500/20 hover:border-blue-300 dark:hover:border-blue-600'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/20',
        icon: 'bg-purple-500 text-white',
        hover: 'hover:shadow-purple-500/20 hover:border-purple-300 dark:hover:border-purple-600'
      },
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/20',
        icon: 'bg-emerald-500 text-white',
        hover: 'hover:shadow-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-600'
      },
      amber: {
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-800/20',
        icon: 'bg-amber-500 text-white',
        hover: 'hover:shadow-amber-500/20 hover:border-amber-300 dark:hover:border-amber-600'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/20',
        icon: 'bg-orange-500 text-white',
        hover: 'hover:shadow-orange-500/20 hover:border-orange-300 dark:hover:border-orange-600'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/20',
        icon: 'bg-red-500 text-white',
        hover: 'hover:shadow-red-500/20 hover:border-red-300 dark:hover:border-red-600'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/20',
        icon: 'bg-green-500 text-white',
        hover: 'hover:shadow-green-500/20 hover:border-green-300 dark:hover:border-green-600'
      }
    }
    
    const colors = colorClasses[action.color] || colorClasses.blue
    
    return (
      <motion.button
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative p-6 ${colors.bg} rounded-2xl border-2 border-white dark:border-slate-700 ${colors.hover} transition-all duration-300 text-left shadow-lg hover:shadow-xl overflow-hidden`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-5 transform rotate-12 translate-x-6 -translate-y-6">
          <Icon className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <div className={`inline-flex p-3 rounded-xl ${colors.icon} mb-4 group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-6 w-6" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
            {action.label}
          </h3>
          
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
            <span className="font-medium">Get started</span>
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <>
      <SEO title="Dashboard" description="Track your XP, level progress, daily streak, and badges on your AverSoltix dashboard." />
      
      {/* Level up notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ scale: 0, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="eco-card achievement-glow text-center px-8 py-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="inline-block mb-2"
              >
                <Award className="h-12 w-12 text-amber-500" />
              </motion.div>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                Level Up! 🎉
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You reached Level {level}!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Header */}
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
                  {currentUser?.name || 'Eco Learner'}
                </span>!
                <span className="inline-block ml-2 text-3xl">🌱</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                {currentUser?.role && (
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${ROLE_COLORS[currentUser.role]} text-white shadow-lg`}>
                    {currentUser.role.replace('-', ' ')}
                  </span>
                )}
                
                {currentUser?.institution && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
                    <Building className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {currentUser.institution.name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
                  <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                {currentUser?.name?.charAt(0) || 'E'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
    <section className="space-y-8">
      {/* Quick Actions Section */}
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
            Quick Actions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Get started with these essential tools and features
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {roleSpecificData.quickActions.map((action, i) => (
            <QuickActionCard 
              key={action.id} 
              action={action} 
              delay={0.4 + i * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
        >
          <Card className="eco-card hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-sm text-slate-500">Eco Level</div>
            </div>
            <div className={`text-4xl font-extrabold xp-counter ${showLevelUp ? 'level-up' : ''}`}>
              {level}
            </div>
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs">
                <span>Progress to Level {level + 1}</span>
                <span>{xpInLevel}/500 XP</span>
              </div>
              <div className="eco-progress h-3 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpInLevel / 500) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -4 }}
        >
          <Card className="eco-card hover-lift nature-particles">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/20">
                <Zap className="h-6 w-6 text-sky-600" />
              </div>
              <div className="text-sm text-slate-500">Total XP</div>
            </div>
            <div className="text-4xl font-extrabold xp-counter text-gradient">
              {xp.toLocaleString()}
            </div>
            <div className="mt-4 text-sm text-slate-500">
              🌱 Keep growing! Every action helps save the planet.
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -4 }}
        >
          <Card className="eco-card hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm text-slate-500">Daily Streak</div>
            </div>
            <div className="mt-2 streak-flame">
              <StreakFlame streak={streak} />
            </div>
            <div className="mt-3 text-xs text-slate-500">
              🔥 {streak > 0 ? `${streak} days strong!` : 'Start your streak today!'}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Role-specific Teacher Stats */}
      {roleSpecificData.teacherStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              Teaching Dashboard
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {roleSpecificData.teacherStats.studentsCount}
                </div>
                <div className="text-sm text-slate-500">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {roleSpecificData.teacherStats.quizzesCreated}
                </div>
                <div className="text-sm text-slate-500">Quizzes Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {roleSpecificData.teacherStats.avgClassScore}%
                </div>
                <div className="text-sm text-slate-500">Avg Class Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {roleSpecificData.teacherStats.activeAssignments}
                </div>
                <div className="text-sm text-slate-500">Active Assignments</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Institution Info */}
      {institutionData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-500" />
                {institutionData.name}
              </h3>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium capitalize">
                {institutionData.type}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-xl font-bold text-slate-800 dark:text-white">
                  {institutionData.stats.totalStudents}
                </div>
                <div className="text-sm text-slate-500">Total Students</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-xl font-bold text-slate-800 dark:text-white">
                  {institutionData.stats.activeClasses}
                </div>
                <div className="text-sm text-slate-500">Active Classes</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-xl font-bold text-slate-800 dark:text-white">
                  {institutionData.stats.completedQuizzes}
                </div>
                <div className="text-sm text-slate-500">Completed Quizzes</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-xl font-bold text-slate-800 dark:text-white">
                  {institutionData.stats.avgEngagement}%
                </div>
                <div className="text-sm text-slate-500">Avg Engagement</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">XP Earned (last 7 days)</div>
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={last7days}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="xp" stroke="#22c55e" fillOpacity={1} fill="url(#xpGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="font-semibold mb-4">Badges</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {badgesData.map(b => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <BadgeComp name={b.name} description={b.description} acquired={badges.includes(b.id)} />
            </motion.div>
          ))}
        </div>
      </Card>
    </section>
    </>
  )
}

