import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Leaf, Menu, X, Sun, Moon, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useTheme from '../store/useTheme.js'
import { useAuthStore } from '../store/authStore'
import { useAnimationStore } from '../store/animationStore'

// Professional navigation flow: Overview → Learn → Engage → Track
const links = [
  { to: '/', label: 'Home', category: 'overview' },
  { to: '/about', label: 'About', category: 'overview' },
  { to: '/how-it-works', label: 'Guide', category: 'learn' },
  { to: '/challenges', label: 'Challenges', category: 'engage' },
  { to: '/community', label: 'Community', category: 'engage' },
  { to: '/dashboard', label: 'Dashboard', category: 'track', hideForAdmin: true },
  { to: '/leaderboard', label: 'Leaderboard', category: 'track' },
  { to: '/badges', label: 'Badges', category: 'track' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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

  const LinkItem = ({ to, label }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `nav-link relative ${isActive ? 'text-emerald-500 dark:text-emerald-400' : ''}`
      }
    >
      <span className="relative">
        {label}
        <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300 group-hover:w-full peer-[.active]:w-full" />
      </span>
    </NavLink>
  )

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 inset-x-0 z-50 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-800 transition-all safe-area-top ${scrolled ? 'shadow-sm' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400 opacity-60" />
      <nav className={`container-fluid mx-auto ${scrolled ? 'py-2' : 'py-4'} flex items-center justify-between transition-all duration-300`}>
        <Link to="/" className="group flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <Leaf className="h-6 w-6 text-emerald-500 drop-shadow group-hover:scale-110 transition-transform" aria-hidden />
          <span className="font-display text-gold">AverSoltix</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Overview Section */}
          {links.filter(l => l.category === 'overview' && !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
            <LinkItem key={l.to} {...l} />
          ))}
          <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-2 opacity-50" />
          
          {/* Learn Section */}
          {links.filter(l => l.category === 'learn' && !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
            <LinkItem key={l.to} {...l} />
          ))}
          <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-2 opacity-50" />
          
          {/* Engage Section */}
          {links.filter(l => l.category === 'engage' && !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
            <LinkItem key={l.to} {...l} />
          ))}
          <NavLink to="/editor" className="nav-link" data-ripple>Editor</NavLink>
          <NavLink to="/create-quiz" className="nav-link" data-ripple>Create Quiz</NavLink>
          <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-2 opacity-50" />
          
          {/* Track Section */}
          {links.filter(l => l.category === 'track' && !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
            <LinkItem key={l.to} {...l} />
          ))}
{currentUser?.role === 'admin' && <NavLink to="/admin" className="nav-link" data-ripple>Admin</NavLink>}
          {currentUser ? (
            <>
              <span className="text-sm text-slate-500 mx-2">Hi, {currentUser.name}</span>
              <button onClick={logout} className="btn-outline !px-3 !py-2">Logout</button>
            </>
          ) : (
            <>
<NavLink to="/login" className="btn-outline !px-3 !py-2" data-ripple>Login</NavLink>
<NavLink to="/register" className="btn !px-3 !py-2" data-ripple>Register</NavLink>
            </>
          )}
          <button 
            aria-label="Toggle reduced motion" 
            title={reduced ? 'Animations OFF - Click to enable' : 'Animations ON - Click to disable'} 
            onClick={toggleMotion} 
            className={`ml-2 p-2 rounded-lg transition-all duration-300 ${
              reduced 
                ? 'bg-red-100/50 dark:bg-red-900/20 hover:bg-red-200/50 text-red-600 dark:text-red-400' 
                : 'bg-emerald-100/50 dark:bg-emerald-900/20 hover:bg-emerald-200/50 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <motion.div
              animate={reduced ? { scale: [1, 0.8, 1], rotate: [0, -10, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Zap className="h-5 w-5" />
            </motion.div>
          </button>
          <button aria-label="Toggle theme" onClick={toggle} className="ml-1 p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Medium screen navbar - condensed */}
        <div className="hidden md:flex lg:hidden items-center gap-2">
          <div className="flex items-center gap-1">
            {links.slice(0, 4).filter(l => !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
              <LinkItem key={l.to} {...l} />
            ))}
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <div className="flex items-center gap-1">
            {currentUser ? (
              <>
                <span className="text-sm text-slate-500 mx-2">Hi, {currentUser.name.split(' ')[0]}</span>
                <button onClick={logout} className="btn-outline !px-3 !py-1 text-sm">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn-outline !px-3 !py-1 text-sm" data-ripple>Login</NavLink>
                <NavLink to="/register" className="btn !px-3 !py-1 text-sm" data-ripple>Register</NavLink>
              </>
            )}
            <button aria-label="Toggle theme" onClick={toggle} className="ml-1 p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button 
            aria-label="Toggle reduced motion" 
            title={reduced ? 'Animations OFF - Click to enable' : 'Animations ON - Click to disable'} 
            onClick={toggleMotion} 
            className={`p-2 rounded-lg transition-all duration-300 ${
              reduced 
                ? 'bg-red-100/50 dark:bg-red-900/20 hover:bg-red-200/50 text-red-600 dark:text-red-400' 
                : 'bg-emerald-100/50 dark:bg-emerald-900/20 hover:bg-emerald-200/50 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <motion.div
              animate={reduced ? { scale: [1, 0.8, 1], rotate: [0, -10, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Zap className="h-5 w-5" />
            </motion.div>
          </button>
          <button aria-label="Toggle theme" onClick={toggle} className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full inset-x-0 bg-white/95 dark:bg-slate-900/95 border-b border-white/20 dark:border-slate-800 shadow-lg">
            <div className="container-fluid mx-auto py-4 space-y-2">
              <div className="flex justify-end">
                <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {links.filter(l => !(l.hideForAdmin && currentUser?.role === 'admin')).map(l => (
                <div key={l.to}>
<Link to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800" data-ripple>
                    {l.label}
                  </Link>
                </div>
              ))}
              <Link to="/editor" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800" data-ripple>Editor</Link>
              <Link to="/create-quiz" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800" data-ripple>Create Quiz</Link>
{currentUser?.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800" data-ripple>Admin</Link>}
              {!currentUser ? (
                <>
<Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800" data-ripple>Login</Link>
<Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800" data-ripple>Register</Link>
                </>
              ) : (
                <button onClick={() => { setOpen(false); logout() }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800">Logout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

