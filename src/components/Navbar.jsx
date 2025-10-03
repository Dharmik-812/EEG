import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, Menu, X, Sun, Moon, Zap, Droplets, Wind, TreePine, Sprout, Award, Users, BookOpen, MessageCircle, LayoutDashboard, Trophy, Shield, Search, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CircularNavWheel from './ui/CircularNavWheel'
import useTheme from '../store/useTheme.js'
import { useAuthStore } from '../store/authStore'
import { useAnimationStore } from '../store/animationStore'
import SearchInterface from './enhanced/SearchInterface'
import NotificationCenter from './enhanced/NotificationCenter'
import Button from './ui/Button'

// Professional navigation flow with icons
const links = [
  { to: '/', label: 'Home', category: 'primary', icon: Sprout },
  { to: '/chat', label: 'Chatbot', category: 'primary', icon: MessageCircle },
  { to: '/editor', label: 'Editor', category: 'primary', icon: BookOpen },
  { to: '/dashboard', label: 'Dashboard', category: 'primary', hideForAdmin: true, icon: LayoutDashboard },
  // Secondary (will appear in the wheel)
  { to: '/leaderboard', label: 'Leaderboard', category: 'more', icon: Trophy },
  { to: '/badges', label: 'Badges', category: 'more', icon: Award },
  { to: '/community', label: 'Community', category: 'more', icon: Users },
  { to: '/about', label: 'About', category: 'more', icon: BookOpen },
  { to: '/how-it-works', label: 'Guide', category: 'more', icon: BookOpen },
]

