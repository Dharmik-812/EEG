import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import SEO from '../components/SEO.jsx'
import { useScrollReveal, useSplitText, useGSAP } from '../animations'

// Testimonials data for the slider
const testimonialsData = [
  {
    name: "Dharmik",
    role: "Environmental Science Student",
    school: "Green Tech University",
    content: "AverSoltix transformed how I understand climate change. The interactive games make complex topics so much clearer!",
    avatar: "🌱"
  },

  {
    name: "Shreya",
    role: "Biology Teacher",
    school: "Nature Academy",
    content: "My classroom has never been more interactive. Students are asking deeper questions about biodiversity.",
    avatar: "🦋"
  },
  {
    name: "Riya",
    role: "Sustainability Coordinator",
    school: "EcoVision College",
    content: "The gamified approach keeps our students engaged for hours. They're learning while having fun!",
    avatar: "🌿"
  },
  {
    name: "Sneha",
    role: "Environmental Club President",
    school: "Eco Warriors College",
    content: "We use AverSoltix for our club activities. It's amazing how it connects classroom learning with real action.",
    avatar: "🌍"
  },
  {
    name: "Prit",
    role: "Engineering Student",
    school: "Tech Institute",
    content: "The renewable energy challenges helped me understand solar and wind power like never before!",
    avatar: "⚡"
  },
  {
    name: "Aryan",
    role: "High School Student",
    school: "Future Leaders School",
    content: "Earning badges and competing on leaderboards makes learning about the environment addictive!",
    avatar: "🏆"
  },
  {
    name: "Henil",
    role: "Chemistry Teacher",
    school: "Innovation High",
    content: "The platform beautifully explains carbon cycles and chemical processes. My students love the visual approach.",
    avatar: "🧪"
  },

  {
    name: "Hir",
    role: "Marine Biology Student",
    school: "Ocean Studies University",
    content: "The ocean conservation modules opened my eyes to marine ecosystems. The underwater simulations are incredible!",
    avatar: "🐠"
  },
  {
    name: "Abdullah",
    role: "Physics Teacher",
    school: "Science Pioneers Academy",
    content: "Teaching energy conservation has never been easier. The platform makes abstract concepts tangible.",
    avatar: "🔬"
  },
  {
    name: "Aditya",
    role: "Computer Science Student",
    school: "Digital Innovation Institute",
    content: "The coding challenges for environmental modeling got me interested in climate data analysis!",
    avatar: "💻"
  },
  {
    name: "Shreena",
    role: "Geography Teacher",
    school: "Global Awareness School",
    content: "My students now understand weather patterns and climate zones through interactive maps and games.",
    avatar: "🗺️"
  },
  {
    name: "Shaista",
    role: "Environmental Law Student",
    school: "Justice & Environment College",
    content: "The platform helped me understand the scientific basis for environmental policies. Excellent resource!",
    avatar: "⚖️"
  },
  {
    name: "Prince",
    role: "Agricultural Science Student",
    school: "Sustainable Farming Institute",
    content: "Learning about sustainable agriculture through gamification changed my perspective on farming practices.",
    avatar: "🌾"
  },
  {
    name: "Paula",
    role: "International Student",
    school: "Global Green University",
    content: "AverSoltix helped me understand environmental issues from a global perspective. The diversity is amazing!",
    avatar: "🌎"
  },
  {
    name: "Nimisha Ma'am",
    role: "Principal",
    school: "Eco Excellence Academy",
    content: "This platform has revolutionized environmental education at our school. Student engagement is at an all-time high!",
    avatar: "👩‍🏫"
  },
  {
    name: "Vipul Sir",
    role: "Environmental Science Professor",
    school: "Research & Innovation University",
    content: "As an educator for 20 years, I've never seen students so excited about environmental science. Truly remarkable!",
    avatar: "👨‍🔬"
  }
]

