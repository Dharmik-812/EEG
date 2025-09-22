import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Leaf, Menu, X, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useTheme from '../store/useTheme.js'
import { useAuthStore } from '../store/authStore'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/community', label: 'Community' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/badges', label: 'Badges' },
  { to: '/how-it-works', label: 'Guide' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  
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
      className={`fixed top-0 inset-x-0 z-50 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-800 transition-all ${scrolled ? 'shadow-sm' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400 opacity-60" />
      <nav className={`container mx-auto px-4 ${scrolled ? 'py-2' : 'py-3'} flex items-center justify-between transition-all`}>
        <Link to="/" className="group flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <Leaf className="h-6 w-6 text-emerald-500 drop-shadow group-hover:scale-110 transition-transform" aria-hidden />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-sky-500">AverSoltix</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {links.map(l => (
            <LinkItem key={l.to} {...l} />
          ))}
          <NavLink to="/editor" className="nav-link">Editor</NavLink>
          <NavLink to="/create-quiz" className="nav-link">Create Quiz</NavLink>
          {currentUser?.role === 'admin' && <NavLink to="/admin" className="nav-link">Admin</NavLink>}
          {currentUser ? (
            <>
              <span className="text-sm text-slate-500 mx-2">Hi, {currentUser.name}</span>
              <button onClick={logout} className="btn-outline !px-3 !py-2">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-outline !px-3 !py-2">Login</NavLink>
              <NavLink to="/register" className="btn !px-3 !py-2">Register</NavLink>
            </>
          )}
          <button aria-label="Toggle theme" onClick={toggle} className="ml-2 p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
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
            className="md:hidden absolute top-full inset-x-0 bg-white/95 dark:bg-slate-900/95 border-b border-white/20 dark:border-slate-800 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <div className="flex justify-end">
                <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-slate-800">
                  <X className="h-6 w-6" />
                </button>
              </div>
              {links.map(l => (
                <div key={l.to}>
                  <Link to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800">
                    {l.label}
                  </Link>
                </div>
              ))}
              <Link to="/editor" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800">Editor</Link>
              <Link to="/create-quiz" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800">Create Quiz</Link>
              {currentUser?.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800">Admin</Link>}
              {!currentUser ? (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800">Register</Link>
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

