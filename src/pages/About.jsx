import { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useAuthStore } from '../store/authStore'
import { useSubmissionsStore } from '../store/submissionsStore'
import {
  Users, Gamepad2, BookOpen, Building, TrendingUp, GraduationCap, School,
  Shield, UserCheck, UserCog, Eye, Zap, Target, Leaf, Globe, TreePine,
  Award, Eye as EyeIcon
} from 'lucide-react'
import { useScrollReveal, useGSAP } from '../animations'

// --- Role color map (used for gradients in community cards) ---
const ROLE_COLORS = {
  visitor: 'from-slate-500 to-gray-600',
  'school-student': 'from-blue-500 to-indigo-600',
  'school-teacher': 'from-emerald-500 to-green-600',
  'college-student': 'from-purple-500 to-violet-600',
  'college-teacher': 'from-orange-500 to-red-600',
  admin: 'from-red-500 to-pink-600'
}

// --- Role icons fallback map (if needed individually) ---
const ROLE_ICONS = {
  admin: Shield,
  'school-teacher': UserCheck,
  'college-teacher': UserCog,
  'school-student': GraduationCap,
  'college-student': School,
  visitor: EyeIcon
}

// --- Motion variants used repetitively for consistency ---
const heroVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.6 } }
}

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.4 } }
})

const popIn = (delay = 0, bounce = 0.4) => ({
  hidden: { opacity: 0, scale: 0.92 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { delay, duration: 0.7, type: 'spring', stiffness: 420, damping: 28, bounce }
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.4 } }
})

const floatY = (amount = 8, duration = 2.4, delay = 0) => ({
  animate: { y: [0, -amount, 0], transition: { repeat: Infinity, duration, delay, ease: 'easeInOut' } }
})

// --- Utility: safeToLocale so null values don't crash UI ---
const safeToLocale = (val) => {
  if (val === null || val === undefined) return '0'
  if (typeof val === 'number') return val.toLocaleString()
  return String(val)
}

