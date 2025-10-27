import data from '../data/leaderboard.json'
import { useMemo, useState } from 'react'
import { useGameStore } from '../store/gameStore.js'
import Card from '../components/Card.jsx'
import LeaderboardItem from '../components/LeaderboardItem.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO.jsx'
import { 
  Trophy, Crown, Medal, Star, Users, TrendingUp, 
  Filter, Search, Calendar, Award, Zap, Target
} from 'lucide-react'

export default function Leaderboard() {
  const { user, xp } = useGameStore()
  const [timeFilter, setTimeFilter] = useState('all') // all, week, month
  const [searchQuery, setSearchQuery] = useState('')
  
  const rows = useMemo(() => {
    const merged = data.filter(d => d.id !== user.id)
    merged.push({ id: user.id, name: user.name, xp })
    merged.sort((a, b) => b.xp - a.xp)
    return merged.map((u, i) => ({ rank: i + 1, ...u }))
  }, [user, xp])

  const filteredRows = useMemo(() => {
    return rows.filter(row => 
      row.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [rows, searchQuery])

  const yourRank = rows.find(r => r.id === user.id)?.rank
  const topThree = filteredRows.slice(0, 3)
  const otherPlayers = filteredRows.slice(3)

  return (
    <>
      <SEO title="Leaderboard" description="See how you rank globally on the AverSoltix leaderboard." />
      
      <section className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-yellow-200/20 dark:border-yellow-800/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                    <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Global Leaderboard
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Compete with learners worldwide
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {rows.length} Active Players
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Your Rank: #{yourRank}
                    </span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center lg:items-end gap-3"
              >
                <div className="px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-full border border-emerald-200/30 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-500" />
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center lg:text-right max-w-xs">
                  Your total experience points earned
                </p>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute top-4 right-8 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full"
            animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-8 left-12 w-8 h-8 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full"
            animate={{ y: [3, -3, 3], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
        
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {['all', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    timeFilter === period
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {period === 'all' ? 'All Time' : `This ${period}`}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Top Performers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((player, index) => {
              const podiumColors = {
                0: 'from-yellow-400 to-yellow-600', // Gold
                1: 'from-slate-400 to-slate-600',   // Silver  
                2: 'from-amber-600 to-amber-800'    // Bronze
              }
              
              const podiumIcons = {
                0: Crown,
                1: Medal, 
                2: Award
              }
              
              const Icon = podiumIcons[index] || Trophy
              
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative group ${
                    index === 0 ? 'md:-mt-4' : index === 1 ? 'md:mt-2' : 'md:mt-4'
                  }`}
                >
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${podiumColors[index]} rounded-full flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">
                        #{player.rank}
                      </div>
                      <h3 className={`font-bold text-lg mb-2 ${
                        player.id === user.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {player.name}
                        {player.id === user.id && (
                          <span className="ml-2 text-sm">(You)</span>
                        )}
                      </h3>
                      <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Zap className="h-4 w-4" />
                        <span className="font-bold text-lg">{player.xp.toLocaleString()}</span>
                        <span className="text-sm">XP</span>
                      </div>
                    </div>
                    
                    {index === 0 && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Star className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
        
        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-slate-500" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Full Rankings</h2>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredRows.map((player, index) => (
                <motion.div 
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    player.id === user.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-lg'
                      : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    player.rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-600 text-white' :
                    player.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    #{player.rank}
                  </div>
                  
                  <div className="flex-1">
                    <div className={`font-bold text-lg ${
                      player.id === user.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {player.name}
                      {player.id === user.id && (
                        <span className="ml-2 text-sm font-normal">(You)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Zap className="h-4 w-4" />
                      <span className="font-bold text-lg">{player.xp.toLocaleString()}</span>
                      <span className="text-sm">XP</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredRows.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No players found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search criteria
              </p>
            </motion.div>
          )}
        </motion.div>
      </section>
    </>
  )
}

