import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  Search, 
  Filter, 
  Clock, 
  X, 
  ChevronDown,
  Calendar,
  User,
  Users,
  File,
  MessageCircle,
  Star,
  Paperclip,
  ArrowUpDown,
  Zap
} from 'lucide-react'

import { searchEngine } from '../../lib/search'
import { useAuthStore } from '../../store/authStore'
import { useCommunityStore } from '../../store/communityStore'
import { useToastStore } from '../../store/toastStore'

import Card, { CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { 
  PageLoading, 
  EmptyState, 
  ErrorState 
} from '../ui/LoadingState'

const SearchInterface = ({ 
  isOpen, 
  onClose, 
  initialQuery = '', 
  initialType = 'all' 
}) => {
  const { currentUser, users } = useAuthStore()
  const { groups } = useCommunityStore()
  const pushToast = useToastStore(s => s.push)
  
  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState(initialType)
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [searchFacets, setSearchFacets] = useState({})
  const [recentSearches, setRecentSearches] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  
  const searchInputRef = useRef(null)
  const debounceRef = useRef(null)
  
  const resultsPerPage = 20

  // Search filters
  const [filters, setFilters] = useState({
    dateRange: 'all',
    sender: null,
    group: null,
    hasAttachments: false,
    isStarred: false
  })

  // Search types
  const searchTypes = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'users', label: 'Users', icon: User },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'files', label: 'Files', icon: File }
  ]

  // Date range options
  const dateRanges = [
    { id: 'all', label: 'All time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This week' },
    { id: 'month', label: 'This month' },
    { id: 'year', label: 'This year' }
  ]

  // Sort options
  const sortOptions = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'date', label: 'Date' },
    { id: 'name', label: 'Name' }
  ]

  // Load initial data
  useEffect(() => {
    setRecentSearches(searchEngine.loadRecentSearches())
    setSearchHistory(searchEngine.getSearchHistory())
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Debounced search
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery)
      } else {
        setResults([])
        setTotalResults(0)
      }
    }, 300)
  }, [])

  // Handle query change
  useEffect(() => {
    debouncedSearch(query)
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debouncedSearch])

  // Perform search
  const performSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError(null)

    try {
      const searchOptions = {
        type: searchType,
        limit: resultsPerPage,
        offset: (currentPage - 1) * resultsPerPage,
        sortBy,
        sortOrder,
        filters,
        includeHighlights: true,
        fuzzySearch: true
      }

      const searchResults = await searchEngine.search(searchQuery, searchOptions)
      
      setResults(searchResults.results)
      setTotalResults(searchResults.total)
      setSearchSuggestions(searchResults.suggestions || [])
      setSearchFacets(searchResults.facets || {})
      
      // Add to recent searches
      searchEngine.addToRecentSearches(searchQuery)
      setRecentSearches(searchEngine.loadRecentSearches())
      
    } catch (error) {
      console.error('Search failed:', error)
      setSearchError(error.message)
      pushToast({
        title: 'Search failed',
        description: error.message,
        variant: 'error'
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    if (query.trim()) {
      performSearch()
    }
  }

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
    setCurrentPage(1)
    if (query.trim()) {
      performSearch()
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    performSearch()
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setResults([])
    setTotalResults(0)
    setSearchError(null)
    setCurrentPage(1)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      sender: null,
      group: null,
      hasAttachments: false,
      isStarred: false
    })
    setCurrentPage(1)
    if (query.trim()) {
      performSearch()
    }
  }

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery) => {
    setQuery(recentQuery)
    performSearch(recentQuery)
  }

  // Render search results
  const renderResults = () => {
    if (isSearching) {
      return <PageLoading message="Searching..." />
    }

    if (searchError) {
      return (
        <ErrorState
          title="Search failed"
          description={searchError}
          onRetry={() => performSearch()}
        />
      )
    }

    if (!query.trim()) {
      return (
        <div className="space-y-6">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Recent searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    <Clock className="h-3 w-3" />
                    {recentQuery}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search tips */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Search tips
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                Use quotes for exact phrases: "hello world"
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                Filter by type using the tabs above
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                Use filters to narrow down results
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (results.length === 0) {
      return (
        <EmptyState
          title="No results found"
          description={`No ${searchType === 'all' ? 'items' : searchType} found for "${query}"`}
          action={
            <div className="space-y-2">
              {searchSuggestions.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Try these suggestions:
                  </p>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(suggestion)}
                      className="block text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <Button onClick={resetFilters} variant="outline" size="sm">
                Clear filters
              </Button>
            </div>
          }
        />
      )
    }

    return (
      <div className="space-y-4">
        {/* Results header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {totalResults.toLocaleString()} results for "{query}"
          </p>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSortChange(sortBy)}
              className="p-1"
            >
              <ArrowUpDown className={clsx(
                'h-4 w-4 transition-transform',
                sortOrder === 'desc' && 'rotate-180'
              )} />
            </Button>
          </div>
        </div>

        {/* Search results */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <SearchResultItem
              key={`${result.type}-${result.id}-${index}`}
              result={result}
              query={query}
              users={users}
              groups={groups}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalResults > resultsPerPage && (
          <SearchPagination
            currentPage={currentPage}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-16"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages, users, groups, files..."
                icon={Search}
                className="text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    performSearch()
                  } else if (e.key === 'Escape') {
                    onClose()
                  }
                }}
              />
            </div>
            
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                icon={X}
              />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={X}
            />
          </div>

          {/* Search type tabs */}
          <div className="flex gap-1 mb-4">
            {searchTypes.map(type => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSearchType(type.id)
                    setCurrentPage(1)
                    if (query.trim()) {
                      performSearch()
                    }
                  }}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    searchType === type.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                  {searchFacets.types?.[type.id] && (
                    <span className={clsx(
                      'px-1.5 py-0.5 rounded text-xs',
                      searchType === type.id
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    )}>
                      {searchFacets.types[type.id]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Filters toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
              className={clsx(
                'transition-colors',
                showFilters && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
              )}
            >
              Filters
              <ChevronDown className={clsx(
                'h-4 w-4 ml-1 transition-transform',
                showFilters && 'rotate-180'
              )} />
            </Button>

            {Object.values(filters).some(v => v && v !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-slate-500 hover:text-slate-700"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date range filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Date range
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
                      >
                        {dateRanges.map(range => (
                          <option key={range.id} value={range.id}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sender filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Sender
                      </label>
                      <select
                        value={filters.sender || ''}
                        onChange={(e) => handleFilterChange('sender', e.target.value || null)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
                      >
                        <option value="">All senders</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Group filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Group
                      </label>
                      <select
                        value={filters.group || ''}
                        onChange={(e) => handleFilterChange('group', e.target.value || null)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
                      >
                        <option value="">All groups</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Additional filters */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.hasAttachments}
                          onChange={(e) => handleFilterChange('hasAttachments', e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Has attachments
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.isStarred}
                          onChange={(e) => handleFilterChange('isStarred', e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Starred only
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderResults()}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Search result item component
const SearchResultItem = ({ result, query, users, groups }) => {
  const getResultIcon = () => {
    switch (result.type) {
      case 'message':
        return MessageCircle
      case 'user':
        return User
      case 'group':
        return Users
      case 'file':
        return File
      default:
        return Search
    }
  }

  const getResultUrl = () => {
    switch (result.type) {
      case 'message':
        if (result.groupId) {
          return `/messages?group=${result.groupId}&highlight=${result.id}`
        } else {
          return `/messages?dm=${result.threadId}&highlight=${result.id}`
        }
      case 'user':
        return `/messages?dm=${result.id}`
      case 'group':
        return `/groups?id=${result.id}`
      case 'file':
        return result.url || '#'
      default:
        return '#'
    }
  }

  const Icon = getResultIcon()
  const user = users.find(u => u.id === result.userId)
  const group = groups.find(g => g.id === result.groupId)

  return (
    <Card hover className="p-4 cursor-pointer" onClick={() => window.location.href = getResultUrl()}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 
              className="font-medium text-slate-900 dark:text-slate-100 truncate"
              dangerouslySetInnerHTML={{ 
                __html: result.highlightedName || result.name || result.title || 'Untitled'
              }}
            />
            
            {result.type === 'message' && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                {user && <span>{user.name}</span>}
                {group && <span>in {group.name}</span>}
                {result.hasAttachments && <Paperclip className="h-3 w-3" />}
                {result.isStarred && <Star className="h-3 w-3 text-yellow-500" />}
              </div>
            )}
          </div>
          
          {result.content && (
            <p 
              className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2"
              dangerouslySetInnerHTML={{ 
                __html: result.highlightedContent || result.content
              }}
            />
          )}
          
          {result.description && (
            <p 
              className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2"
              dangerouslySetInnerHTML={{ 
                __html: result.highlightedDescription || result.description
              }}
            />
          )}
          
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="capitalize">{result.type}</span>
            {result.createdAt && (
              <span>
                {new Date(result.createdAt).toLocaleDateString()}
              </span>
            )}
            {result.relevanceScore && (
              <span>
                {Math.round(result.relevanceScore * 100)}% match
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Pagination component
const SearchPagination = ({ currentPage, totalResults, resultsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalResults / resultsPerPage)
  const maxVisiblePages = 5
  
  const getVisiblePages = () => {
    const pages = []
    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
      </p>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {getVisiblePages().map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="min-w-[2rem]"
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default SearchInterface
