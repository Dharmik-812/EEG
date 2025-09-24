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
  
  // Split text animation for hero title - disabled to preserve layout
  // useSplitText(titleRef)
  
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
      
      <section ref={heroRef} className="relative min-h-screen flex items-center safe-area-top">
        <div className="container-fluid mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <motion.h1 
                ref={titleRef}
                className="font-display text-responsive-xl font-black leading-[1.05] mb-6 sm:mb-8 lg:mb-10 text-center lg:text-left"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              >
                <motion.span 
                  className="block mb-2"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Learn. Play.
                </motion.span>
                <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600 block"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  Save the Planet.
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-responsive-md text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                A gamified environmental education platform. Earn XP, collect badges, and climb the leaderboard while learning about climate science.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <Link 
                  to="/challenges" 
                  className="btn-gold group px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold relative overflow-hidden w-full sm:w-auto text-center"
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
                  className="btn-outline px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto text-center"
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
                className="relative aspect-square max-w-sm sm:max-w-md lg:max-w-lg mx-auto"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-600 rounded-2xl sm:rounded-3xl transform rotate-6 opacity-20" />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                  <iframe
                    src="https://solarsystem.nasa.gov/gltf_embed/2393/"
                    title="Earth 3D"
                    className="w-full h-full min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]"
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                
                {/* Floating elements */}
                <motion.div
                  className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl"
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  🌍
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-1 sm:-bottom-2 -left-3 sm:-left-6 w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-base sm:text-lg lg:text-xl"
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  ♻️
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

<<<<<<< Updated upstream
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
=======
      
      {/* Features Section with Staggered Animation */}
      <section className="py-16 sm:py-24 lg:py-32 relative safe-area-bottom">
        <div className="container-fluid mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-responsive-lg font-bold mb-4 sm:mb-6">
              Features that <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Inspire</span>
            </h2>
            <p className="text-responsive-sm text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Discover a world of interactive learning designed to make environmental education engaging and rewarding.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                <div className="relative p-6 sm:p-8 h-full bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <motion.div 
                    className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 relative z-10"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.emoji}
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-emerald-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
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
>>>>>>> Stashed changes
    </>
  )
}

