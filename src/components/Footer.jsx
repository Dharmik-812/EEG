import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Github, Heart, Mail, MessageCircle, HelpCircle, 
  Globe, ChevronUp, ExternalLink, Twitter, Linkedin,
  Youtube, Instagram, Facebook, BookOpen, Users, 
  Award, Shield, ArrowRight, Star, 
  Zap, Leaf, PlayCircle, Trophy,
  BarChart3, Gamepad2, Brain, Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FooterLink = ({ href, children, icon: Icon, external = false, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const content = (
    <motion.div
      className={`group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors duration-200 ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {Icon && (
        <motion.div
          animate={{ 
            rotate: isHovered ? [0, -10, 10, 0] : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      )}
      <span className="font-medium">{children}</span>
      {external && (
        <motion.div
          animate={{ x: isHovered ? 2 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ExternalLink className="h-3 w-3" />
        </motion.div>
      )}
    </motion.div>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return (
    <Link 
      to={href} 
      className="block"
      onClick={(e) => {
        // Prevent default navigation temporarily
        e.preventDefault()
        
        // Scroll to top first to prevent blank page issues
        window.scrollTo({ top: 0, behavior: 'instant' })
        
        // Use a small delay to ensure scroll completes before navigation
        setTimeout(() => {
          // Force navigation using window.location for more reliable routing
          window.location.href = href
        }, 50)
      }}
    >
      {content}
    </Link>
  )
}

const ScrollToTop = ({ isScrolling }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timeoutId
    
    const toggleVisibility = () => {
      // Clear any existing timeout
      clearTimeout(timeoutId)
      
      // Set a small delay to prevent flickering
      timeoutId = setTimeout(() => {
        // Only show if user is not actively scrolling and has scrolled enough
        if (window.pageYOffset > 800 && !isScrolling) { // Increased threshold and check scrolling state
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
      }, 200) // Increased delay
    }

    // Use passive listener for better performance
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      clearTimeout(timeoutId)
    }
  }, [isScrolling])

  const scrollToTop = () => {
    // Use a more reliable scroll method
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}


const EarthHeart = () => {
  const [isBeating, setIsBeating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBeating(true)
      setTimeout(() => setIsBeating(false), 600)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="flex items-center gap-2"
      animate={{ 
        scale: isBeating ? [1, 1.1, 1] : 1,
      }}
      transition={{ 
        duration: 0.6,
        ease: "easeInOut"
      }}
    >
      <span className="text-slate-600 dark:text-slate-400">Made with</span>
      <motion.div
        animate={{ 
          scale: isBeating ? [1, 1.2, 1] : 1,
          rotate: isBeating ? [0, 5, -5, 0] : 0
        }}
        transition={{ 
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        <Heart className="h-4 w-4 text-pink-500 fill-current" />
      </motion.div>
      <span className="text-slate-600 dark:text-slate-400">for</span>
      <motion.div
        animate={{ 
          rotate: isBeating ? [0, 10, -10, 0] : 0
        }}
        transition={{ 
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        <Globe className="h-4 w-4 text-emerald-500" />
      </motion.div>
    </motion.div>
  )
}

export default function Footer() {
  const [currentYear] = useState(new Date().getFullYear())
  const [isHovered, setIsHovered] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  // Prevent automatic scrolling issues
  useEffect(() => {
    let scrollTimeout
    
    const handleScroll = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      
      // Reset scrolling state after user stops scrolling
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Only use pages that actually exist on the AverSoltix website
  const footerSections = {
    product: [
      { label: "How it Works", href: "/how-it-works", icon: BookOpen },
      { label: "Projects", href: "/projects", icon: Gamepad2 },
      { label: "Editor", href: "/editor", icon: Zap },
      { label: "Create Quiz", href: "/create-quiz", icon: Target }
    ],
    education: [
      { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
      { label: "Badges", href: "/badges", icon: Award },
      { label: "Chatbot", href: "/chat", icon: Brain }
    ],
    support: [
      { label: "Support", href: "/support", icon: HelpCircle },
      { label: "Feedback", href: "/feedback", icon: MessageCircle },
      { label: "Community", href: "/community", icon: Users },
      { label: "Privacy", href: "/privacy", icon: Shield }
    ],
    company: [
      { label: "About", href: "/about", icon: Globe },
      { label: "Login", href: "/login", icon: Heart },
      { label: "Register", href: "/register", icon: Star },
      { label: "Admin", href: "/admin", icon: PlayCircle }
    ]
  }

  const socialLinks = [
    { icon: Github, href: "https://github.com/aversoltix", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com/aversoltix", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/aversoltix", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com/aversoltix", label: "YouTube" },
    { icon: Instagram, href: "https://instagram.com/aversoltix", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/aversoltix", label: "Facebook" },
    { icon: Gamepad2, href: "https://avesol-coral.vercel.app", label: "Gaming Platform" }
  ]

  return (
    <>
      <motion.footer 
        className="relative mt-20 bg-gradient-to-b from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated gradient line */}
        <motion.div 
          className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        <div className="container mx-auto px-4 py-12">
          {/* Main footer content - 4 column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1 - Product */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 font-display">
                Product
              </h3>
              <ul className="space-y-4">
                {footerSections.product.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors duration-200 flex items-center gap-3 group"
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Column 2 - Education */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 font-display">
                Education
              </h3>
              <ul className="space-y-4">
                {footerSections.education.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors duration-200 flex items-center gap-3 group"
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Column 3 - Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 font-display">
                Support
              </h3>
              <ul className="space-y-4">
                {footerSections.support.map((link, index) => (
                  <motion.li
                  key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors duration-200 flex items-center gap-3 group"
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Column 4 - Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 font-display">
                Company
              </h3>
              <ul className="space-y-4">
                {footerSections.company.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors duration-200 flex items-center gap-3 group"
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Brand section with social links */}
          <motion.div 
            className="pt-8 border-t border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Brand */}
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl flex items-center justify-center shadow-glow">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 font-display">AverSoltix</span>
                </motion.div>
                <span className="text-slate-400 hidden lg:block">•</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm hidden lg:block">
                  Empowering environmental education
                </p>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
            >
                {socialLinks.map((social, index) => (
              <motion.a
                    key={social.label}
                    href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                    className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-emerald-500 hover:text-white transition-all duration-200 group"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.05 }}
              >
                    <social.icon className="h-4 w-4" />
              </motion.a>
                ))}
            </motion.div>
          </div>
          </motion.div>

          {/* Bottom bar */}
          <motion.div 
            className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <p>© {currentYear} AverSoltix. All rights reserved.</p>
              </div>
              
              <div className="flex items-center gap-6">
                  <Link to="/privacy" className="hover:text-emerald-500 transition-colors">
                  Privacy Policy
                  </Link>
                  <Link to="/terms" className="hover:text-emerald-500 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="hover:text-emerald-500 transition-colors">
                  Cookie Policy
                  </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
      </div>
    </motion.footer>

      {/* Scroll to top button */}
      <ScrollToTop isScrolling={isScrolling} />
    </>
  )
}