// Testimonial Slider Component
function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // const timerRef = useRef(null)
  const typingRef = useRef(null)

  // Set visible count to always show 1 testimonial
  useEffect(() => {
    setVisibleCount(1)
  }, [])

  // Typewriter effect
  useEffect(() => {
    const currentTestimonial = testimonialsData[currentIndex]
    const fullText = currentTestimonial.content
    setDisplayedText('')
    setIsTyping(true)

    let currentCharIndex = 0

    const typeWriter = () => {
      if (currentCharIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentCharIndex + 1))
        currentCharIndex++
        typingRef.current = setTimeout(typeWriter, 50) // 50ms per character
      } else {
        setIsTyping(false)
        // Wait 2 seconds after typing is complete, then advance
        typingRef.current = setTimeout(() => {
          if (isAutoPlaying) {
            setCurrentIndex((prev) => (prev + 1) % testimonialsData.length)
          }
        }, 2000)
      }
    }

    // Start typing after a small delay
    typingRef.current = setTimeout(typeWriter, 500)

    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current)
      }
    }
  }, [currentIndex, isAutoPlaying])

  const goToNext = () => {
    if (!isTyping) {
      setCurrentIndex((prev) => (prev + 1) % testimonialsData.length)
      resetTimer()
    }
  }

  const goToPrevious = () => {
    if (!isTyping) {
      setCurrentIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length)
      resetTimer()
    }
  }

  const resetTimer = () => {
    setIsAutoPlaying(false)
    if (typingRef.current) {
      clearTimeout(typingRef.current)
    }
    // Resume auto-play after a short delay
    setTimeout(() => {
      setIsAutoPlaying(true)
    }, 1000)
  }

  // Show testimonials based on screen size
  const getVisibleTestimonials = () => {
    const testimonialsToShow = []
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % testimonialsData.length
      testimonialsToShow.push({ ...testimonialsData[index], key: index })
    }
    return testimonialsToShow
  }

  // Compute auto duration for progress bar based on current testimonial length (typing + pause)
  const current = testimonialsData[currentIndex]
  const autoDuration = (current?.content?.length || 100) * 0.05 + 2.2 // seconds

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container-fluid mx-auto">
        {/* Top progress bar */}
        <div className="relative mx-auto max-w-3xl mb-6">
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <motion.div
              key={`progress-${currentIndex}`}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: autoDuration, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500"
            />
          </div>
        </div>

        <motion.div
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-responsive-lg font-bold mb-4 sm:mb-6">
            What Our Community Says
          </h2>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600" />
          </button>

          {/* Testimonials Container */}
          <div className="mx-8 sm:mx-16 lg:mx-24 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="flex justify-center"
              >
                {getVisibleTestimonials().map((testimonial) => (
                  <motion.div
                    key={testimonial.key}
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
                    className="relative max-w-xl w-full bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 group overflow-hidden will-change-transform"
                    whileHover={{ y: -10, scale: 1.03, rotateY: 2, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Animated edge shine */}
                    <motion.div
                      className="pointer-events-none absolute -inset-[2px] rounded-3xl"
                      style={{ background: 'conic-gradient(from 0deg, rgba(16,185,129,.25), rgba(14,165,233,.25), rgba(147,51,234,.25), rgba(16,185,129,.25))' }}
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-[2px] rounded-3xl bg-gradient-to-br from-white/90 to-white/80 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-xl" />
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-sky-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Floating Particles - Optimized */}
                    <motion.div
                      className="absolute top-6 right-6 w-3 h-3 bg-emerald-400 rounded-full"
                      animate={{
                        y: [-6, 6, -6],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                    />
                    <motion.div
                      className="absolute bottom-6 left-6 w-2 h-2 bg-sky-400 rounded-full"
                      animate={{
                        x: [-4, 4, -4],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5, repeatType: "reverse" }}
                    />

                    <div className="relative z-10 text-center">
                      {/* Avatar with ring and parallax */}
                      <motion.div
                        className="relative inline-grid place-items-center mb-6"
                        style={{ perspective: 800 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 blur-md opacity-40"
                          animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="relative text-5xl sm:text-6xl grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/70 dark:bg-slate-800/70 border border-white/30 dark:border-slate-700/50 shadow-inner"
                          whileHover={{ rotateY: [0, -8, 8, 0] }}
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, rotateY: { duration: 0.6 } }}
                        >
                          {testimonial.avatar}
                        </motion.div>
                      </motion.div>

                      {/* Quote with typewriter animation */}
                      <motion.blockquote
                        className="text-xl sm:text-2xl text-slate-800 dark:text-white mb-6 leading-relaxed font-semibold relative min-h-[120px] flex items-center justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        {/* Quote marks */}
                        <motion.span className="absolute -top-4 -left-2 text-4xl text-emerald-400/60 font-serif" animate={{ y: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>“</motion.span>
                        <span className="relative z-10 text-center">
                          {displayedText}
                          {isTyping && (
                            <motion.span
                              className="inline-block w-0.5 h-6 bg-emerald-500 ml-1"
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                        </span>
                        <motion.span className="absolute -bottom-5 -right-2 text-4xl text-emerald-400/60 font-serif" animate={{ y: [2, -2, 2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>”</motion.span>
                      </motion.blockquote>

                      {/* Author Info with enhanced styling */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="border-t border-slate-200 dark:border-slate-600 pt-4"
                      >
                        <div className="font-bold text-xl text-slate-900 dark:text-white mb-1">
                          {testimonial.name}
                        </div>
                        <div className="text-base text-emerald-600 dark:text-emerald-400 font-medium">
                          {testimonial.role}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {testimonial.school}
                        </div>
                      </motion.div>
                    </div>

                    {/* Simplified decorative border */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-500/5 to-sky-500/5" />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Avatar Navigation */}
          <div className="flex justify-center mt-10 flex-wrap gap-3">
            {testimonialsData.map((t, index) => (
              <button
                key={index}
                onClick={() => { setCurrentIndex(index); resetTimer() }}
                className={`relative grid place-items-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none ${index === currentIndex ? 'ring-2 ring-emerald-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                <span className="text-base">{t.avatar}</span>
                {index === currentIndex && (
                  <motion.span layoutId="active-avatar-ring" className="absolute inset-0 rounded-full border-2 border-emerald-400/60" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const parallaxRef = useRef(null)

  // Split text animation for hero title
  useSplitText(titleRef)

  // Scroll reveal for cards below
  useScrollReveal(['.hero-card'], { y: 60, stagger: 0.15, duration: 1.2 })

  // GSAP parallax background
  useGSAP((gsap) => {
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
                  className="block relative"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <span
                    className="relative z-10 font-black"
                    style={{
                      background: 'linear-gradient(90deg, #f6e27a 0%, #f7c14b 25%, #ffd700 50%, #f7c14b 75%, #f6e27a 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      backgroundSize: '200% 100%',
                      animation: 'gradient-golden 4s ease-in-out infinite',
                      filter: 'drop-shadow(0 0 22px rgba(247, 193, 75, 0.45)) drop-shadow(0 0 8px rgba(247, 193, 75, 0.35))'
                    }}
                  >
                    Save the Planet.
                  </span>
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
                  to="/community"
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
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={(e) => {
                      console.error('NASA 3D model failed to load:', e);
                    }}
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
        </div>
      </section>

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

      {/* Testimonials Section - Animated Slider */}
      <TestimonialSlider />
    </>
  )
}