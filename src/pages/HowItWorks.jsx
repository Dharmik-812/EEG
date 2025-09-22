import { motion } from 'framer-motion'
import Card from '../components/Card'
import { BookOpen, Gamepad2, PenTool, CheckCircle2, Crown, Users, Rocket, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

export default function HowItWorks() {
  const steps = [
    { icon: BookOpen, title: 'Learn', desc: 'Explore topics like climate, recycling, energy, and biodiversity.' },
    { icon: Gamepad2, title: 'Play', desc: 'Take interactive quizzes and complete eco-quests to earn XP.' },
    { icon: PenTool, title: 'Create', desc: 'Use the 2D Editor to design eco-games with sprites, text, and logic.' },
    { icon: CheckCircle2, title: 'Submit', desc: 'Send your games and quizzes for review.' },
    { icon: Crown, title: 'Get Approved', desc: 'Admins review and approve community submissions.' },
    { icon: Users, title: 'Share', desc: 'Your creations appear in Community for everyone to enjoy.' },
  ]

  return (
    <>
      <SEO title="How It Works" description="See how AverSoltix helps you learn, play, create, and share environmental content." />
    <section className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-2 text-2xl font-extrabold">
            <Leaf className="text-emerald-500"/> How AverSoltix Works
          </div>
          <p className="mt-3 text-slate-600 dark:text-slate-300">A gamified environmental education platform: learn, play, create, and share—all in one place.</p>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Card>
              <div className="flex items-center gap-3">
                <s.icon className="h-6 w-6 text-emerald-500"/>
                <div className="font-semibold">{s.title}</div>
              </div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{s.desc}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="font-semibold mb-2">Quick Start</div>
        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <li>Login or Register an account.</li>
          <li>Try challenges under <Link to="/challenges" className="text-emerald-600">Challenges</Link>.</li>
          <li>Open the <Link to="/editor" className="text-emerald-600">Editor</Link> to create a 2D game. Add sprites/text, tweak properties, and hit Play.</li>
          <li>Submit your game for review, then track it in <Link to="/community" className="text-emerald-600">Community</Link>.</li>
        </ol>
        <div className="mt-3">
          <Link to="/editor" className="btn inline-flex items-center gap-2"><Rocket className="h-5 w-5"/> Start Building</Link>
        </div>
      </Card>
    </section>
    </>
  )
}

