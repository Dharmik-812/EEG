import { Link } from 'react-router-dom'
import { Github, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer className="mt-20" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mb-2" />
      <div className="container mx-auto px-4 py-8 text-sm text-slate-600 dark:text-slate-400 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} AverSoltix. Learn. Play. Save the Planet.</p>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 inline-flex items-center gap-1">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <span className="inline-flex items-center gap-1">Made with <Heart className="h-4 w-4 text-pink-500" /> for Earth</span>
        </div>
      </div>
    </motion.footer>
  )
}

