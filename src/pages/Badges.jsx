import badgesData from '../data/badges.json'
import { useGameStore } from '../store/gameStore.js'
import { useAuthStore } from '../store/authStore.js'
import Card from '../components/Card.jsx'
import BadgeComp from '../components/Badge.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import { useState, useMemo } from 'react'
import { 
  Award, Filter, Search, Trophy, Star, Target, 
  Zap, Flame, Leaf, BookOpen, Users, Calendar,
  Crown, Medal, Shield, Sparkles, CheckCircle2
} from 'lucide-react'

export default function Badges() {
  const { badges } = useGameStore()
  const { currentUser } = useAuthStore(s => ({ currentUser: s.currentUser }))
  const [filter, setFilter] = useState('all') // all, earned, available
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all') // all, learning, streaks, achievements, social
  
  // Badge categories with icons and colors
  const badgeCategories = {
    learning: { icon: BookOpen, label: 'Learning', color: 'emerald' },
    streaks: { icon: Flame, label: 'Streaks', color: 'orange' },
    achievements: { icon: Trophy, label: 'Achievements', color: 'yellow' },
    social: { icon: Users, label: 'Social', color: 'blue' },
    special: { icon: Crown, label: 'Special', color: 'purple' }
  }
  
  // Categorize badges (you can enhance this based on badge data structure)
  const categorizedBadges = useMemo(() => {
    return badgesData.reduce((acc, badge) => {
      // Determine category based on badge name/description (enhance this logic)
      let category = 'achievements'
      if (badge.name.toLowerCase().includes('streak') || badge.description.toLowerCase().includes('consecutive')) {
        category = 'streaks'
      } else if (badge.name.toLowerCase().includes('learn') || badge.name.toLowerCase().includes('quiz')) {
        category = 'learning'
      } else if (badge.name.toLowerCase().includes('community') || badge.name.toLowerCase().includes('share')) {
        category = 'social'
      } else if (badge.name.toLowerCase().includes('master') || badge.name.toLowerCase().includes('legend')) {
        category = 'special'
      }
      
      if (!acc[category]) acc[category] = []
      acc[category].push({ ...badge, category })
      return acc
    }, {})
  }, [])
  
  const filteredBadges = useMemo(() => {
    let filtered = badgesData.map(badge => {
      // Add category info
      const category = Object.entries(categorizedBadges).find(([_, badges]) => 
        badges.some(b => b.id === badge.id)
      )?.[0] || 'achievements'
      return { ...badge, category }
    })
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === selectedCategory)
    }
    
    // Apply search filter
    filtered = filtered.filter(badge => {
      const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           badge.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    
    // Apply earned/available filter
    if (filter === 'earned') filtered = filtered.filter(badge => badges.includes(badge.id))
    if (filter === 'available') filtered = filtered.filter(badge => !badges.includes(badge.id))
    
    return filtered
  }, [badges, searchTerm, filter, selectedCategory, categorizedBadges])
  
  const earnedCount = badgesData.filter(b => badges.includes(b.id)).length
  const availableCount = badgesData.length - earnedCount
  const completionPercentage = Math.round((earnedCount / badgesData.length) * 100)
  
  return (
    <>
      <SEO title="Badges" description="Browse badges and rewards you can earn by completing eco challenges and keeping streaks." />
      
      <section className="space-y-8">
        {/* Enhanced Header Section */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-3xl p-8 border border-amber-200/20 dark:border-amber-800/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        Badge Collection
                      </h1>
                      <div className="flex items-center gap-2 mt-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Achievements & Rewards
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {earnedCount}
                      </div>
                      <div className="text-sm text-slate-500">Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                        {availableCount}
                      </div>
                      <div className="text-sm text-slate-500">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {completionPercentage}%
                      </div>
                      <div className="text-sm text-slate-500">Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Object.keys(badgeCategories).length}
                      </div>
                      <div className="text-sm text-slate-500">Categories</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
                      <span className="text-2xl font-black text-white">{completionPercentage}%</span>
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    Your collection progress
                  </p>
                </motion.div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden backdrop-blur">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>0 badges</span>
                  <span>{badgesData.length} badges</span>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute top-4 right-8 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full"
              animate={{ y: [-3, 3, -3], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-6 left-12 w-8 h-8 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full"
              animate={{ y: [2, -2, 2], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </motion.div>
        )}
        
        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Browse Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedCategory === 'all'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  selectedCategory === 'all' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  <Star className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">All</span>
                <span className="text-xs text-slate-500">{badgesData.length}</span>
              </div>
            </motion.button>
            
            {Object.entries(badgeCategories).map(([key, category]) => {
              const count = categorizedBadges[key]?.length || 0
              const Icon = category.icon
              const isSelected = selectedCategory === key
              
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(key)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `border-${category.color}-500 bg-${category.color}-50 dark:bg-${category.color}-900/20`
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? `bg-${category.color}-500 text-white`
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-xs text-slate-500">{count}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
          
          {/* Enhanced Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === 'all'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
                }`}
              >
                <Shield className="h-4 w-4" />
                All ({badgesData.length})
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('earned')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === 'earned'
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Earned ({earnedCount})
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === 'available'
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-900/20'
                }`}
              >
                <Target className="h-4 w-4" />
                Available ({availableCount})
              </motion.button>
            </div>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Enhanced Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-slate-500" />
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                {selectedCategory === 'all' ? 'All Badges' : badgeCategories[selectedCategory]?.label + ' Badges'}
              </h2>
            </div>
            <div className="text-sm text-slate-500">
              {filteredBadges.length} {filteredBadges.length === 1 ? 'badge' : 'badges'}
            </div>
          </div>
          
          <AnimatePresence mode="popLayout">
            {filteredBadges.length > 0 ? (
              <motion.div
                key="badges-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredBadges.map((badge, index) => {
                  const isEarned = badges.includes(badge.id)
                  const categoryInfo = badgeCategories[badge.category] || badgeCategories.achievements
                  
                  return (
                    <motion.div
                      key={badge.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ 
                        delay: index * 0.05, 
                        duration: 0.4,
                        type: "spring",
                        stiffness: 150
                      }}
                      whileHover={{ y: -8, scale: 1.05 }}
                      className={`relative group cursor-pointer ${
                        isEarned ? 'z-10' : 'z-0'
                      }`}
                    >
                      <div className={`relative p-6 rounded-2xl border-2 transition-all duration-500 ${
                        isEarned 
                          ? `border-${categoryInfo.color}-400 bg-gradient-to-br from-${categoryInfo.color}-50 to-white dark:from-${categoryInfo.color}-900/20 dark:to-slate-800/50 shadow-lg shadow-${categoryInfo.color}-500/20`
                          : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 group-hover:border-slate-300 dark:group-hover:border-slate-600'
                      } backdrop-blur-xl`}>
                        
                        {/* Badge Icon/Image */}
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                          isEarned 
                            ? `bg-gradient-to-br from-${categoryInfo.color}-400 to-${categoryInfo.color}-600 text-white shadow-lg`
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                        }`}>
                          {isEarned ? '🏆' : '🔒'}
                        </div>
                        
                        {/* Badge Info */}
                        <div className="text-center space-y-2">
                          <h3 className={`font-bold text-lg ${
                            isEarned 
                              ? 'text-slate-800 dark:text-white'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {badge.name}
                          </h3>
                          
                          <p className={`text-sm leading-relaxed ${
                            isEarned 
                              ? 'text-slate-600 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {badge.description}
                          </p>
                          
                          {/* Category Tag */}
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            isEarned 
                              ? `bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30 text-${categoryInfo.color}-700 dark:text-${categoryInfo.color}-300`
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            <categoryInfo.icon className="h-3 w-3" />
                            {categoryInfo.label}
                          </div>
                        </div>
                        
                        {/* Earned Badge Indicator */}
                        {isEarned && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-${categoryInfo.color}-400 to-${categoryInfo.color}-600 rounded-full flex items-center justify-center text-white shadow-lg`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.div>
                        )}
                        
                        {/* Sparkle Effect for Earned Badges */}
                        {isEarned && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          >
                            <Sparkles className="absolute top-2 right-2 h-4 w-4 text-yellow-400" />
                            <Sparkles className="absolute bottom-2 left-2 h-3 w-3 text-yellow-400" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                key="no-badges"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <div className="text-8xl mb-6">🏆</div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">
                  No badges found
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm ? 
                    `No badges match "${searchTerm}". Try adjusting your search or browse different categories.` :
                    filter === 'earned' ?
                      "You haven't earned any badges yet. Complete challenges and quizzes to start your collection!" :
                      selectedCategory !== 'all' ?
                        `No ${badgeCategories[selectedCategory]?.label.toLowerCase()} badges available yet.` :
                        'All badges have been earned. Congratulations on your amazing achievement!'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchTerm('')}
                      className="btn-outline px-6 py-3 flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Clear Search
                    </motion.button>
                  )}
                  
                  {selectedCategory !== 'all' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory('all')}
                      className="btn-primary px-6 py-3 flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      View All Categories
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  )
}

