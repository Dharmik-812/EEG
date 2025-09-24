import { motion } from 'framer-motion'
import { useRef } from 'react'
import SEO from '../components/SEO.jsx'
import { useScrollReveal, useGSAP } from '../animations'

export default function About() {
  const parallaxRef = useRef(null)
  
  // Scroll reveal for sections
  useScrollReveal(['.about-section'], { y: 80, stagger: 0.2, duration: 1 })
  
  // Parallax background elements
  useGSAP((gsap, ScrollTrigger) => {
    if (parallaxRef.current) {
      gsap.to(parallaxRef.current, {
        y: -200,
        opacity: 0.3,
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    }
  }, [])

  return (
    <>
      <SEO title="About" description="Learn about AverSoltix's mission to teach environmental science through play and inspire action for a sustainable future." />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Parallax Background Elements */}
        <div 
          ref={parallaxRef}
          className="absolute inset-0 opacity-20 pointer-events-none"
        >
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-xl" />
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full blur-lg" />
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full blur-md" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-black mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">AverSoltix</span>
            </motion.h1>
            
            <motion.p 
              className="text-2xl text-slate-600 dark:text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Empowering the next generation of environmental champions through gamified learning and interactive experiences.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="relative"
              whileInView={{ scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <motion.div
                  className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-3xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  🌱
                </motion.div>
                
                <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  AverSoltix transforms environmental education through the power of play. We create immersive, 
                  gamified experiences that make complex climate science accessible and engaging for learners 
                  of all ages.
                </p>
                
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { emoji: '🎮', label: 'Gamified' },
                    { emoji: '🌍', label: 'Global Impact' },
                    { emoji: '📚', label: 'Educational' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="text-center p-4 bg-white/5 rounded-xl"
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl mb-2">{item.emoji}</div>
                      <div className="text-sm font-medium">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div>
                <h3 className="text-2xl font-bold mb-4 text-emerald-600">🎯 Vision</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  A world where every learner becomes a steward of the planet—understanding climate change, 
                  protecting biodiversity, and accelerating the transition to renewable energy.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 text-sky-600">💡 Innovation</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  We leverage cutting-edge technology, interactive simulations, and social gaming mechanics 
                  to create learning experiences that inspire lasting behavioral change.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 text-teal-600">🌟 Impact</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Through our platform, students don't just learn about environmental issues—they 
                  develop the knowledge, skills, and motivation to become part of the solution.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section py-20 bg-gradient-to-br from-emerald-50/50 to-sky-50/50 dark:from-emerald-950/20 dark:to-sky-950/20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                className="group relative"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 300 } 
                }}
              >
                <div className="relative p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl h-full overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <motion.div 
                    className="text-5xl mb-6 relative z-10"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {value.icon}
                  </motion.div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-500 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {value.desc}
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

