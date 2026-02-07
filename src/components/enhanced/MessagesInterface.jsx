import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Settings, 
  Users, 
  Phone, 
  Video,
  MoreVertical,
  ArrowLeft,
  Plus
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { useCommunityStore } from '../../store/communityStore'
import { usePresenceStore } from '../../store/presenceStore'
import { useToastStore } from '../../store/toastStore'

import Card, { CardHeader, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import MessageBubble from '../ui/MessageBubble'
import { 
  MessageSkeleton, 
  UserListSkeleton, 
  EmptyState, 
  ErrorState, 
  ConnectionStatus, 
  TypingIndicator 
} from '../ui/LoadingState'

import EmojiPicker from '../EmojiPicker'
import GroupSettingsDrawer from '../GroupSettingsDrawer'
import ProfileDrawer from '../ProfileDrawer'
import '../../styles/messages-groups.css'

const MessagesInterface = () => {
  const { currentUser, users } = useAuthStore()
  const { 
    dms, 
    groups, 
    friends, 
    friendRequests,
    loading,
    errors,
    connectionState,
    sendDM,
    editDM,
    deleteDM,
    reactToDM,
    listDMConversations,
    listGroupsForUser,
    markThreadRead,
    markGroupRead
  } = useCommunityStore()
  
  const { isOnline } = usePresenceStore()
  const pushToast = useToastStore(s => s.push)
  
  const [params, setParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('dms')
  const [activeChat, setActiveChat] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGroupSettings, setShowGroupSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const myId = currentUser?.id

  // Responsive design detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  // Handle URL parameters for deep linking
  useEffect(() => {
    const dmId = params.get('dm')
    const groupId = params.get('group')
    
    if (dmId) {
      setActiveTab('dms')
      setActiveChat({ type: 'dm', id: dmId })
    } else if (groupId) {
      setActiveTab('groups')
      setActiveChat({ type: 'group', id: groupId })
    }
  }, [params])

  // Derived data
  const dmConversations = useMemo(() => 
    myId ? listDMConversations(myId) : []
  , [myId, listDMConversations])

  const groupConversations = useMemo(() => 
    myId ? listGroupsForUser(myId) : []
  , [myId, listGroupsForUser])

  const activeMessages = useMemo(() => {
    if (!activeChat) return []
    
    if (activeChat.type === 'dm') {
      return dms[activeChat.id] || []
    } else if (activeChat.type === 'group') {
      return groups[activeChat.id]?.messages || []
    }
    
    return []
  }, [activeChat, dms, groups])

  const filteredConversations = useMemo(() => {
    const conversations = activeTab === 'dms' ? dmConversations : groupConversations
    
    // Ensure conversations is always an array
    const safeConversations = Array.isArray(conversations) ? conversations : []
    
    if (!searchQuery) return safeConversations
    
    return safeConversations.filter(conv => {
      const name = activeTab === 'dms' 
        ? users.find(u => u.id === conv.otherUserId)?.name || ''
        : conv.group?.name || ''
      
      return name.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [activeTab, dmConversations, groupConversations, searchQuery, users])

  // Event handlers
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() && attachments.length === 0) return
    if (!activeChat || !myId) return

    try {
      if (activeChat.type === 'dm') {
        await sendDM({
          fromUserId: myId,
          toUserId: activeChat.otherUserId,
          content: messageInput.trim(),
          attachments,
          replyTo: replyTo?.id
        })
      } else {
        // Handle group message sending
        // Implementation would go here
      }

      setMessageInput('')
      setAttachments([])
      setReplyTo(null)
      inputRef.current?.focus()
    } catch (error) {
      pushToast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'error'
      })
    }
  }, [messageInput, attachments, activeChat, myId, replyTo, sendDM, pushToast])

  const handleFileAttach = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: URL.createObjectURL(file)
    }))

    setAttachments(prev => [...prev, ...newAttachments])
  }, [])

  const handleEmojiSelect = useCallback((emoji) => {
    setMessageInput(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }, [])

  const handleMessageReact = useCallback(async (messageId, emoji) => {
    if (!activeChat) return

    try {
      if (activeChat.type === 'dm') {
        await reactToDM(messageId, emoji)
      }
      // Handle group reactions
    } catch (error) {
      pushToast({
        title: 'Failed to add reaction',
        description: error.message,
        variant: 'error'
      })
    }
  }, [activeChat, reactToDM, pushToast])

  const handleChatSelect = useCallback((chat) => {
    setActiveChat(chat)
    
    // Update URL
    const newParams = new URLSearchParams()
    if (chat.type === 'dm') {
      newParams.set('dm', chat.id)
    } else if (chat.type === 'group') {
      newParams.set('group', chat.id)
    }
    setParams(newParams)

    // Mark as read
    if (chat.type === 'dm') {
      markThreadRead({ threadId: chat.id, userId: myId })
    } else if (chat.type === 'group') {
      markGroupRead({ groupId: chat.id, userId: myId })
    }
  }, [setParams, markThreadRead, markGroupRead, myId])

  // Render conversation list
  const renderConversationList = () => (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            size="sm"
            className="bg-white/80 dark:bg-slate-900/80 border-2 border-slate-200/50 dark:border-slate-700/50 focus:border-emerald-500 shadow-lg"
          />
        </div>
      </motion.div>

      {/* Tab switcher */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 p-1.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-700/50"
      >
        {['dms', 'groups', 'friends'].map(tab => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              'flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300',
              activeTab === tab
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Connection status */}
      <ConnectionStatus status={connectionState} />

      {/* Conversation list */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {loading[activeTab] ? (
          <UserListSkeleton count={5} />
        ) : errors[activeTab] ? (
          <ErrorState
            title="Failed to load"
            description={errors[activeTab]}
            onRetry={() => window.location.reload()}
          />
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} yet`}
            description={`Start a conversation or join a group to get started.`}
          />
        ) : (
          filteredConversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeChat?.id === conv.id}
              onClick={() => handleChatSelect(conv)}
              users={users}
              isOnline={isOnline}
            />
          ))
        )}
      </div>
    </div>
  )

  // Render chat area
  const renderChatArea = () => {
    if (!activeChat) {
      return (
        <EmptyState
          title="Select a conversation"
          description="Choose a conversation from the sidebar to start messaging."
        />
      )
    }

    const isLoading = loading.messages[activeChat.id]
    const error = errors.messages[activeChat.id]

    return (
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            {isMobile && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveChat(null)}
                  icon={ArrowLeft}
                  className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                />
              </motion.div>
            )}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/50">
                  {activeChat.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-lg" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {activeChat.name}
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {activeChat.type === 'dm' ? 'Direct Message' : 'Group Chat'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" icon={Phone} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" icon={Video} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                icon={MoreVertical}
                onClick={() => setShowGroupSettings(true)}
                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent dark:via-slate-900/30 custom-scrollbar">
          {isLoading ? (
            <MessageSkeleton count={5} />
          ) : error ? (
            <ErrorState
              title="Failed to load messages"
              description={error}
              onRetry={() => window.location.reload()}
            />
          ) : activeMessages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Send the first message to start the conversation."
            />
          ) : (
            <>
              {activeMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.userId === myId}
                  showAvatar={message.userId !== activeMessages[index - 1]?.userId}
                  user={users.find(u => u.id === message.userId)}
                  onEdit={(msg) => setEditingMessage(msg)}
                  onDelete={(msg) => deleteDM(msg.id)}
                  onReply={(msg) => setReplyTo(msg)}
                  onReact={handleMessageReact}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Typing indicator */}
        <TypingIndicator users={[]} />

        {/* Message input */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 sm:p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl"
        >
          {replyTo && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-between shadow-sm"
            >
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                Replying to: {replyTo.content?.slice(0, 50)}...
              </span>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setReplyTo(null)}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  ✕
                </Button>
              </motion.div>
            </motion.div>
          )}

          <div className="flex items-end gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                icon={Paperclip}
                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400"
              />
            </motion.div>
            
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                multiline
                className="bg-white/80 dark:bg-slate-900/80 border-2 border-slate-200/50 dark:border-slate-700/50 focus:border-emerald-500 shadow-lg rounded-2xl"
              />
            </div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(true)}
                icon={Smile}
                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400"
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() && attachments.length === 0}
                icon={Send}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-emerald-50/20 to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={clsx(
          'border-r border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl',
          isMobile ? (activeChat ? 'hidden' : 'w-full') : 'w-80 flex-shrink-0'
        )}
      >
        <div className="p-4 sm:p-6 h-full overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Messages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Connect with your community
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                icon={Plus}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg"
              />
            </motion.div>
          </div>
          
          {renderConversationList()}
        </div>
      </motion.div>

      {/* Main chat area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={clsx(
          'flex-1 flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-2xl',
          isMobile && !activeChat && 'hidden'
        )}
      >
        {renderChatArea()}
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileAttach}
        className="hidden"
      />

      {/* Modals */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
      />

      <GroupSettingsDrawer
        isOpen={showGroupSettings}
        onClose={() => setShowGroupSettings(false)}
        group={activeChat?.type === 'group' ? activeChat : null}
      />

      <ProfileDrawer
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={activeChat?.type === 'dm' ? users.find(u => u.id === activeChat.otherUserId) : null}
      />
    </div>
  )
}

// Conversation item component
const ConversationItem = ({ conversation, isActive, onClick, users, isOnline }) => {
  const user = conversation.type === 'dm' 
    ? users.find(u => u.id === conversation.otherUserId)
    : null

  const name = conversation.type === 'dm' 
    ? user?.name || 'Unknown User'
    : conversation.group?.name || 'Unknown Group'

  const lastMessage = conversation.lastMessage
  const unreadCount = conversation.unread || 0

  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl text-left transition-all duration-300',
        isActive 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/20'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
      )}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/50"
        >
          {name[0]?.toUpperCase() || '?'}
        </motion.div>
        {conversation.type === 'dm' && isOnline(conversation.otherUserId) && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-lg" 
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {name}
          </h4>
          {lastMessage && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(lastMessage.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
            {lastMessage?.content || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full min-w-[1.25rem] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

export default MessagesInterface