export default function About() {
  // Refs for parallax and section anchors
  const parallaxRef = useRef(null)
  const heroBlobRef = useRef(null)
  const featuresRef = useRef(null)

  // Stores & analytics
  const { getAnalytics } = useAuthStore()
  const { approvedGames, approvedQuizzes } = useSubmissionsStore()
  const analytics = getAnalytics() || {}

  // Derived helpers
  const topics = useMemo(() => {
    try {
      return Array.from(new Set((approvedQuizzes || []).map(q => q.quiz?.topic).filter(Boolean))).sort()
    } catch (e) {
      return []
    }
  }, [approvedQuizzes])

  // Loading micro-state for spinner + entry
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // keep spinner for polish, then unveil content
    const t = setTimeout(() => setIsLoading(false), 850)
    return () => clearTimeout(t)
  }, [])

  // Scroll reveal & GSAP parallax
  useScrollReveal(['.about-section', '.about-feature', '.stat-card', '.community-card'], { y: 80, stagger: 0.08, duration: 0.9 })
  useGSAP((gsap, ScrollTrigger) => {
    if (parallaxRef.current) {
      gsap.to(parallaxRef.current, {
        y: -220,
        rotate: 2,
        opacity: 0.28,
        ease: 'none',
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    }

    // tiny float for hero blob
    if (heroBlobRef.current) {
      gsap.to(heroBlobRef.current, {
        y: -30,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: 6
      })
    }
  }, [])

  // Stats & community structures (intentionally explicit & verbose)
  const statsData = useMemo(() => [
    { key: 'users', label: '👥 Users', value: analytics.totalUsers || 0, icon: Users, color: 'blue' },
    { key: 'games', label: '🎮 Games', value: (approvedGames || []).length || 0, icon: Gamepad2, color: 'purple' },
    { key: 'quizzes', label: '🧩 Quizzes', value: (approvedQuizzes || []).length || 0, icon: BookOpen, color: 'emerald' },
    { key: 'institutions', label: '🏫 Institutions', value: analytics.totalInstitutions || 0, icon: Building, color: 'orange' }
  ], [analytics, approvedGames, approvedQuizzes])

  const communityData = useMemo(() => [
    { key: 'admin', label: 'Admins', value: analytics.roleDistribution?.admin || 0, icon: Shield },
    { key: 'school-teacher', label: 'Teachers (School)', value: analytics.roleDistribution?.['school-teacher'] || 0, icon: UserCheck },
    { key: 'college-teacher', label: 'Teachers (College)', value: analytics.roleDistribution?.['college-teacher'] || 0, icon: UserCog },
    { key: 'school-student', label: 'Students (School)', value: analytics.roleDistribution?.['school-student'] || 0, icon: GraduationCap },
    { key: 'college-student', label: 'Students (College)', value: analytics.roleDistribution?.['college-student'] || 0, icon: School },
    { key: 'visitor', label: 'Visitors', value: analytics.roleDistribution?.visitor || 0, icon: EyeIcon }
  ], [analytics.roleDistribution])

  // micro-component: StatCard (very verbose, each part animated)
  const StatCard = ({ stat, idx = 0 }) => {
    const Icon = stat.icon
    // color sets intentionally verbose
    const colorMap = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20',
        iconBg: 'bg-blue-500 text-white',
        text: 'text-blue-600 dark:text-blue-400'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/20',
        iconBg: 'bg-purple-500 text-white',
        text: 'text-purple-600 dark:text-purple-400'
      },
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/20',
        iconBg: 'bg-emerald-500 text-white',
        text: 'text-emerald-600 dark:text-emerald-400'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/20',
        iconBg: 'bg-orange-500 text-white',
        text: 'text-orange-600 dark:text-orange-400'
      }
    }
    const colors = colorMap[stat.color] || colorMap.blue

    return (
      <motion.div
        className={`stat-card ${colors.bg} p-6 rounded-2xl border-2 border-white dark:border-slate-700 shadow-2xl hover:shadow-2xl transition-all duration-300`}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={{
          hidden: { opacity: 0, y: 18, scale: 0.98 },
          enter: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.45 + idx * 0.08, duration: 0.6, type: 'spring', stiffness: 360 } },
          exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
        }}
        whileHover={{ scale: 1.02, y: -6 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.55 + idx * 0.08, duration: 0.45 } }}
              className={`text-3xl font-extrabold ${colors.text}`}
            >
              {safeToLocale(stat.value)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 + idx * 0.08 } }}
              className="text-sm text-slate-600 dark:text-slate-400 mt-1"
            >
              {stat.label}
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.6 + idx * 0.08, duration: 0.45 } }}
            className={`p-3 rounded-xl ${colors.iconBg}`}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // micro-component: FeatureTile with many animated children
  const FeatureTile = ({ i, headline, copy, bullets = [] }) => (
    <motion.div
      className="about-feature p-6 rounded-2xl border border-white/10 bg-white/5 shadow-xl h-full"
      initial="hidden"
      whileInView="enter"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        enter: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.35 + i * 0.08, duration: 0.6 } }
      }}
      whileHover={{ y: -8 }}
    >
      <motion.h3
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.45 + i * 0.08, duration: 0.5 } }}
        className="text-xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"
      >
        <Zap className="h-5 w-5 text-emerald-500" />
        {headline}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.55 + i * 0.08, duration: 0.6 } }}
        className="text-slate-600 dark:text-slate-300 mb-4"
      >
        {copy}
      </motion.p>

      <ul className="space-y-2">
        {bullets.map((b, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.65 + i * 0.08 + idx * 0.06 } }}
            className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400"
          >
            <div className="mt-1 w-2 h-2 bg-emerald-500 rounded-full" />
            <div>{b}</div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )

  // Very verbose hero area with multiple micro-animations + parallax blob
  const Hero = () => (
    <section className="relative py-20 overflow-hidden">
      <div ref={parallaxRef} className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div
          ref={heroBlobRef}
          className="absolute top-12 left-12 w-36 h-36 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-3xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.2 }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-28 h-28 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.32, duration: 1.0 }}
        />
        <motion.div
          className="absolute bottom-10 left-1/4 w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full blur-lg"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.0 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={heroVariants}
          initial="hidden"
          animate="enter"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.9 }}
          >
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">AverSoltix</span>
          </motion.h1>

          <motion.p
            className="text-2xl text-slate-600 dark:text-slate-300 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.8 }}
          >
            Empowering the next generation of environmental champions through gamified learning and interactive experiences.
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.52, duration: 0.6 }}
          >
            <motion.a
              href="/get-started"
              className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.a>

            <motion.a
              href="/learn-more"
              className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 rounded-xl text-slate-800 dark:text-white bg-white/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )

  // Mission & Values heavy section with many micro interactions
  const MissionValues = () => (
    <section className="about-section py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden">
              <motion.div
                className="absolute -top-6 -left-6 w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl"
                initial={{ rotate: 0, scale: 0.95 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              >
                🌱
              </motion.div>

              <motion.h2
                className="text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                Our Mission
              </motion.h2>

              <motion.p
                className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                AverSoltix transforms environmental education through the power of play. We create immersive,
                gamified experiences that make complex climate science accessible and engaging for learners of all ages.
              </motion.p>

              <motion.div className="mt-8 grid grid-cols-3 gap-4" initial="hidden" whileInView="enter" viewport={{ once: true }}>
                <motion.div className="text-center p-4 bg-white/6 rounded-xl" variants={popIn(0.25, 0.3)}>
                  <motion.div className="text-2xl mb-2" initial={{ y: 8 }} animate={{ y: 0, transition: { delay: 0.3 } }}>🎮</motion.div>
                  <div className="text-sm font-medium">Gamified</div>
                </motion.div>

                <motion.div className="text-center p-4 bg-white/6 rounded-xl" variants={popIn(0.35, 0.35)}>
                  <motion.div className="text-2xl mb-2" initial={{ y: 8 }} animate={{ y: 0, transition: { delay: 0.34 } }}>🌍</motion.div>
                  <div className="text-sm font-medium">Global Impact</div>
                </motion.div>

                <motion.div className="text-center p-4 bg-white/6 rounded-xl" variants={popIn(0.45, 0.35)}>
                  <motion.div className="text-2xl mb-2" initial={{ y: 8 }} animate={{ y: 0, transition: { delay: 0.38 } }}>📚</motion.div>
                  <div className="text-sm font-medium">Educational</div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div className="space-y-8" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <motion.div initial="hidden" whileInView="enter" viewport={{ once: true }} variants={fadeUp(0.12)}>
              <h3 className="text-2xl font-bold mb-4 text-emerald-600">🎯 Vision</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                A world where every learner becomes a steward of the planet—understanding climate change, protecting biodiversity, and accelerating the transition to renewable energy.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="enter" viewport={{ once: true }} variants={fadeUp(0.22)}>
              <h3 className="text-2xl font-bold mb-4 text-sky-600">💡 Innovation</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                We leverage cutting-edge technology, interactive simulations, and social gaming mechanics to create learning experiences that inspire lasting behavioral change.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="enter" viewport={{ once: true }} variants={fadeUp(0.32)}>
              <h3 className="text-2xl font-bold mb-4 text-teal-600">🌟 Impact</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Through our platform, students don't just learn about environmental issues—they develop the knowledge, skills, and motivation to become part of the solution.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )

  // Expanded values section with float particles & micro details
  const Values = () => (
    <section className="about-section py-20 bg-gradient-to-br from-emerald-50/50 to-sky-50/50 dark:from-emerald-950/20 dark:to-sky-950/20">
      <div className="container mx-auto px-4">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Values</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🚀',
              title: 'Innovation',
              desc: 'Pushing boundaries to create revolutionary learning experiences that captivate and educate.',
              gradient: 'from-purple-500 to-pink-600'
            },
            {
              icon: '🤝',
              title: 'Collaboration',
              desc: 'Building bridges between educators, students, and communities to amplify our collective impact.',
              gradient: 'from-blue-500 to-cyan-600'
            },
            {
              icon: '🌱',
              title: 'Sustainability',
              desc: 'Every decision we make considers its impact on our planet and future generations.',
              gradient: 'from-green-500 to-emerald-600'
            }
          ].map((val, i) => (
            <motion.div
              className="group relative p-8 bg-white/8 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl h-full overflow-hidden"
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.12 + i * 0.12 }}
              whileHover={{ y: -10 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${val.gradient} opacity-0 group-hover:opacity-8 transition-opacity duration-500`} />
              <motion.div className="text-5xl mb-6 relative z-10" whileHover={{ scale: 1.12, rotate: 6 }} transition={{ type: 'spring', stiffness: 360 }}>
                {val.icon}
              </motion.div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">{val.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{val.desc}</p>
              </div>

              {/* floating particle */}
              <motion.div
                className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ y: [-6, 6, -6], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )

  // Stats area expanded with grid of stat cards
  const Stats = () => (
    <section className="mb-12">
      <motion.div className="mb-8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3 justify-center">
          <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          Platform Statistics
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((s, idx) => <StatCard key={s.key} stat={s} idx={idx} />)}
      </div>
    </section>
  )

  // Full length Features + How it Works
  const Features = () => (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12" ref={featuresRef}>
      <FeatureTile
        i={0}
        headline="Our Mission"
        copy="AverSoltix empowers learners to understand climate systems, biodiversity, circular economy, and clean energy—then rewards real-world actions with XP, streaks, and badges."
        bullets={[
          'Align with school and college curricula',
          'Turn complex science into playful quests',
          'Celebrate progress with badges and leaderboards'
        ]}
      />

      <FeatureTile
        i={1}
        headline="How It Works"
        copy="A simple four-step process that transforms learning into meaningful action and achievement."
        bullets={[
          'Learn: Short, beautiful explainers introduce key concepts',
          'Play: Interactive games and quizzes reinforce understanding',
          'Act: Challenges encourage real-life sustainable actions',
          'Shine: Earn badges, keep streaks, and climb leaderboards'
        ]}
      />

      <motion.div
        className="eco-card hover-lift p-6 rounded-2xl border border-white/10 bg-white/6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          Quiz Topics
        </h2>
        <motion.div className="grid grid-cols-2 gap-3">
          {(topics.length ? topics : ['Topics will appear as quizzes are added']).map((topic, index) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.06, duration: 0.5 }}
              className="px-3 py-2 bg-gradient-to-br from-emerald-500/8 to-sky-500/8 rounded-lg border border-white/20 text-sm text-center"
            >
              {topic}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )

  // Community snapshot: large animated cards with gradients matching role
  const CommunitySnapshot = () => (
    <section className="mb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3 justify-center">
          <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
          Community Snapshot
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communityData.map((role, idx) => {
          const Icon = role.icon
          const colorClass = ROLE_COLORS[role.key] || 'from-slate-500 to-gray-600'
          return (
            <motion.div
              key={role.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05 + idx * 0.08, duration: 0.6 }}
            >
              <div className="p-6 rounded-2xl border-2 border-white/10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.12 + idx * 0.09 }}
                      className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent"
                    >
                      {safeToLocale(role.value)}
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.18 + idx * 0.09 }} className="text-sm text-slate-600 mt-1">
                      {role.label}
                    </motion.div>
                  </div>

                  <motion.div
                    className={`p-3 rounded-xl bg-gradient-to-r ${colorClass} text-white`}
                    initial={{ scale: 0.9, rotate: -6 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.2 + idx * 0.09, type: 'spring', stiffness: 320 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )

  // Big CTA at bottom with motion
  const CTA = () => (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
      <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.45 }} className="text-2xl font-extrabold mb-2">Join the movement</motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="opacity-90">Bring AverSoltix to your classroom or campus.</motion.div>
          </div>

          <motion.a
            href="/community"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold shadow-lg hover:shadow-xl"
          >
            Get Involved
          </motion.a>
        </div>
      </div>
    </motion.section>
  )

  // If loading, show an animated loading screen with presence
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-6"
          >
            <LoadingSpinner size="lg" message="Loading about information..." variant="recycle" />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="text-slate-600">Preparing the magic ✨</div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Full long return with all sections in order - verbose & micro-animated
  return (
    <>
      <SEO title="About" description="AverSoltix blends play and science to spark climate literacy and real-world action." />

      {/* Hero */}
      <Hero />

      {/* Mission + Values */}
      <MissionValues />
      <Values />

      {/* Stats */}
      <Stats />

      {/* Features */}
      <Features />

      {/* Community */}
      <CommunitySnapshot />

      {/* CTA */}
      <CTA />
    </>
  )
}
