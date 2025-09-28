import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, MessageCircle, Star, ThumbsUp, ThumbsDown, 
  Heart, Globe, Zap, BookOpen, Gamepad2, Users,
  CheckCircle, AlertCircle, Clock, Award, TrendingUp,
  Upload, FileText, Image, Video, Mic, Camera,
  Filter, Search, SortAsc, SortDesc, Eye, Edit3,
  Download, Share2, Flag, Tag, Calendar, User
} from 'lucide-react'
import SEO from '../components/SEO'
import Card from '../components/Card'
import { useFeedbackStore } from '../store/feedbackStore'
import toast from 'react-hot-toast'

const FeedbackCard = ({ icon: Icon, title, description, onClick, color = 'blue', delay = 0 }) => {
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
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const FeedbackForm = ({ onSubmit }) => {
  const submitFeedback = useFeedbackStore(state => state.submitFeedback)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'general',
    priority: 'medium',
    rating: 0,
    message: '',
    attachments: [],
    tags: [],
    allowContact: true,
    anonymous: false
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setIsUploading(true)
    try {
      // Simulate file upload - in real app, upload to server
      const uploadedFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }))
      
      toast.success(`${files.length} file(s) uploaded successfully!`)
    } catch (error) {
      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const removeAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== id)
    }))
  }

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.message.trim()) {
      toast.error('Please enter your feedback')
      return
    }
    
    // Submit to store
    const submission = submitFeedback(formData)
    console.log('Feedback submitted:', submission)
    
    // Call external onSubmit if provided
    if (onSubmit) {
      onSubmit(formData)
    }
    
    toast.success('Thank you for your feedback! 🌱')
    setFormData({ 
      name: '', 
      email: '', 
      feedbackType: 'general', 
      priority: 'medium',
      rating: 0, 
      message: '', 
      attachments: [],
      tags: [],
      allowContact: true,
      anonymous: false
    })
  }

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: MessageCircle, color: 'blue' },
    { value: 'bug', label: 'Bug Report', icon: ThumbsDown, color: 'red' },
    { value: 'feature', label: 'Feature Request', icon: ThumbsUp, color: 'emerald' },
    { value: 'education', label: 'Educational Content', icon: BookOpen, color: 'purple' },
    { value: 'ui', label: 'User Interface', icon: Zap, color: 'orange' },
    { value: 'performance', label: 'Performance', icon: TrendingUp, color: 'indigo' },
    { value: 'accessibility', label: 'Accessibility', icon: Eye, color: 'pink' },
    { value: 'security', label: 'Security', icon: Flag, color: 'yellow' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'green', description: 'Nice to have' },
    { value: 'medium', label: 'Medium', color: 'yellow', description: 'Important' },
    { value: 'high', label: 'High', color: 'orange', description: 'Urgent' },
    { value: 'critical', label: 'Critical', color: 'red', description: 'Blocking issue' }
  ]

  const suggestedTags = [
    'mobile', 'desktop', 'performance', 'ui', 'ux', 'accessibility', 
    'security', 'education', 'gamification', 'chat', 'editor', 'quiz'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <MessageCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Share Your Feedback
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name {!formData.anonymous && '(Optional)'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={formData.anonymous}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={formData.anonymous ? "Anonymous feedback" : "Your name"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email {!formData.anonymous && '(Optional)'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={formData.anonymous}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={formData.anonymous ? "Not required for anonymous" : "your.email@example.com"}
              />
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="anonymous" className="text-sm text-slate-600 dark:text-slate-400">
              Submit feedback anonymously
            </label>
          </div>

          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              What type of feedback is this?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon
                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, feedbackType: type.value })}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                      formData.feedbackType === type.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 text-slate-600 dark:text-slate-400'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorityLevels.map((priority) => (
                <motion.button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value })}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                    formData.priority === priority.value
                      ? `border-${priority.color}-500 bg-${priority.color}-50 dark:bg-${priority.color}-900/20 text-${priority.color}-700 dark:text-${priority.color}-300`
                      : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 text-slate-600 dark:text-slate-400'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium text-sm">{priority.label}</div>
                  <div className="text-xs opacity-75">{priority.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              How would you rate your overall experience?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    star <= formData.rating
                      ? 'text-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star className="h-6 w-6 fill-current" />
                </motion.button>
              ))}
            </div>
            {formData.rating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-slate-600 dark:text-slate-400 mt-2"
              >
                {formData.rating === 1 && "We're sorry to hear that. Please let us know how we can improve."}
                {formData.rating === 2 && "We appreciate your feedback. We're working to make things better."}
                {formData.rating === 3 && "Thanks for your feedback. We're always looking to improve."}
                {formData.rating === 4 && "Great! We're glad you're enjoying AverSoltix."}
                {formData.rating === 5 && "Excellent! We're thrilled you love AverSoltix!"}
              </motion.p>
            )}
          </div>

          {/* Feedback Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your feedback *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
              placeholder="Tell us what you think about AverSoltix, what we could improve, or any ideas you have..."
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <motion.div
                  className="flex flex-col items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="h-8 w-8 text-slate-400" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {isUploading ? 'Uploading...' : 'Click to upload files or drag and drop'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Images, videos, documents (max 10MB each)
                  </div>
                </motion.div>
              </label>
            </div>
            
            {/* Display uploaded files */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{file.name}</span>
                      <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-100"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTags
                .filter(tag => !formData.tags.includes(tag))
                .slice(0, 8)
                .map((tag) => (
                  <motion.button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tag}
                  </motion.button>
                ))}
            </div>
          </div>

          {/* Contact Permission */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allowContact"
                checked={formData.allowContact}
                onChange={(e) => setFormData({ ...formData, allowContact: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="allowContact" className="text-sm text-slate-600 dark:text-slate-400">
                Allow us to contact you for follow-up questions about your feedback
              </label>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Your feedback helps us improve AverSoltix. We may use it to enhance features, fix bugs, or develop new educational content.
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-5 w-5" />
            Send Feedback
          </motion.button>
        </form>
      </Card>
    </motion.div>
  )
}

const FeedbackHistory = () => {
  const feedbackSubmissions = useFeedbackStore(state => state.feedbackSubmissions)
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')

  const sortedFeedback = feedbackSubmissions
    .filter(feedback => filterBy === 'all' || feedback.feedbackType === filterBy)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'rating') return b.rating - a.rating
      return 0
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Your Feedback History
          </h2>
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="education">Education</option>
              <option value="ui">UI/UX</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">By Rating</option>
            </select>
          </div>
        </div>

        {sortedFeedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No feedback submitted yet. Share your thoughts to help us improve!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedFeedback.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                      {feedback.feedbackType}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feedback.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      feedback.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                      feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {feedback.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
                  {feedback.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {feedback.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {feedback.tags && feedback.tags.length > 0 && (
                      <div className="flex gap-1">
                        {feedback.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feedback.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export default function Feedback() {
  const [activeTab, setActiveTab] = useState('form')

  const feedbackCategories = [
    {
      icon: MessageCircle,
      title: "General Feedback",
      description: "Share your overall thoughts and suggestions about AverSoltix",
      color: "blue"
    },
    {
      icon: ThumbsUp,
      title: "Feature Requests",
      description: "Suggest new features or improvements you'd like to see",
      color: "emerald"
    },
    {
      icon: BookOpen,
      title: "Educational Content",
      description: "Feedback on courses, quizzes, and learning materials",
      color: "purple"
    },
    {
      icon: Gamepad2,
      title: "Game Experience",
      description: "Share your thoughts on our gamified learning experiences",
      color: "orange"
    },
    {
      icon: Users,
      title: "Community Features",
      description: "Feedback on forums, leaderboards, and social features",
      color: "pink"
    },
    {
      icon: Zap,
      title: "Performance & UI",
      description: "Report bugs, performance issues, or UI/UX concerns",
      color: "indigo"
    }
  ]

  return (
    <>
      <SEO title="Feedback Center" description="Share your feedback about AverSoltix environmental education platform." />
      
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
              <Heart className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Feedback Center
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Your voice matters! Help us improve AverSoltix and make environmental education better for everyone.
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
              { id: 'form', label: 'Submit Feedback', icon: MessageCircle },
              { id: 'categories', label: 'Feedback Categories', icon: Globe },
              { id: 'history', label: 'My Feedback', icon: Clock }
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
            {activeTab === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <FeedbackForm onSubmit={(data) => console.log('Feedback submitted:', data)} />
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {feedbackCategories.map((category, index) => (
                  <FeedbackCard
                    key={category.title}
                    {...category}
                    onClick={() => setActiveTab('form')}
                    delay={index * 0.1}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                <FeedbackHistory />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">98%</h3>
              <p className="text-slate-600 dark:text-slate-400">User Satisfaction</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">24h</h3>
              <p className="text-slate-600 dark:text-slate-400">Average Response Time</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">500+</h3>
              <p className="text-slate-600 dark:text-slate-400">Features Implemented</p>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
