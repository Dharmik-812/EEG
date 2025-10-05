// Enhanced Push Notifications System
class NotificationManager {
  constructor() {
    this.permission = 'default'
    this.isSupported = 'Notification' in window
    this.serviceWorkerRegistration = null
    this.subscriptions = new Map()
    this.queue = []
    this.isInitialized = false
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser')
      return false
    }

    try {
      // Register service worker only in production. In development, proactively
      // unregister any existing SW and clear caches to avoid stale assets.
      if ('serviceWorker' in navigator) {
        if (import.meta?.env?.PROD) {
          this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registered successfully')
        } else if (import.meta?.env?.DEV) {
          try {
            const regs = await navigator.serviceWorker.getRegistrations()
            for (const r of regs) await r.unregister()
          } catch {}
          try {
            if ('caches' in window) {
              const keys = await caches.keys()
              await Promise.all(keys.map((k) => caches.delete(k)))
            }
          } catch {}
        }
      }

      // Check current permission
      this.permission = Notification.permission
      this.isInitialized = true

      // Process any queued notifications
      this.processQueue()

      return true
    } catch (error) {
      console.error('Failed to initialize notifications:', error)
      return false
    }
  }

  async requestPermission() {
    if (!this.isSupported) return false

    try {
      this.permission = await Notification.requestPermission()
      return this.permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  async showNotification(options) {
    const {
      title,
      body,
      icon = '/vite.svg',
      badge = '/vite.svg',
      tag,
      data = {},
      actions = [],
      requireInteraction = false,
      silent = false,
      timestamp = Date.now(),
      vibrate = [200, 100, 200],
      onClick,
      onClose,
      onError,
      onShow
    } = options

    // Queue notification if not initialized
    if (!this.isInitialized) {
      this.queue.push(options)
      return null
    }

    // Check permission
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        console.warn('Notification permission denied')
        return null
      }
    }

    try {
      let notification

      // Use service worker for better reliability if available
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(title, {
          body,
          icon,
          badge,
          tag,
          data: { ...data, timestamp, clickAction: onClick ? 'click' : null },
          actions,
          requireInteraction,
          silent,
          timestamp,
          vibrate
        })
        
        // Get the notification reference
        const notifications = await this.serviceWorkerRegistration.getNotifications({ tag })
        notification = notifications[notifications.length - 1]
      } else {
        // Fallback to regular notification
        notification = new Notification(title, {
          body,
          icon,
          tag,
          data,
          requireInteraction,
          silent,
          timestamp,
          vibrate
        })
      }

      // Set up event listeners
      if (notification) {
        if (onClick) {
          notification.onclick = (event) => {
            event.preventDefault()
            onClick(event, notification)
            notification.close()
          }
        }

        if (onClose) {
          notification.onclose = (event) => onClose(event, notification)
        }

        if (onError) {
          notification.onerror = (event) => onError(event, notification)
        }

        if (onShow) {
          notification.onshow = (event) => onShow(event, notification)
        }

        // Auto-close after 10 seconds if not requiring interaction
        if (!requireInteraction) {
          setTimeout(() => {
            try {
              notification.close()
            } catch (e) {
              // Notification might already be closed
            }
          }, 10000)
        }
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      if (onError) onError(error)
      return null
    }
  }

  processQueue() {
    while (this.queue.length > 0) {
      const options = this.queue.shift()
      this.showNotification(options)
    }
  }

  // Predefined notification types
  async showMessageNotification({ sender, message, threadId, isGroup = false }) {
    return this.showNotification({
      title: isGroup ? `New message in ${sender.groupName}` : `New message from ${sender.name}`,
      body: message.length > 100 ? message.slice(0, 100) + '...' : message,
      icon: sender.avatar || '/vite.svg',
      tag: `message-${threadId}`,
      data: { type: 'message', threadId, senderId: sender.id, isGroup },
      actions: [
        { action: 'reply', title: 'Reply', icon: '/icons/reply.png' },
        { action: 'view', title: 'View', icon: '/icons/view.png' }
      ],
      onClick: () => {
        window.focus()
        if (isGroup) {
          window.location.href = `/messages?group=${threadId}`
        } else {
          window.location.href = `/messages?dm=${threadId}`
        }
      }
    })
  }

  async showFriendRequestNotification({ sender }) {
    return this.showNotification({
      title: 'New Friend Request',
      body: `${sender.name} wants to be your friend`,
      icon: sender.avatar || '/vite.svg',
      tag: `friend-request-${sender.id}`,
      data: { type: 'friend-request', senderId: sender.id },
      actions: [
        { action: 'accept', title: 'Accept', icon: '/icons/accept.png' },
        { action: 'decline', title: 'Decline', icon: '/icons/decline.png' }
      ],
      onClick: () => {
        window.focus()
        window.location.href = '/messages?tab=friends'
      }
    })
  }

  async showGroupInviteNotification({ group, inviter }) {
    return this.showNotification({
      title: 'Group Invitation',
      body: `${inviter.name} invited you to join ${group.name}`,
      icon: group.avatar || '/vite.svg',
      tag: `group-invite-${group.id}`,
      data: { type: 'group-invite', groupId: group.id, inviterId: inviter.id },
      actions: [
        { action: 'join', title: 'Join', icon: '/icons/join.png' },
        { action: 'decline', title: 'Decline', icon: '/icons/decline.png' }
      ],
      onClick: () => {
        window.focus()
        window.location.href = `/groups?invite=${group.id}`
      }
    })
  }

  async showSystemNotification({ title, message, type = 'info', urgent = false }) {
    return this.showNotification({
      title,
      body: message,
      icon: '/vite.svg',
      tag: `system-${type}-${Date.now()}`,
      data: { type: 'system', systemType: type },
      requireInteraction: urgent,
      onClick: () => {
        window.focus()
        window.location.href = '/dashboard'
      }
    })
  }

  // Batch notifications to avoid spam
  async showBatchNotification({ type, items, maxShow = 3 }) {
    if (items.length === 0) return null

    if (items.length === 1) {
      // Show single notification
      const item = items[0]
      switch (type) {
        case 'messages':
          return this.showMessageNotification(item)
        case 'friend-requests':
          return this.showFriendRequestNotification(item)
        case 'group-invites':
          return this.showGroupInviteNotification(item)
      }
    } else {
      // Show batch notification
      const count = items.length
      const shown = Math.min(count, maxShow)
      const remaining = count - shown

      let title, body
      switch (type) {
        case 'messages':
          title = `${count} new messages`
          body = shown === 1 
            ? `From ${items[0].sender.name}`
            : `From ${items.slice(0, shown).map(i => i.sender.name).join(', ')}${remaining > 0 ? ` and ${remaining} others` : ''}`
          break
        case 'friend-requests':
          title = `${count} new friend requests`
          body = shown === 1
            ? `From ${items[0].sender.name}`
            : `From ${items.slice(0, shown).map(i => i.sender.name).join(', ')}${remaining > 0 ? ` and ${remaining} others` : ''}`
          break
        case 'group-invites':
          title = `${count} new group invitations`
          body = shown === 1
            ? `To ${items[0].group.name}`
            : `To ${items.slice(0, shown).map(i => i.group.name).join(', ')}${remaining > 0 ? ` and ${remaining} others` : ''}`
          break
      }

      return this.showNotification({
        title,
        body,
        icon: '/vite.svg',
        tag: `batch-${type}`,
        data: { type: 'batch', batchType: type, items },
        onClick: () => {
          window.focus()
          switch (type) {
            case 'messages':
              window.location.href = '/messages'
              break
            case 'friend-requests':
              window.location.href = '/messages?tab=friends'
              break
            case 'group-invites':
              window.location.href = '/groups'
              break
          }
        }
      })
    }
  }

  // Clear notifications by tag
  async clearNotifications(tag) {
    if (this.serviceWorkerRegistration) {
      const notifications = await this.serviceWorkerRegistration.getNotifications({ tag })
      notifications.forEach(notification => notification.close())
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (this.serviceWorkerRegistration) {
      const notifications = await this.serviceWorkerRegistration.getNotifications()
      notifications.forEach(notification => notification.close())
    }
  }

  // Check if notifications are enabled
  isEnabled() {
    return this.isSupported && this.permission === 'granted'
  }

  // Get notification settings
  getSettings() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isEnabled()
    }
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager()

