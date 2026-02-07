import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  Search, 
  Plus, 
  Users, 
  Lock, 
  Globe, 
  Star, 
  TrendingUp,
  Filter,
  Grid,
  List,
  Settings,
  UserPlus,
  MessageCircle
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { useCommunityStore } from '../../store/communityStore'
import { useToastStore } from '../../store/toastStore'

import Card, { CardHeader, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { 
  UserListSkeleton, 
  EmptyState, 
  ErrorState 
} from '../ui/LoadingState'

import Modal from '../Modal'
import GroupSettingsDrawer from '../GroupSettingsDrawer'
import '../../styles/messages-groups.css'

const GroupsInterface = () => {
  const { currentUser } = useAuthStore()
  const { 
    groups, 
    loading, 
    errors,
    createGroup,
    joinGroup,
    leaveGroup,
    searchGroups
  } = useCommunityStore()
  
  const pushToast = useToastStore(s => s.push)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGroupSettings, setShowGroupSettings] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [sortBy, setSortBy] = useState('activity') // 'activity' | 'members' | 'recent'
  
  const myId = currentUser?.id

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Groups', icon: Globe },
    { id: 'my-groups', label: 'My Groups', icon: Users },
    { id: 'public', label: 'Public', icon: Globe },
    { id: 'private', label: 'Private', icon: Lock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'featured', label: 'Featured', icon: Star }
  ]

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    let filtered = [...groups]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    switch (selectedCategory) {
      case 'my-groups':
        filtered = filtered.filter(group => group.members?.includes(myId))
        break
      case 'public':
        filtered = filtered.filter(group => !group.isPrivate)
        break
      case 'private':
        filtered = filtered.filter(group => group.isPrivate)
        break
      case 'trending':
        filtered = filtered.filter(group => group.activityScore > 7)
        break
      case 'featured':
        filtered = filtered.filter(group => group.featured)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'activity':
        filtered.sort((a, b) => (b.activityScore || 0) - (a.activityScore || 0))
        break
      case 'members':
        filtered.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
        break
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    return filtered
  }, [groups, searchQuery, selectedCategory, sortBy, myId])

  // Handle group actions
  const handleJoinGroup = async (groupId) => {
    if (!myId) return

    try {
      await joinGroup({ groupId, userId: myId })
      pushToast({
        title: 'Joined group successfully',
        variant: 'success'
      })
    } catch (error) {
      pushToast({
        title: 'Failed to join group',
        description: error.message,
        variant: 'error'
      })
    }
  }

  const handleLeaveGroup = async (groupId) => {
    if (!myId) return

    try {
      await leaveGroup({ groupId, userId: myId })
      pushToast({
        title: 'Left group successfully',
        variant: 'success'
      })
    } catch (error) {
      pushToast({
        title: 'Failed to leave group',
        description: error.message,
        variant: 'error'
      })
    }
  }

  const handleCreateGroup = async (groupData) => {
    if (!myId) return

    try {
      await createGroup({
        ...groupData,
        createdBy: myId
      })
      
      setShowCreateModal(false)
      pushToast({
        title: 'Group created successfully',
        variant: 'success'
      })
    } catch (error) {
      pushToast({
        title: 'Failed to create group',
        description: error.message,
        variant: 'error'
      })
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 -m-6 sm:-m-8 p-6 sm:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent"
          >
            Groups
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base"
          >
            Discover and join communities around your interests
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={Plus}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50 font-semibold"
          >
            Create Group
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="activity">Most Active</option>
                <option value="members">Most Members</option>
                <option value="recent">Recently Created</option>
              </select>
              
              <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    'p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm',
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
                      : 'bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Groups list */}
      {loading.groups ? (
        <UserListSkeleton count={6} />
      ) : errors.groups ? (
        <ErrorState
          title="Failed to load groups"
          description={errors.groups}
          onRetry={() => window.location.reload()}
        />
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          title="No groups found"
          description={searchQuery ? "Try adjusting your search or filters." : "Be the first to create a group!"}
          action={
            <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
              Create Group
            </Button>
          }
        />
      ) : (
        <div className={clsx(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              viewMode={viewMode}
              isJoined={group.members?.includes(myId)}
              onJoin={() => handleJoinGroup(group.id)}
              onLeave={() => handleLeaveGroup(group.id)}
              onSettings={() => {
                setSelectedGroup(group)
                setShowGroupSettings(true)
              }}
              myId={myId}
            />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />

      {/* Group Settings Drawer */}
      <GroupSettingsDrawer
        isOpen={showGroupSettings}
        onClose={() => setShowGroupSettings(false)}
        group={selectedGroup}
      />
    </div>
  )
}

// Group Card Component
const GroupCard = ({ 
  group, 
  viewMode, 
  isJoined, 
  onJoin, 
  onLeave, 
  onSettings, 
  myId 
}) => {
  const isOwner = group.createdBy === myId
  const memberCount = group.members?.length || 0

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4, scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <Card hover className="p-4 sm:p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {group.name[0]?.toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {group.name}
              </h3>
              {group.isPrivate && <Lock className="h-4 w-4 text-slate-400" />}
              {group.featured && <Star className="h-4 w-4 text-yellow-500" />}
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
              {group.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {memberCount} members
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Activity: {group.activityScore || 0}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettings}
                  icon={Settings}
                  className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                />
              </motion.div>
            )}
            
            {isJoined ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLeave}
                  className="border-2 border-slate-300 dark:border-slate-600 hover:border-red-400 hover:text-red-600"
                >
                  Leave
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  onClick={onJoin}
                  icon={UserPlus}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50"
                >
                  Join
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="aspect-video bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 flex items-center justify-center relative overflow-hidden">
          <motion.div 
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ backgroundSize: '200% 100%' }}
          />
          <div className="text-5xl font-bold text-white drop-shadow-lg relative z-10">
            {group.name[0]?.toUpperCase()}
          </div>
        </div>
      
      <CardContent>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {group.name}
          </h3>
          <div className="flex gap-1">
            {group.isPrivate && <Lock className="h-4 w-4 text-slate-400" />}
            {group.featured && <Star className="h-4 w-4 text-yellow-500" />}
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
          {group.description}
        </p>
        
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {group.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 rounded-md"
              >
                {tag}
              </span>
            ))}
            {group.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 rounded-md">
                +{group.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {memberCount} members
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {group.activityScore || 0}
          </span>
        </div>
        
        <div className="flex gap-2">
          {isJoined ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={onLeave}
                  className="border-2 border-slate-300 dark:border-slate-600 hover:border-red-400 hover:text-red-600"
                >
                  Leave
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  size="sm"
                  fullWidth
                  icon={MessageCircle}
                  onClick={() => {
                    // Navigate to group chat
                    window.location.href = `/messages?group=${group.id}`
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50"
                >
                  Chat
                </Button>
              </motion.div>
            </>
          ) : (
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Button
                size="sm"
                fullWidth
                onClick={onJoin}
                icon={UserPlus}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50 font-semibold"
              >
                Join Group
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}

// Create Group Modal Component
const CreateGroupModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    tags: []
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    onSubmit(formData)
    setFormData({ name: '', description: '', isPrivate: false, tags: [] })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter group name..."
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your group..."
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" onClick={addTag} size="sm">
              Add
            </Button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-sm rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="isPrivate" className="text-sm text-slate-700 dark:text-slate-300">
            Make this group private
          </label>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default GroupsInterface
