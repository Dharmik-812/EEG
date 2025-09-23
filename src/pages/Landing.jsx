import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SEO from '../components/SEO.jsx'

export default function Landing() {
  return (
    <>
      <SEO
        title="Home"
        description="AverSoltix is a gamified environmental education platform for schools and colleges. Earn XP, collect badges, and climb the leaderboard while learning about climate change, recycling, renewable energy, and biodiversity."
      />
      <section className="relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[calc(100vh-6rem)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7"
        >
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">
            Learn. Play. <span className="text-gold">Save the Planet.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">AverSoltix is a gamified environmental education platform for schools and colleges. Earn XP, collect badges, and climb the leaderboard while learning about climate change, recycling, renewable energy, and biodiversity.</p>
          <div className="mt-8 flex items-center gap-3">
            <Link to="/challenges" className="btn-gold group">
              Start Learning
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/about" className="btn-outline">Why AverSoltix?</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative md:col-span-5"
        >
          <div className="aspect-[16/10] md:aspect-[4/3] rounded-2xl border border-white/20 dark:border-slate-800 overflow-hidden shadow-xl relative">
            <iframe
              src="https://solarsystem.nasa.gov/gltf_embed/2393/"
              title="Earth 3D"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-sky-400/20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              Explore interactive quizzes, animated infographics, and fun challenges. Earn XP and unlock eco-badges!
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Quests & Challenges', desc: 'Answer quizzes and complete eco-quests to earn XP.', emoji: '🧩' },
          { title: 'Daily Streaks', desc: 'Come back daily to keep your streak and earn bonuses.', emoji: '🔥' },
          { title: 'Badges & Leaderboards', desc: 'Show off your achievements and compete with friends.', emoji: '🏆' },
        ].map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <div className="card p-6 h-full">
              <div className="text-3xl">{f.emoji}</div>
              <div className="mt-3 font-semibold">{f.title}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
    </>
  )
}