// Initialize on module load
if (typeof window !== 'undefined') {
  notificationManager.initialize()
}

// Service Worker message handler for notification actions
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, data } = event.data || {}
    
    switch (type) {
      case 'notification-click':
        handleNotificationClick(data)
        break
      case 'notification-action':
        handleNotificationAction(data)
        break
    }
  })
}

function handleNotificationClick(data) {
  const { notificationData } = data
  
  // Focus window
  if (window.focus) window.focus()
  
  // Navigate based on notification type
  switch (notificationData.type) {
    case 'message':
      if (notificationData.isGroup) {
        window.location.href = `/messages?group=${notificationData.threadId}`
      } else {
        window.location.href = `/messages?dm=${notificationData.threadId}`
      }
      break
    case 'friend-request':
      window.location.href = '/messages?tab=friends'
      break
    case 'group-invite':
      window.location.href = `/groups?invite=${notificationData.groupId}`
      break
    case 'system':
      window.location.href = '/dashboard'
      break
    case 'batch':
      switch (notificationData.batchType) {
        case 'messages':
          window.location.href = '/messages'
          break
        case 'friend-requests':
          window.location.href = '/messages?tab=friends'
          break
        case 'group-invites':
          window.location.href = '/groups'
          break
      }
      break
  }
}

function handleNotificationAction(data) {
  const { action, notificationData } = data
  
  // Handle specific actions
  switch (action) {
    case 'reply':
      window.focus()
      if (notificationData.isGroup) {
        window.location.href = `/messages?group=${notificationData.threadId}&reply=true`
      } else {
        window.location.href = `/messages?dm=${notificationData.threadId}&reply=true`
      }
      break
    case 'view':
      handleNotificationClick(data)
      break
    case 'accept':
      // Handle friend request or group invite acceptance
      if (notificationData.type === 'friend-request') {
        // Trigger friend request acceptance
        window.dispatchEvent(new CustomEvent('accept-friend-request', {
          detail: { senderId: notificationData.senderId }
        }))
      } else if (notificationData.type === 'group-invite') {
        // Trigger group invite acceptance
        window.dispatchEvent(new CustomEvent('accept-group-invite', {
          detail: { groupId: notificationData.groupId }
        }))
      }
      break
    case 'decline':
      // Handle friend request or group invite decline
      if (notificationData.type === 'friend-request') {
        window.dispatchEvent(new CustomEvent('decline-friend-request', {
          detail: { senderId: notificationData.senderId }
        }))
      } else if (notificationData.type === 'group-invite') {
        window.dispatchEvent(new CustomEvent('decline-group-invite', {
          detail: { groupId: notificationData.groupId }
        }))
      }
      break
    case 'join':
      window.focus()
      window.location.href = `/groups?join=${notificationData.groupId}`
      break
  }
}

export default notificationManager
