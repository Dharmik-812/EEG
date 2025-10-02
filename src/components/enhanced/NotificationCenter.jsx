import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  MessageCircle, 
  Users, 
  UserPlus, 
  Star, 
  Settings,
  Filter,
  MoreHorizontal,
  Archive,
  Trash2
} from 'lucide-react'

import { notificationManager } from '../../lib/notifications'
import { useAuthStore } from '../../store/authStore'
import { useCommunityStore } from '../../store/communityStore'
import { useToastStore } from '../../store/toastStore'

import Button from '../ui/Button'
import { EmptyState } from '../ui/LoadingState'

const NotificationCenter = ({ isOpen, onClose, anchorEl }) => {
  const { currentUser } = useAuthStore()
  const { markNotificationRead, markAllNotificationsRead } = useCommunityStore()
  const pushToast = useToastStore(s => s.push)
  
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'messages', 'social'
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  const panelRef = useRef(null)

  // Mock notifications data - replace with real data from your store
  const mockNotifications = [
    {
      id: 'notif-1',
      type: 'message',
      title: 'New message from Sarah',
      content: 'Hey! Are you free for a quick call?',
      timestamp: Date.now() - 5 * 60 * 1000,
      isRead: false,
      avatar: null,
      data: { threadId: 'thread-1', senderId: 'user-2' }
    },
    {
      id: 'notif-2',
      type: 'friend-request',
      title: 'Friend request',
      content: 'Alex wants to be your friend',
      timestamp: Date.now() - 30 * 60 * 1000,
      isRead: false,
      avatar: null,
      data: { senderId: 'user-3' }
    },
    {
      id: 'notif-3',
      type: 'group-invite',
      title: 'Group invitation',
      content: 'You were invited to join "Climate Action"',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      isRead: true,
      avatar: null,
      data: { groupId: 'group-1' }
    },
    {
      id: 'notif-4',
      type: 'system',
      title: 'Welcome to EEG!',
      content: 'Complete your profile to get started',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      isRead: true,
      avatar: null,
      data: {}
    }
  ]

  // Load notifications
  useEffect(() => {
    if (isOpen) {
      setNotifications(mockNotifications)
    }
  }, [isOpen])

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'messages':
        return notification.type === 'message'
      case 'social':
        return ['friend-request', 'group-invite'].includes(notification.type)
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await markNotificationRead(notification.id)
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        )
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'message':
          window.location.href = `/messages?dm=${notification.data.threadId}`
          break
        case 'friend-request':
          window.location.href = '/messages?tab=friends'
          break
        case 'group-invite':
          window.location.href = `/groups?invite=${notification.data.groupId}`
          break
        case 'system':
          window.location.href = '/dashboard'
          break
      }

      onClose()
    } catch (error) {
      pushToast({
        title: 'Error',
        description: 'Failed to open notification',
        variant: 'error'
      })
    }
  }

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      pushToast({
        title: 'Success',
        description: 'All notifications marked as read',
        variant: 'success'
      })
    } catch (error) {
      pushToast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'error'
      })
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    const selectedIds = Array.from(selectedNotifications)
    
    try {
      switch (action) {
        case 'mark-read':
          // Mark selected as read
          setNotifications(prev => 
            prev.map(n => selectedIds.includes(n.id) ? { ...n, isRead: true } : n)
          )
          break
        case 'delete':
          // Delete selected
          setNotifications(prev => 
            prev.filter(n => !selectedIds.includes(n.id))
          )
          break
        case 'archive':
          // Archive selected (implementation depends on your data model)
          break
      }
      
      setSelectedNotifications(new Set())
      setShowBulkActions(false)
      
      pushToast({
        title: 'Success',
        description: `${selectedIds.length} notifications updated`,
        variant: 'success'
      })
    } catch (error) {
      pushToast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'error'
      })
    }
  }

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return MessageCircle
      case 'friend-request':
        return UserPlus
      case 'group-invite':
        return Users
      case 'system':
        return Star
      default:
        return Bell
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60 * 1000) {
      return 'Just now'
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}m ago`
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}h ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 max-h-[80vh] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Notifications
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={X}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'messages', label: 'Messages' },
            { id: 'social', label: 'Social' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                filter === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              {tab.label}
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-700 text-emerald-100 text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selectedNotifications.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 flex items-center gap-2 overflow-hidden"
            >
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedNotifications.size} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('mark-read')}
                icon={Check}
                className="text-xs"
              >
                Mark read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                icon={Trash2}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No notifications"
              description={filter === 'unread' ? "You're all caught up!" : "No notifications to show"}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredNotifications.map(notification => {
              const Icon = getNotificationIcon(notification.type)
              const isSelected = selectedNotifications.has(notification.id)
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={clsx(
                    'p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer relative',
                    !notification.isRead && 'bg-emerald-50/30 dark:bg-emerald-900/10',
                    isSelected && 'bg-emerald-100 dark:bg-emerald-900/20'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleNotificationSelection(notification.id)
                      }}
                      className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />

                    {/* Icon */}
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      notification.type === 'message' && 'bg-blue-100 dark:bg-blue-900/20',
                      notification.type === 'friend-request' && 'bg-green-100 dark:bg-green-900/20',
                      notification.type === 'group-invite' && 'bg-purple-100 dark:bg-purple-900/20',
                      notification.type === 'system' && 'bg-orange-100 dark:bg-orange-900/20'
                    )}>
                      <Icon className={clsx(
                        'h-4 w-4',
                        notification.type === 'message' && 'text-blue-600 dark:text-blue-400',
                        notification.type === 'friend-request' && 'text-green-600 dark:text-green-400',
                        notification.type === 'group-invite' && 'text-purple-600 dark:text-purple-400',
                        notification.type === 'system' && 'text-orange-600 dark:text-orange-400'
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.content}
                      </p>

                      {/* Action buttons for specific notification types */}
                      {notification.type === 'friend-request' && !notification.isRead && (
                        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="xs" variant="primary">
                            Accept
                          </Button>
                          <Button size="xs" variant="outline">
                            Decline
                          </Button>
                        </div>
                      )}

                      {notification.type === 'group-invite' && !notification.isRead && (
                        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="xs" variant="primary">
                            Join
                          </Button>
                          <Button size="xs" variant="outline">
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => window.location.href = '/notifications'}
            className="text-emerald-600 hover:text-emerald-700"
          >
            View all notifications
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default NotificationCenter
