import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  Edit3, 
  Trash2, 
  Reply, 
  MoreHorizontal, 
  Check, 
  CheckCheck,
  Clock,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Button from './Button'
import ContextMenu from '../ContextMenu'
import EmojiPicker from '../EmojiPicker'

const MessageBubble = ({
  message,
  isOwn = false,
  showAvatar = true,
  showTimestamp = true,
  user,
  onEdit,
  onDelete,
  onReply,
  onReact,
  onDownload,
  className,
  ...props
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const messageRef = useRef(null)

  const handleContextMenu = (e) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const handleReaction = (emoji) => {
    onReact?.(message.id, emoji)
    setShowEmojiPicker(false)
  }

  const getDeliveryStatus = () => {
    if (message.failed) return { icon: AlertCircle, color: 'text-red-500', label: 'Failed' }
    if (message.delivered) return { icon: CheckCheck, color: 'text-emerald-500', label: 'Delivered' }
    if (message.sent) return { icon: Check, color: 'text-slate-400', label: 'Sent' }
    return { icon: Clock, color: 'text-slate-400', label: 'Sending' }
  }

  const deliveryStatus = getDeliveryStatus()

  const menuItems = [
    ...(onReply ? [{ 
      label: 'Reply', 
      icon: Reply, 
      onClick: () => onReply(message) 
    }] : []),
    { 
      label: 'React', 
      icon: '😊', 
      onClick: () => setShowEmojiPicker(true) 
    },
    ...(isOwn && onEdit ? [{ 
      label: 'Edit', 
      icon: Edit3, 
      onClick: () => onEdit(message) 
    }] : []),
    ...(isOwn && onDelete ? [{ 
      label: 'Delete', 
      icon: Trash2, 
      onClick: () => onDelete(message),
      danger: true 
    }] : [])
  ]

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        'group flex gap-3 max-w-[80%]',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto',
        className
      )}
      onContextMenu={handleContextMenu}
      {...props}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      )}

      <div className={clsx('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {/* User name (for group chats) */}
        {!isOwn && user?.name && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 px-3">
            {user.name}
          </span>
        )}

        {/* Message content */}
        <div
          className={clsx(
            'relative px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200',
            isOwn 
              ? 'bg-emerald-500 text-white' 
              : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100',
            'group-hover:shadow-md'
          )}
        >
          {/* Reply indicator */}
          {message.replyTo && (
            <div className={clsx(
              'mb-2 p-2 rounded-lg border-l-2',
              isOwn 
                ? 'bg-emerald-600 border-emerald-300' 
                : 'bg-slate-100 dark:bg-slate-600 border-slate-300 dark:border-slate-500'
            )}>
              <p className={clsx(
                'text-xs opacity-75 truncate',
                isOwn ? 'text-emerald-100' : 'text-slate-600 dark:text-slate-400'
              )}>
                Replying to: {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Message text */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <AttachmentPreview
                  key={index}
                  attachment={attachment}
                  onDownload={onDownload}
                  isOwn={isOwn}
                />
              ))}
            </div>
          )}

          {/* Edit indicator */}
          {message.editedAt && (
            <span className={clsx(
              'text-xs opacity-60 italic',
              isOwn ? 'text-emerald-100' : 'text-slate-500'
            )}>
              (edited)
            </span>
          )}

          {/* Quick actions */}
          <div className={clsx(
            'absolute -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isOwn ? '-left-20' : '-right-20'
          )}>
            <Button
              size="xs"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white dark:bg-slate-800 shadow-md"
              onClick={() => setShowEmojiPicker(true)}
            >
              😊
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white dark:bg-slate-800 shadow-md"
              onClick={() => setShowMenu(true)}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {message.reactions.map((reaction, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReaction(reaction.emoji)}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <span>{reaction.emoji}</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {reaction.count}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Timestamp and delivery status */}
        {showTimestamp && (
          <div className={clsx(
            'flex items-center gap-1 mt-1 text-xs text-slate-400',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}>
            <span>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {isOwn && (
              <deliveryStatus.icon 
                className={clsx('h-3 w-3', deliveryStatus.color)} 
                title={deliveryStatus.label}
              />
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        position={menuPosition}
        items={menuItems}
      />

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPicker
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onSelect={handleReaction}
            anchorEl={messageRef.current}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Attachment Preview Component
const AttachmentPreview = ({ attachment, onDownload, isOwn }) => {
  const isImage = attachment.type?.startsWith('image/')
  const isVideo = attachment.type?.startsWith('video/')
  const isAudio = attachment.type?.startsWith('audio/')

  if (isImage && attachment.url) {
    return (
      <div className="relative group">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-xs rounded-lg shadow-sm"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
          <Button
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900"
            onClick={() => onDownload?.(attachment)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (isVideo && attachment.url) {
    return (
      <video
        src={attachment.url}
        controls
        className="max-w-xs rounded-lg shadow-sm"
        preload="metadata"
      />
    )
  }

  if (isAudio && attachment.url) {
    return (
      <audio
        src={attachment.url}
        controls
        className="max-w-xs"
        preload="metadata"
      />
    )
  }

  // Generic file
  return (
    <div className={clsx(
      'flex items-center gap-3 p-3 rounded-lg border',
      isOwn 
        ? 'bg-emerald-600 border-emerald-400' 
        : 'bg-slate-100 dark:bg-slate-600 border-slate-200 dark:border-slate-500'
    )}>
      <div className={clsx(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        isOwn ? 'bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'
      )}>
        <ExternalLink className={clsx(
          'h-4 w-4',
          isOwn ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx(
          'text-sm font-medium truncate',
          isOwn ? 'text-emerald-100' : 'text-slate-900 dark:text-slate-100'
        )}>
          {attachment.name}
        </p>
        {attachment.size && (
          <p className={clsx(
            'text-xs opacity-75',
            isOwn ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'
          )}>
            {formatFileSize(attachment.size)}
          </p>
        )}
      </div>
      <Button
        size="xs"
        variant="ghost"
        className={clsx(
          'p-1',
          isOwn ? 'text-emerald-200 hover:bg-emerald-700' : ''
        )}
        onClick={() => onDownload?.(attachment)}
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  )
}

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default MessageBubble