// Floating particles for environmental theme
const FloatingParticle = ({ delay }) => (
  <motion.div
    initial={{ y: 0, x: 0, opacity: 0 }}
    animate={{ 
      y: [-20, -40, -20],
      x: [0, 10, 0],
      opacity: [0, 0.3, 0]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
    className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
    style={{ 
      left: `${Math.random() * 100}%`,
      top: '100%'
    }}
  />
)

export default function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredLink, setHoveredLink] = useState(null)
  const [ecoScore, setEcoScore] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNavWheel, setShowNavWheel] = useState(false)
  const { theme, setTheme } = useTheme()
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const { reduced, toggle: toggleMotion } = useAnimationStore(s => ({ reduced: s.reduced, toggle: s.toggle }))
  const { currentUser, logout } = useAuthStore(s => ({ currentUser: s.currentUser, logout: s.logout }))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Simulate eco score (replace with actual user data)
  useEffect(() => {
    const timer = setInterval(() => {
      setEcoScore(prev => (prev + 1) % 101)
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const LinkItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `nav-link relative group px-4 py-2 rounded-xl transition-all duration-300 ${
          isActive 
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' 
            : 'hover:bg-emerald-50/30 dark:hover:bg-slate-800/50'
        }`
      }
    >
      <span className="relative flex items-center gap-2">
        <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
        {label}
        <span 
          className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 transition-[width] duration-300 group-hover:w-full"
        />
      </span>
    </NavLink>
  )

  const EcoIndicator = () => (
    <motion.div 
      className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
      whileHover={{ scale: 1.05 }}
      title="Your environmental impact score"
    >
      <TreePine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        {currentUser ? `${Math.floor(Math.random() * 500 + 500)} pts` : '0 pts'}
      </span>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Leaf className="h-3 w-3 text-emerald-500" />
      </motion.div>
    </motion.div>
  )

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-emerald-200/30 dark:border-slate-700/50 transition-all safe-area-top ${
        scrolled ? 'shadow-lg shadow-emerald-500/5' : ''
      }`}
    >
      {/* Animated gradient border */}
      <motion.div 
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: '200% 100%' }}
      />

      {/* Environmental particles */}
      {!reduced && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.8} />
          ))}
        </div>
      )}

      <nav className={`container-fluid mx-auto ${scrolled ? 'py-2' : 'py-3'} flex items-center justify-between transition-all duration-300`}>
        {/* Logo with enhanced animation */}
        <Link to="/" className="group flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative"
          >
            <Leaf className="h-7 w-7 text-emerald-500 drop-shadow-lg" aria-hidden />
            {!reduced && (
              <motion.div
                className="absolute inset-0 bg-emerald-400 rounded-full blur-md"
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
          <span className="font-display bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
            AverSoltix
          </span>
          <motion.div
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="hidden sm:block"
          >
            <Sprout className="h-4 w-4 text-green-500" />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Primary Section: show only the main pages */}
          <div className="flex items-center gap-1">
            {links.filter(l => l.category === 'primary' && !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
              <LinkItem key={l.to} {...l} />
            ))}
          </div>
          
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-emerald-300 to-transparent dark:via-slate-600 mx-2" />

          {/* More Section trigger + optional Admin */}
          <div className="flex items-center gap-1 relative">
            {currentUser?.role === 'admin' && (
              <NavLink to="/admin" className="nav-link relative group px-4 py-2 rounded-xl transition-all duration-300 hover:bg-emerald-50/30 dark:hover:bg-slate-800/50" data-ripple>
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </span>
              </NavLink>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNavWheel(v => !v)}
              className="ml-2 px-3 py-2 rounded-xl border border-emerald-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 hover:bg-emerald-50/60 dark:hover:bg-slate-800/60"
              aria-label="Open navigation wheel"
            >
              <span className="text-sm">See more</span>
            </motion.button>

            {/* In-navbar Wheel Popover */}
            <AnimatePresence>
              {showNavWheel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 8 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  className="absolute top-full right-0 mt-2 z-50"
                >
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-emerald-200/40 dark:border-slate-700/50 shadow-2xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Explore</span>
                    </div>
                    <CircularNavWheel
                      items={links
                        .filter(l => !(l.hideForAdmin && currentUser?.role === 'admin'))
                        .map(l => ({ ...l }))}
                      currentPath={window.location.pathname}
                      onItemSelect={(item) => {
                        setShowNavWheel(false)
                        // Slight delay to let the popover close smoothly
                        setTimeout(() => navigate(item.to), 80)
                      }}
                      radius={96}
                      itemSize={50}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-gradient-to-b from-transparent via-emerald-300 to-transparent dark:via-slate-600 mx-2" />

          {/* Eco Score Indicator */}
          {currentUser && <EcoIndicator />}

          {/* Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-2 ml-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  {currentUser.name}
                </span>
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout} 
                className="btn-outline !px-4 !py-2 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <NavLink to="/login" className="btn-outline !px-4 !py-2 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" data-ripple>
                Login
              </NavLink>
              <NavLink to="/register" className="btn !px-4 !py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600" data-ripple>
                Register
              </NavLink>
            </div>
          )}

          {/* Theme & Motion Controls */}
          <div className="flex items-center gap-1 ml-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle reduced motion"
              title={reduced ? 'Animations OFF' : 'Animations ON'}
              onClick={toggleMotion}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                reduced
                  ? 'bg-red-100/50 dark:bg-red-900/20 hover:bg-red-200/50 text-red-600 dark:text-red-400'
                  : 'bg-emerald-100/50 dark:bg-emerald-900/20 hover:bg-emerald-200/50 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Zap className="h-5 w-5" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme" 
              onClick={toggle} 
              className="p-2.5 rounded-xl bg-emerald-100/50 hover:bg-emerald-200/50 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="h-5 w-5 text-slate-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Medium screen navbar */}
        <div className="hidden md:flex lg:hidden items-center gap-2">
          <div className="flex items-center gap-1">
            {links.slice(0, 4).filter(l => !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
              <LinkItem key={l.to} {...l} />
            ))}
            {currentUser && (
              <>
                <NavLink to="/chat-friends" className="nav-link px-3 py-2 rounded-xl hover:bg-emerald-50/30 dark:hover:bg-slate-800/50" data-ripple>
                  <Users className="h-4 w-4" />
                </NavLink>
                <NavLink to="/groups" className="nav-link px-3 py-2 rounded-xl hover:bg-emerald-50/30 dark:hover:bg-slate-800/50" data-ripple>
                  <Users className="h-4 w-4" />
                </NavLink>
              </>
            )}
            <NavLink to="/chat" className="nav-link px-3 py-2 rounded-xl hover:bg-emerald-50/30 dark:hover:bg-slate-800/50" data-ripple>
              <MessageCircle className="h-4 w-4" />
            </NavLink>
          </div>
          
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-emerald-300 to-transparent dark:via-slate-600 mx-1" />
          
          <div className="flex items-center gap-2">
            {/* Search button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800 relative"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </motion.button>

            {/* Notifications button */}
            {currentUser && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </motion.button>
                
                <NotificationCenter
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                />
              </div>
            )}

            {currentUser ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                  <Leaf className="h-3 w-3 text-emerald-500" />
                  <span className="text-sm font-medium">{currentUser.name.split(' ')[0]}</span>
                </div>
                <button onClick={logout} className="btn-outline !px-3 !py-1.5 text-sm">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn-outline !px-3 !py-1.5 text-sm" data-ripple>Login</NavLink>
                <NavLink to="/register" className="btn !px-3 !py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-green-500" data-ripple>Join</NavLink>
              </>
            )}
            <motion.button 
              whileHover={{ rotate: 180 }}
              aria-label="Toggle theme" 
              onClick={toggle} 
              className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
            >
              <TreePine className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {Math.floor(Math.random() * 500 + 500)}
              </span>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle reduced motion"
            onClick={toggleMotion}
            className={`p-2 rounded-lg transition-all ${
              reduced
                ? 'bg-red-100/50 dark:bg-red-900/20 text-red-600'
                : 'bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600'
            }`}
          >
            <Zap className="h-5 w-5" />
          </motion.button>
          
          <motion.button 
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme" 
            onClick={toggle} 
            className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open menu" 
            onClick={() => setOpen(true)} 
            className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800"
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-emerald-200/30 dark:border-slate-700/50 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-emerald-200/30 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-emerald-500" />
                    <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Menu
                    </span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu" 
                    onClick={() => setOpen(false)} 
                    className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* User Info */}
                {currentUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-emerald-500/20">
                        <Leaf className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                          {currentUser.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <TreePine className="h-3 w-3 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            {Math.floor(Math.random() * 500 + 500)} Eco Points
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                <div className="space-y-1">
                  {links.filter(l => !(l.hideForAdmin && currentUser?.role === 'admin')).map((l, idx) => {
                    const Icon = l.icon
                    return (
                      <motion.div
                        key={l.to}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link 
                          to={l.to} 
                          onClick={() => setOpen(false)} 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-colors group" 
                          data-ripple
                        >
                          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{l.label}</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                  
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Link to="/editor" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-colors group" data-ripple>
                      <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Editor</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                    <Link to="/create-quiz" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-colors group" data-ripple>
                      <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Create Quiz</span>
                    </Link>
                  </motion.div>
                  
                  {currentUser?.role === 'admin' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition-colors group" data-ripple>
                        <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Admin</span>
                      </Link>
                    </motion.div>
                  )}
                </div>

                {/* Auth Actions */}
                <div className="pt-4 border-t border-emerald-200/30 dark:border-slate-700/50 space-y-2">
                  {!currentUser ? (
                    <>
                      <Link 
                        to="/login" 
                        onClick={() => setOpen(false)} 
                        className="block w-full px-4 py-3 text-center rounded-xl border-2 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium transition-colors" 
                        data-ripple
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setOpen(false)} 
                        className="block w-full px-4 py-3 text-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium transition-all shadow-lg shadow-emerald-500/25" 
                        data-ripple
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setOpen(false); logout() }} 
                      className="block w-full px-4 py-3 text-center rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium transition-colors"
                    >
                      Logout
                    </motion.button>
                  )}
                </div>

                {/* Environmental tip */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Eco Tip of the Day
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Reduce water waste by turning off the tap while brushing your teeth - save up to 8 gallons per day!
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Removed full-screen wheel overlay in favor of in-navbar popover */}

      {/* Search Interface */}
      <SearchInterface
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </motion.header>
  )
}
