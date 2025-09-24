import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import { 
  Users, Gamepad2, BookOpen, Building, Award, Zap, Target, 
  TrendingUp, GraduationCap, School, Leaf, Globe, TreePine,
  Shield, UserCheck, UserCog, Eye
} from 'lucide-react'

const ROLE_COLORS = {
  visitor: 'from-slate-500 to-gray-600',
  'school-student': 'from-blue-500 to-indigo-600',
  'school-teacher': 'from-emerald-500 to-green-600',
  'college-student': 'from-purple-500 to-violet-600',
  'college-teacher': 'from-orange-500 to-red-600',
  admin: 'from-red-500 to-pink-600'
}

const ROLE_ICONS = {
  admin: Shield,
  'school-teacher': UserCheck,
  'college-teacher': UserCog,
  'school-student': GraduationCap,
  'college-student': School,
  visitor: Eye
}

export default function About() {
  const { getAnalytics } = useAuthStore()
  const { approvedGames, approvedQuizzes } = useSubmissionsStore()
  const analytics = getAnalytics()
  const topics = Array.from(new Set((approvedQuizzes || []).map(q => q.quiz?.topic).filter(Boolean))).sort()
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const statsData = useMemo(() => [
    { 
      key: 'users', 
      label: '👥 Users', 
      value: analytics.totalUsers,
      icon: Users,
      color: 'blue'
    },
    { 
      key: 'games', 
      label: '🎮 Games', 
      value: (approvedGames || []).length,
      icon: Gamepad2,
      color: 'purple'
    },
    { 
      key: 'quizzes', 
      label: '🧩 Quizzes', 
      value: (approvedQuizzes || []).length,
      icon: BookOpen,
      color: 'emerald'
    },
    { 
      key: 'institutions', 
      label: '🏫 Institutions', 
      value: analytics.totalInstitutions,
      icon: Building,
      color: 'orange'
    }
  ], [analytics, approvedGames, approvedQuizzes])

  const communityData = useMemo(() => [
    { key: 'admin', label: 'Admins', value: analytics.roleDistribution?.admin || 0, icon: Shield },
    { key: 'school-teacher', label: 'Teachers (School)', value: analytics.roleDistribution?.['school-teacher'] || 0, icon: UserCheck },
    { key: 'college-teacher', label: 'Teachers (College)', value: analytics.roleDistribution?.['college-teacher'] || 0, icon: UserCog },
    { key: 'school-student', label: 'Students (School)', value: analytics.roleDistribution?.['school-student'] || 0, icon: GraduationCap },
    { key: 'college-student', label: 'Students (College)', value: analytics.roleDistribution?.['college-student'] || 0, icon: School },
    { key: 'visitor', label: 'Visitors', value: analytics.roleDistribution?.visitor || 0, icon: Eye }
  ], [analytics.roleDistribution])

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading about information..." variant="recycle" />
  }

  const StatCard = ({ stat, delay = 0 }) => {
    const Icon = stat.icon
    const colorClasses = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20',
        icon: 'bg-blue-500 text-white',
        text: 'text-blue-600 dark:text-blue-400'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/20',
        icon: 'bg-purple-500 text-white',
        text: 'text-purple-600 dark:text-purple-400'
      },
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/20',
        icon: 'bg-emerald-500 text-white',
        text: 'text-emerald-600 dark:text-emerald-400'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/20',
        icon: 'bg-orange-500 text-white',
        text: 'text-orange-600 dark:text-orange-400'
      }
    }
    
    const colors = colorClasses[stat.color] || colorClasses.blue
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.02, y: -4 }}
        className={`p-6 ${colors.bg} rounded-2xl border-2 border-white dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-3xl font-extrabold ${colors.text}`}>
              {stat.value?.toLocaleString?.() ?? String(stat.value)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {stat.label}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${colors.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </motion.div>
    )
  }

  const FeatureCard = ({ title, description, items, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="eco-card hover-lift p-6 h-full"
    >
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-emerald-500" />
        {title}
      </h2>
      <p className="text-slate-600 dark:text-slate-300 mb-4">{description}</p>
      {items && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + (index * 0.1) }}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              {item}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  )

  return (
    <>
      <SEO title="About" description="AverSoltix blends play and science to spark climate literacy and real-world action." />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 -mx-6 -mt-6 px-6 pt-6 pb-12 mb-10 border-b border-slate-200 dark:border-slate-700">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white leading-tight mb-4">
            We turn learning into{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              climate action
            </span>
            <span className="inline-block ml-2 text-3xl">🌱</span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
          >
            Games, quests, and community challenges that make environmental science engaging, social, and measurable.
          </motion.p>
        </motion.div>
      </div>

      {/* Live Stats */}
      <section className="mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3 justify-center">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            Platform Statistics
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard key={stat.key} stat={stat} delay={0.5 + index * 0.1} />
          ))}
        </div>
      </section>

      {/* Mission & Features */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <FeatureCard
          title="Our Mission"
          description="AverSoltix empowers learners to understand climate systems, biodiversity, circular economy, and clean energy—then rewards real-world actions with XP, streaks, and badges."
          items={[
            "Align with school and college curricula",
            "Turn complex science into playful quests",
            "Celebrate progress with badges and leaderboards"
          ]}
          delay={0.6}
        />
        
        <FeatureCard
          title="How It Works"
          description="A simple four-step process that transforms learning into meaningful action and achievement."
          items={[
            "Learn: Short, beautiful explainers introduce key concepts",
            "Play: Interactive games and quizzes reinforce understanding",
            "Act: Challenges encourage real-life sustainable actions",
            "Shine: Earn badges, keep streaks, and climb leaderboards"
          ]}
          delay={0.7}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ y: -4 }}
          className="eco-card hover-lift p-6"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Quiz Topics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(topics.length ? topics : ['Topics will appear as quizzes are added']).map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + (index * 0.05) }}
                className="px-3 py-2 bg-gradient-to-br from-emerald-500/10 to-sky-500/10 rounded-lg border border-white/20 dark:border-slate-800 text-sm text-center"
              >
                {topic}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Community Snapshot */}
      <section className="mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3 justify-center">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            Community Snapshot
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityData.map((role, index) => {
            const Icon = role.icon
            const colorClass = ROLE_COLORS[role.key] || 'from-slate-500 to-gray-600'
            
            return (
              <motion.div
                key={role.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + (index * 0.1) }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-6 rounded-2xl border-2 border-white dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                      {role.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {role.label}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClass} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mb-8"
      >
        <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="text-2xl font-extrabold mb-2">Join the movement</div>
              <div className="opacity-90">Bring AverSoltix to your classroom or campus.</div>
            </div>
            <motion.a
              href="/community"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Involved
            </motion.a>
          </div>
        </div>
      </motion.section>
    </>
  )
}