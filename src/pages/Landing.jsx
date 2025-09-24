import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import SEO from '../components/SEO.jsx'
import { useScrollReveal, useSplitText, useGSAP } from '../animations'

export default function Landing() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const parallaxRef = useRef(null)
  
  // Split text animation for hero title
  useSplitText(titleRef)
  
  // Scroll reveal for cards below
  useScrollReveal(['.hero-card'], { y: 60, stagger: 0.15, duration: 1.2 })
  
  // GSAP parallax background
  useGSAP((gsap, ScrollTrigger) => {
    if (parallaxRef.current) {
      gsap.fromTo(parallaxRef.current, 
        { y: 0 },
        {
          y: -100,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        }
      )
    }
  }, [])

  return (
    <>
      <SEO
        title="Home"
        description="AverSoltix is a gamified environmental education platform for schools and colleges. Earn XP, collect badges, and climb the leaderboard while learning about climate change, recycling, renewable energy, and biodiversity."
      />
      
      {/* Parallax Background */}
      <div 
        ref={parallaxRef}
        className="fixed inset-0 -z-20 bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950"
      />
      
      <section ref={heroRef} className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <motion.h1 
                ref={titleRef}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Learn. Play. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Save the Planet.</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                A gamified environmental education platform. Earn XP, collect badges, and climb the leaderboard while learning about climate science.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <Link 
                  to="/challenges" 
                  className="btn-gold group px-8 py-4 text-lg font-semibold relative overflow-hidden"
                  data-ripple
                >
                  <motion.span
                    className="relative z-10 flex items-center gap-2"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </motion.span>
                </Link>
                <Link 
                  to="/about" 
                  className="btn-outline px-8 py-4 text-lg font-semibold"
                  data-ripple
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.4, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <motion.div 
                className="relative aspect-square max-w-lg mx-auto"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-600 rounded-3xl transform rotate-6 opacity-20" />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                  <iframe
                    src="https://solarsystem.nasa.gov/gltf_embed/2393/"
                    title="Earth 3D"
                    className="w-full h-full min-h-[400px]"
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                
                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-2xl"
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  🌍
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-2 -left-6 w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-xl"
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  ♻️
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      
      {/* Features Section with Staggered Animation */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Features that <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Inspire</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Discover a world of interactive learning designed to make environmental education engaging and rewarding.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Quests & Challenges', 
                desc: 'Interactive missions that teach climate science through engaging gameplay mechanics.', 
                emoji: '🧩',
                gradient: 'from-emerald-500 to-teal-600'
              },
              { 
                title: 'Daily Streaks', 
                desc: 'Build consistent learning habits with streak tracking and daily rewards.', 
                emoji: '🔥',
                gradient: 'from-orange-500 to-red-600'
              },
              { 
                title: 'Badges & Leaderboards', 
                desc: 'Compete with peers and unlock achievements as you master environmental topics.', 
                emoji: '🏆',
                gradient: 'from-yellow-500 to-amber-600'
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                className="hero-card group cursor-pointer"
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.2, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                data-ripple
              >
                <div className="relative p-8 h-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <motion.div 
                    className="text-5xl mb-6 relative z-10"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.emoji}
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                  
                  {/* Floating particles */}
                  <motion.div
                    className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{ 
                      y: [-5, 5, -5],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.3 
                    }}
                  />
                  <motion.div
                    className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-sky-400 rounded-full"
                    animate={{ 
                      x: [-3, 3, -3],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

