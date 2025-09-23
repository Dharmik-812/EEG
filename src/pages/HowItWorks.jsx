import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { BookOpen, Gamepad2, PenTool, CheckCircle2, Crown, Users, Rocket, Leaf, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

export default function HowItWorks() {
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCards, setVisibleCards] = useState(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    { 
      icon: BookOpen, 
      title: 'Learn', 
      desc: 'Explore topics like climate, recycling, energy, and biodiversity.',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    { 
      icon: Gamepad2, 
      title: 'Play', 
      desc: 'Take interactive quizzes and complete eco-quests to earn XP.',
      color: 'text-sky-500',
      bgColor: 'bg-sky-50 dark:bg-sky-900/20'
    },
    { 
      icon: PenTool, 
      title: 'Create', 
      desc: 'Use the 2D Editor to design eco-games with sprites, text, and logic.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    { 
      icon: CheckCircle2, 
      title: 'Submit', 
      desc: 'Send your games and quizzes for review.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    { 
      icon: Crown, 
      title: 'Get Approved', 
      desc: 'Admins review and approve community submissions.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    { 
      icon: Users, 
      title: 'Share', 
      desc: 'Your creations appear in Community for everyone to enjoy.',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
  ]

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading your guide to saving the world..." variant="leaf" />
  }

  return (
    <>
      <SEO title="How It Works" description="See how AverSoltix helps you learn, play, create, and share environmental content." />
    <section className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <div className="flex items-center gap-3 text-2xl font-extrabold mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              <Leaf className="text-emerald-500 h-8 w-8"/>
            </motion.div>
            <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
              How AverSoltix Works
            </span>
            <Sparkles className="text-amber-400 h-6 w-6" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            A gamified environmental education platform: learn, play, create, and share—all in one place. 
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Join thousands of eco-warriors making a difference! 🌍
            </span>
          </p>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div 
            key={s.title} 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            whileInView={{ opacity: 1, y: 0, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800">
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  className={`p-3 rounded-xl ${s.bgColor} ${s.color} group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <s.icon className="h-7 w-7"/>
                </motion.div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Step {i + 1}: {s.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {s.desc}
                  </div>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex gap-1">
                  {[...Array(6)].map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 w-4 rounded-full transition-all duration-300 ${
                        idx <= i ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 ml-auto">Step {i + 1}/6</span>
              </div>
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

