import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, ChevronRight, Plus, Search, 
  Square, Circle, Triangle, Type, 
  Image, Music, FileText, Code2,
  Eye, EyeOff, Lock, Unlock, Trash2
} from 'lucide-react'

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="relative p-3 border-b border-slate-700">
    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
    />
  </div>
)

const EntityItem = ({ 
  entity, 
  isSelected, 
  onSelect, 
  onToggleVisibility, 
  onToggleLock, 
  onDelete,
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = entity.children && entity.children.length > 0

  const getEntityIcon = (entity) => {
    if (entity.components?.sprite) return Square
    if (entity.components?.text) return Type
    if (entity.components?.tilemap) return Square
    if (entity.components?.ui) return Square
    return Square
  }

  const Icon = getEntityIcon(entity)

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1.5 px-3 hover:bg-slate-700 cursor-pointer transition-colors ${
          isSelected ? 'bg-emerald-600/20 border-r-2 border-emerald-500' : ''
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(entity.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-slate-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-slate-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-400" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <span className="text-sm text-slate-200 truncate flex-1">
          {entity.name || 'Untitled Entity'}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility?.(entity.id)
            }}
            className="p-1 hover:bg-slate-600 rounded transition-colors"
            title="Toggle visibility"
          >
            <Eye className="h-3 w-3 text-slate-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleLock?.(entity.id)
            }}
            className="p-1 hover:bg-slate-600 rounded transition-colors"
            title="Toggle lock"
          >
            <Lock className="h-3 w-3 text-slate-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(entity.id)
            }}
            className="p-1 hover:bg-red-600 rounded transition-colors"
            title="Delete entity"
          >
            <Trash2 className="h-3 w-3 text-red-400" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {entity.children.map((child) => (
              <EntityItem
                key={child.id}
                entity={child}
                isSelected={isSelected}
                onSelect={onSelect}
                onToggleVisibility={onToggleVisibility}
                onToggleLock={onToggleLock}
                onDelete={onDelete}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const HierarchyTab = ({ 
  project, 
  selectedEntityId, 
  onSelectEntity, 
  onAddEntity, 
  onDeleteEntity 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const currentScene = project?.scenes?.[0]

  const filteredEntities = currentScene?.entities?.filter(entity =>
    entity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="h-full flex flex-col">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search entities..."
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Scene Hierarchy
            </h3>
            <button
              onClick={() => onAddEntity('sprite')}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              title="Add entity"
            >
              <Plus className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-1">
            {filteredEntities.map((entity) => (
              <EntityItem
                key={entity.id}
                entity={entity}
                isSelected={selectedEntityId === entity.id}
                onSelect={onSelectEntity}
                onDelete={onDeleteEntity}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const AssetItem = ({ asset, onSelect, onDelete }) => {
  const getAssetIcon = (type) => {
    switch (type) {
      case 'image': return Image
      case 'audio': return Music
      default: return FileText
    }
  }

  const Icon = getAssetIcon(asset.type)

  return (
    <div className="group relative">
      <div
        className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer transition-colors rounded-lg"
        onClick={() => onSelect?.(asset.id)}
      >
        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-200 truncate">
            {asset.name || 'Untitled Asset'}
          </div>
          <div className="text-xs text-slate-500 capitalize">
            {asset.type}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(asset.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
          title="Delete asset"
        >
          <Trash2 className="h-3 w-3 text-red-400" />
        </button>
      </div>
    </div>
  )
}

const AssetsTab = ({ 
  project, 
  onSelectAsset, 
  onDeleteAsset, 
  onImportAsset 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')

  const filteredAssets = project?.assets?.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === 'all' || asset.type === category
    return matchesSearch && matchesCategory
  }) || []

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type.startsWith('audio/'))) {
      onImportAsset(file)
    }
    e.target.value = ''
  }

  return (
    <div className="h-full flex flex-col">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search assets..."
      />
      
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="audio">Audio</option>
          </select>
          <button
            onClick={() => document.getElementById('asset-upload').click()}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-xs text-white transition-colors"
          >
            <Plus className="h-3 w-3" />
            Import
          </button>
          <input
            id="asset-upload"
            type="file"
            accept="image/*,audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {filteredAssets.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-slate-500 mb-2">
              <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
            </div>
            <p className="text-sm text-slate-400 mb-1">No assets found</p>
            <p className="text-xs text-slate-500">
              {category === 'all' ? 'Import assets to get started' : `No ${category} assets`}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredAssets.map((asset) => (
              <AssetItem
                key={asset.id}
                asset={asset}
                onSelect={onSelectAsset}
                onDelete={onDeleteAsset}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ModernHierarchyPanel = ({ 
  activeTab, 
  onTabChange, 
  project, 
  selectedEntityId, 
  onSelectEntity, 
  onAddEntity, 
  onDeleteEntity,
  onSelectAsset,
  onDeleteAsset,
  onImportAsset
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => onTabChange('hierarchy')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'hierarchy'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          <Square className="h-4 w-4" />
          Hierarchy
        </button>
        <button
          onClick={() => onTabChange('assets')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'assets'
              ? 'bg-slate-700 text-white border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          <Image className="h-4 w-4" />
          Assets
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'hierarchy' ? (
          <HierarchyTab
            project={project}
            selectedEntityId={selectedEntityId}
            onSelectEntity={onSelectEntity}
            onAddEntity={onAddEntity}
            onDeleteEntity={onDeleteEntity}
          />
        ) : (
          <AssetsTab
            project={project}
            onSelectAsset={onSelectAsset}
            onDeleteAsset={onDeleteAsset}
            onImportAsset={onImportAsset}
          />
        )}
      </div>
    </div>
  )
}

export default ModernHierarchyPanel
