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
    
    if (!searchQuery) return conversations
    
    return conversations.filter(conv => {
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
    <div className="space-y-2">
      {/* Search */}
      <Input
        placeholder={`Search ${activeTab}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={Search}
        size="sm"
      />

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {['dms', 'groups', 'friends'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all',
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Connection status */}
      <ConnectionStatus status={connectionState} />

      {/* Conversation list */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
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
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveChat(null)}
                icon={ArrowLeft}
              />
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-medium">
                {activeChat.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeChat.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {activeChat.type === 'dm' ? 'Direct Message' : 'Group Chat'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={Phone} />
            <Button variant="ghost" size="sm" icon={Video} />
            <Button 
              variant="ghost" 
              size="sm" 
              icon={MoreVertical}
              onClick={() => setShowGroupSettings(true)}
            />
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {replyTo && (
            <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Replying to: {replyTo.content?.slice(0, 50)}...
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setReplyTo(null)}
              >
                ✕
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={Paperclip}
            />
            
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
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(true)}
              icon={Smile}
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() && attachments.length === 0}
              icon={Send}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className={clsx(
        'border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
        isMobile ? (activeChat ? 'hidden' : 'w-full') : 'w-80 flex-shrink-0'
      )}>
        <div className="p-4 h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Messages
            </h2>
            <Button variant="ghost" size="sm" icon={Plus} />
          </div>
          
          {renderConversationList()}
        </div>
      </div>

      {/* Main chat area */}
      <div className={clsx(
        'flex-1 flex flex-col bg-white dark:bg-slate-800',
        isMobile && !activeChat && 'hidden'
      )}>
        {renderChatArea()}
      </div>

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
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
        isActive 
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-medium">
          {name[0]?.toUpperCase() || '?'}
        </div>
        {conversation.type === 'dm' && isOnline(conversation.otherUserId) && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
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
