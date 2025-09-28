import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Github, Heart, Mail, MessageCircle, HelpCircle, 
  Globe, ChevronUp, ExternalLink, Twitter, Linkedin,
  Youtube, Instagram, Facebook, Rss, Download,
  BookOpen, Users, Award, Shield, Lock, Eye,
  ArrowRight, CheckCircle, Star, Zap, Leaf,
  MapPin, Phone, Clock, Send, Bell
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

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
    <Link to={href} className="block">
      {content}
    </Link>
  )
}

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
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
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      toast.success('Thank you for subscribing! 🌱')
      setEmail('')
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white"
    >
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Bell className="h-8 w-8" />
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
        <p className="text-emerald-100 mb-6">
          Get the latest environmental education tips, platform updates, and exclusive content delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-white/50 focus:outline-none"
            required
          />
          <motion.button
            type="submit"
            className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="h-4 w-4" />
            Subscribe
          </motion.button>
        </form>
        
        {isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-emerald-100"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Successfully subscribed!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
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

  const footerSections = {
    product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "How it Works", href: "/how-it-works" },
      { label: "Demo", href: "/demo" },
      { label: "API", href: "/api" }
    ],
    education: [
      { label: "Courses", href: "/courses" },
      { label: "Quizzes", href: "/quizzes" },
      { label: "Challenges", href: "/challenges" },
      { label: "Resources", href: "/resources" },
      { label: "Certificates", href: "/certificates" }
    ],
    support: [
      { label: "Help Center", href: "/support" },
      { label: "Documentation", href: "/docs" },
      { label: "Community", href: "/community" },
      { label: "Contact Us", href: "/contact" },
      { label: "Status", href: "/status" }
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Partners", href: "/partners" },
      { label: "Press", href: "/press" }
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
      { label: "Accessibility", href: "/accessibility" }
    ]
  }

  const socialLinks = [
    { icon: Github, href: "https://github.com/aversoltix", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com/aversoltix", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/aversoltix", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com/aversoltix", label: "YouTube" },
    { icon: Instagram, href: "https://instagram.com/aversoltix", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/aversoltix", label: "Facebook" }
  ]

  const stats = [
    { icon: Users, value: "50K+", label: "Students" },
    { icon: BookOpen, value: "500+", label: "Courses" },
    { icon: Award, value: "98%", label: "Satisfaction" },
    { icon: Globe, value: "150+", label: "Countries" }
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
        {/* Newsletter Section */}
        <div className="container mx-auto px-4 py-12">
          <NewsletterSignup />
        </div>

        {/* Animated gradient line */}
        <motion.div 
          className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        <div className="container mx-auto px-4 py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand section */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">AverSoltix</span>
              </motion.div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                Empowering the next generation through interactive environmental education. 
                Learn, play, and make a difference for our planet.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                  >
                    <stat.icon className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{stat.value}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
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
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer Links */}
            {Object.entries(footerSections).map(([sectionName, links], sectionIndex) => (
              <motion.div
                key={sectionName}
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + sectionIndex * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 capitalize">
                  {sectionName}
                </h3>
                <ul className="space-y-3">
                  {links.map((link, index) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + sectionIndex * 0.1 + index * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors duration-200 flex items-center gap-2 group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom section */}
          <motion.div 
            className="pt-8 border-t border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <p>© {currentYear} AverSoltix. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <Link to="/privacy" className="hover:text-emerald-500 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="hover:text-emerald-500 transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="/cookies" className="hover:text-emerald-500 transition-colors">
                    Cookie Policy
                  </Link>
                </div>
              </div>
              
              <motion.div
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="flex items-center gap-4"
              >
                <EarthHeart />
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Shield className="h-4 w-4" />
                  <span>Secure & Trusted</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </motion.footer>

      {/* Scroll to top button */}
      <ScrollToTop />
    </>
  )
}

