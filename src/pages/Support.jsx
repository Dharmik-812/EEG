import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, MessageCircle, Mail, Phone, Clock, 
  CheckCircle, AlertCircle, Search, Send, 
  BookOpen, Video, FileText, Users, Zap,
  ChevronRight, ExternalLink, Star, Globe,
  Ticket, Bot, Headphones, Shield, Award,
  TrendingUp, Download, Settings, Monitor,
  Smartphone, Tablet, Wifi, Database,
  Lock, Eye, RefreshCw, PlayCircle
} from 'lucide-react'
import SEO from '../components/SEO'
import Card from '../components/Card'
import { useFeedbackStore } from '../store/feedbackStore'
import toast from 'react-hot-toast'

const SupportCard = ({ icon: Icon, title, description, onClick, color = 'blue', delay = 0 }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-emerald-600 transition-colors">
              {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {description}
            </p>
            <div className="flex items-center gap-2 mt-3 text-emerald-600 font-medium text-sm">
              <span>Get Help</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const FAQItem = ({ question, answer, isOpen, onToggle, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      <span className="font-medium text-slate-800 dark:text-slate-200">{question}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4 pt-0 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! I\'m your AI assistant. How can I help you today?', timestamp: new Date() }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    
    const newMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Thanks for your message! I\'m here to help. Let me connect you with our support team for more detailed assistance.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bot className="h-6 w-6" />
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Live Chat</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto h-64">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const ContactForm = ({ onSubmit }) => {
  const submitSupport = useFeedbackStore(state => state.submitSupport)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: 'general',
    message: '',
    attachments: []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }
    
    // Submit to store
    const submission = submitSupport(formData)
    console.log('Support request submitted:', submission)
    
    // Call external onSubmit if provided
    if (onSubmit) {
      onSubmit(formData)
    }
    
    toast.success('Support request submitted! We\'ll get back to you soon. 🌱')
    setFormData({ name: '', email: '', subject: '', priority: 'medium', message: '' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <MessageCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Contact Support
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Brief description of your issue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Need assistance</option>
                <option value="high">High - Urgent issue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
              placeholder="Please describe your issue or question in detail..."
              required
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-5 w-5" />
            Send Support Request
          </motion.button>
        </form>
      </Card>
    </motion.div>
  )
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFAQ, setOpenFAQ] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const supportOptions = [
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get instant help from our AI assistant. Available 24/7 for immediate assistance with common questions.",
      color: "emerald",
      action: () => toast.info('AI Assistant is now active! Look for the chat button in the bottom right.')
    },
    {
      icon: Ticket,
      title: "Create Ticket",
      description: "Submit a detailed support ticket and track its progress. We'll respond within 24 hours.",
      color: "blue",
      action: () => setActiveTab('contact')
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Browse our comprehensive guides, tutorials, and documentation to find answers quickly.",
      color: "purple",
      action: () => window.open('/how-it-works', '_blank')
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides to learn how to use all features of AverSoltix.",
      color: "orange",
      action: () => toast.info('Video tutorials coming soon!')
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other users, share experiences, and get help from the community.",
      color: "pink",
      action: () => window.open('/community', '_blank')
    },
    {
      icon: Headphones,
      title: "Phone Support",
      description: "Speak directly with our support team. Available Monday-Friday, 9 AM - 6 PM EST.",
      color: "indigo",
      action: () => toast.info('Phone: +1 (555) 123-4567')
    },
    {
      icon: Shield,
      title: "Security Issues",
      description: "Report security vulnerabilities or privacy concerns. We take these reports very seriously.",
      color: "red",
      action: () => window.open('mailto:security@aversoltix.com')
    },
    {
      icon: Settings,
      title: "Technical Support",
      description: "Get help with technical issues, integrations, and advanced configuration.",
      color: "yellow",
      action: () => setActiveTab('contact')
    }
  ]

  const supportStats = [
    { label: "Response Time", value: "< 24 hours", icon: Clock },
    { label: "Success Rate", value: "98%", icon: CheckCircle },
    { label: "User Satisfaction", value: "4.9/5", icon: Star },
    { label: "Available 24/7", value: "AI Assistant", icon: Zap }
  ]

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your inbox. If you don't receive the email, check your spam folder.",
      category: "Account"
    },
    {
      question: "Why can't I access the game engine?",
      answer: "The game engine requires a modern browser with WebGL support. Make sure you're using Chrome, Firefox, Safari, or Edge with hardware acceleration enabled. Try refreshing the page or clearing your browser cache.",
      category: "Technical"
    },
    {
      question: "How do I create a quiz?",
      answer: "Navigate to the Dashboard, click on 'Create Quiz', fill in the quiz details, add questions with multiple choice answers, and publish. You can also import questions from our question bank.",
      category: "Features"
    },
    {
      question: "Can I use AverSoltix on mobile devices?",
      answer: "Yes! AverSoltix is fully responsive and works on all devices. For the best experience, we recommend using the latest version of your mobile browser.",
      category: "Technical"
    },
    {
      question: "How do I track my students' progress?",
      answer: "As a teacher, you can view detailed analytics in your Dashboard, including individual student progress, class performance, and engagement metrics. Use the 'Class Analytics' section for comprehensive insights.",
      category: "Features"
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption, regular security audits, and comply with educational data privacy regulations. Your data is never shared with third parties without explicit consent.",
      category: "Security"
    },
    {
      question: "How do I integrate AverSoltix with my school's LMS?",
      answer: "We support integration with popular LMS platforms like Canvas, Blackboard, and Moodle. Contact our technical support team for specific integration instructions and setup assistance.",
      category: "Integration"
    },
    {
      question: "What browsers are supported?",
      answer: "We support all modern browsers including Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. For the best experience, we recommend using the latest version of your preferred browser.",
      category: "Technical"
    },
    {
      question: "How do I export my data?",
      answer: "You can export your data from the Settings page. We support CSV, JSON, and PDF formats. Data exports include all your content, progress, and analytics.",
      category: "Data"
    },
    {
      question: "Can I customize the learning content?",
      answer: "Yes! Teachers can create custom content, modify existing materials, and upload their own resources. Use the Content Editor to personalize the learning experience for your students.",
      category: "Features"
    },
    {
      question: "How do I report a bug?",
      answer: "Use our feedback system or contact support directly. Include details about what you were doing when the bug occurred, your browser version, and any error messages you saw.",
      category: "Support"
    },
    {
      question: "Is there an offline mode?",
      answer: "Currently, AverSoltix requires an internet connection. We're working on offline capabilities for mobile devices, which will be available in a future update.",
      category: "Features"
    }
  ]

  const troubleshootingSteps = [
    {
      icon: RefreshCw,
      title: "Clear Browser Cache",
      description: "Clear your browser's cache and cookies, then refresh the page.",
      steps: [
        "Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)",
        "Select 'All time' as the time range",
        "Check 'Cached images and files' and 'Cookies'",
        "Click 'Clear data' and refresh the page"
      ]
    },
    {
      icon: Wifi,
      title: "Check Internet Connection",
      description: "Ensure you have a stable internet connection.",
      steps: [
        "Test your connection by visiting other websites",
        "Try switching between WiFi and mobile data",
        "Restart your router if using WiFi",
        "Contact your internet service provider if issues persist"
      ]
    },
    {
      icon: Monitor,
      title: "Update Browser",
      description: "Make sure you're using the latest version of your browser.",
      steps: [
        "Check for browser updates in your browser's settings",
        "Restart your browser after updating",
        "Try using a different browser if problems continue",
        "Disable browser extensions temporarily"
      ]
    },
    {
      icon: Database,
      title: "Check System Requirements",
      description: "Verify your device meets our minimum requirements.",
      steps: [
        "Ensure you have at least 4GB RAM",
        "Check that JavaScript is enabled",
        "Verify WebGL support is available",
        "Update your graphics drivers if needed"
      ]
    }
  ]

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <SEO title="Support Center" description="Get help and support for AverSoltix environmental education platform." />
      
      <LiveChatWidget />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <HelpCircle className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Support Center
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              We're here to help you make the most of AverSoltix. Choose your preferred support method below.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {[
              { id: 'overview', label: 'Overview', icon: Globe },
              { id: 'contact', label: 'Contact Us', icon: MessageCircle },
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'troubleshooting', label: 'Troubleshooting', icon: Settings }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Support Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {supportStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={stat.label} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                            <Icon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </motion.div>

                {/* Support Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {supportOptions.map((option, index) => (
                    <SupportCard
                      key={option.title}
                      {...option}
                      onClick={option.action}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <ContactForm onSubmit={(data) => console.log('Support request:', data)} />
              </motion.div>
            )}

            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search FAQ..."
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <FAQItem
                      key={faq.question}
                      {...faq}
                      isOpen={openFAQ === index}
                      onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                      delay={index * 0.05}
                    />
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No FAQs found matching "{searchQuery}". Try a different search term.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'troubleshooting' && (
              <motion.div
                key="troubleshooting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                    Troubleshooting Guide
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Follow these step-by-step guides to resolve common issues
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {troubleshootingSteps.map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="p-6 h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                            <step.icon className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                              {step.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">Steps:</h4>
                          <ol className="space-y-1">
                            {step.steps.map((stepItem, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="flex-shrink-0 w-5 h-5 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium">
                                  {stepIndex + 1}
                                </span>
                                <span>{stepItem}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-8"
                >
                  <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Still Need Help?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        If these troubleshooting steps didn't resolve your issue, our support team is here to help.
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <motion.button
                          onClick={() => setActiveTab('contact')}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Contact Support
                        </motion.button>
                        <motion.button
                          onClick={() => toast.info('AI Assistant is now active!')}
                          className="px-6 py-3 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg font-medium transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Chat with AI
                        </motion.button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
