import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen, Plus, Trash2, Search, Filter, Upload, Download,
  Image, Volume2, FileText, Film, Archive, Settings, Grid,
  List, Eye, Edit, Copy, Move, Star, Clock, Tag, Palette,
  RefreshCw, ExternalLink, Zap, Package, Layers
} from 'lucide-react'

const ASSET_TYPES = {
  image: { icon: Image, color: 'blue', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  audio: { icon: Volume2, color: 'orange', extensions: ['.mp3', '.wav', '.ogg', '.m4a'] },
  video: { icon: Film, color: 'purple', extensions: ['.mp4', '.webm', '.mov'] },
  data: { icon: FileText, color: 'green', extensions: ['.json', '.xml', '.csv'] },
  font: { icon: FileText, color: 'indigo', extensions: ['.ttf', '.otf', '.woff', '.woff2'] },
  archive: { icon: Archive, color: 'gray', extensions: ['.zip', '.rar', '.7z'] }
}

const SAMPLE_ASSETS = [
  {
    id: 'player-sprite',
    name: 'Player Character',
    type: 'image',
    size: 2048,
    dimensions: { width: 32, height: 48 },
    lastModified: Date.now() - 86400000,
    tags: ['character', 'sprite', 'player'],
    favorite: true,
    preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  },
  {
    id: 'forest-bg',
    name: 'Forest Background',
    type: 'image',
    size: 15360,
    dimensions: { width: 800, height: 600 },
    lastModified: Date.now() - 172800000,
    tags: ['background', 'environment', 'forest'],
    favorite: false,
    preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/i6h6rAAAAABJRU5ErkJggg=='
  },
  {
    id: 'pickup-sound',
    name: 'Pickup Sound Effect',
    type: 'audio',
    size: 4096,
    duration: 0.5,
    lastModified: Date.now() - 259200000,
    tags: ['sfx', 'pickup', 'positive'],
    favorite: false
  },
  {
    id: 'level-data',
    name: 'Level 1 Configuration',
    type: 'data',
    size: 1024,
    lastModified: Date.now() - 86400000,
    tags: ['level', 'config', 'json'],
    favorite: false
  }
]

const AssetCard = ({ asset, viewMode, onSelect, onPreview, onEdit, onDelete, isSelected }) => {
  const assetType = ASSET_TYPES[asset.type] || ASSET_TYPES.data
  const [isHovered, setIsHovered] = useState(false)

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return date.toLocaleDateString()
  }

  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`group relative bg-white dark:bg-slate-800 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
          isSelected 
            ? 'border-emerald-500 shadow-lg shadow-emerald-500/25' 
            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
        }`}
        onClick={() => onSelect(asset.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Preview */}
        <div className="relative aspect-square p-4 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-t-lg">
          {asset.preview ? (
            <img 
              src={asset.preview} 
              alt={asset.name}
              className="max-w-full max-h-full object-contain rounded"
            />
          ) : (
            <assetType.icon className={`h-12 w-12 text-${assetType.color}-500`} />
          )}
          
          {asset.favorite && (
            <Star className="absolute top-2 right-2 h-4 w-4 text-amber-500 fill-current" />
          )}
          
          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center gap-2"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onPreview(asset) }}
                  className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(asset) }}
                  className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm truncate">{asset.name}</h3>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
            <span>{formatSize(asset.size)}</span>
            <span>{formatDate(asset.lastModified)}</span>
          </div>
          
          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {asset.tags.slice(0, 2).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {asset.tags.length > 2 && (
                <span className="text-xs text-slate-400">+{asset.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // List view
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border transition-all ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
      }`}
      onClick={() => onSelect(asset.id)}
    >
      {/* Icon/Preview */}
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded">
        {asset.preview ? (
          <img src={asset.preview} alt={asset.name} className="w-full h-full object-cover rounded" />
        ) : (
          <assetType.icon className={`h-6 w-6 text-${assetType.color}-500`} />
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{asset.name}</h3>
          {asset.favorite && <Star className="h-4 w-4 text-amber-500 fill-current flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
          <span>{asset.type.toUpperCase()}</span>
          <span>{formatSize(asset.size)}</span>
          {asset.dimensions && (
            <span>{asset.dimensions.width}×{asset.dimensions.height}</span>
          )}
          <span>{formatDate(asset.lastModified)}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(asset) }}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="Preview"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(asset) }}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(asset) }}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default function EnhancedAssetManager() {
  const [assets, setAssets] = useState(SAMPLE_ASSETS)
  const [selectedAssets, setSelectedAssets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showUpload, setShowUpload] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const fileInputRef = useRef(null)

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterType === 'all' || asset.type === filterType
    
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name)
      case 'type': return a.type.localeCompare(b.type)
      case 'size': return b.size - a.size
      case 'date': return b.lastModified - a.lastModified
      default: return 0
    }
  })

  const handleFileUpload = useCallback((files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('audio/') ? 'audio' :
                file.type.startsWith('video/') ? 'video' : 'data',
          size: file.size,
          lastModified: Date.now(),
          tags: [],
          favorite: false,
          preview: file.type.startsWith('image/') ? e.target.result : null
        }
        
        setAssets(prev => [...prev, newAsset])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  return (
    <div 
      className="h-full flex flex-col bg-slate-50 dark:bg-slate-900"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-500" />
            Asset Manager
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-eco px-3 py-2"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Upload</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,video/*,.json,.xml,.csv"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="audio">Audio</option>
            <option value="video">Videos</option>
            <option value="data">Data</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="size">Sort by Size</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Asset Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Assets Found</h3>
            <p className="text-sm">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Upload assets to get started with your game'
              }
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-eco mt-4 inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Assets
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'space-y-2'
          }>
            {filteredAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                viewMode={viewMode}
                onSelect={(id) => setSelectedAssets(prev => 
                  prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                )}
                onPreview={(asset) => console.log('Preview:', asset)}
                onEdit={(asset) => console.log('Edit:', asset)}
                onDelete={(asset) => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                isSelected={selectedAssets.includes(asset.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            {filteredAssets.length} assets 
            {selectedAssets.length > 0 && ` • ${selectedAssets.length} selected`}
          </div>
          
          <div className="flex items-center gap-4">
            {Object.entries(ASSET_TYPES).map(([type, config]) => {
              const count = assets.filter(a => a.type === type).length
              if (count === 0) return null
              
              return (
                <div key={type} className="flex items-center gap-1">
                  <config.icon className={`h-3 w-3 text-${config.color}-500`} />
                  <span>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}