// Advanced Search System with Full-Text Search
import { api } from './api'

class SearchEngine {
  constructor() {
    this.searchHistory = []
    this.searchFilters = {
      type: 'all', // 'messages', 'users', 'groups', 'files', 'all'
      dateRange: 'all', // 'today', 'week', 'month', 'year', 'all'
      sender: null,
      group: null,
      hasAttachments: false,
      isStarred: false
    }
    this.recentSearches = this.loadRecentSearches()
    this.searchIndex = new Map() // In-memory search index
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ])
  }

  // Tokenize text for search indexing
  tokenize(text) {
    if (!text || typeof text !== 'string') return []
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.stopWords.has(token))
  }

  // Create search index for faster searching
  buildSearchIndex(items, type) {
    const index = new Map()
    
    items.forEach(item => {
      const tokens = new Set()
      
      // Index different fields based on type
      switch (type) {
        case 'messages':
          this.tokenize(item.content).forEach(token => tokens.add(token))
          if (item.user?.name) {
            this.tokenize(item.user.name).forEach(token => tokens.add(token))
          }
          break
          
        case 'users':
          this.tokenize(item.name).forEach(token => tokens.add(token))
          this.tokenize(item.email).forEach(token => tokens.add(token))
          if (item.bio) {
            this.tokenize(item.bio).forEach(token => tokens.add(token))
          }
          break
          
        case 'groups':
          this.tokenize(item.name).forEach(token => tokens.add(token))
          this.tokenize(item.description).forEach(token => tokens.add(token))
          if (item.tags) {
            item.tags.forEach(tag => {
              this.tokenize(tag).forEach(token => tokens.add(token))
            })
          }
          break
          
        case 'files':
          this.tokenize(item.name).forEach(token => tokens.add(token))
          this.tokenize(item.type).forEach(token => tokens.add(token))
          break
      }
      
      // Add item to index for each token
      tokens.forEach(token => {
        if (!index.has(token)) {
          index.set(token, [])
        }
        index.get(token).push(item)
      })
    })
    
    this.searchIndex.set(type, index)
    return index
  }

  // Perform fuzzy string matching
  fuzzyMatch(query, text, threshold = 0.6) {
    if (!query || !text) return 0
    
    query = query.toLowerCase()
    text = text.toLowerCase()
    
    // Exact match gets highest score
    if (text.includes(query)) {
      return 1.0
    }
    
    // Calculate Levenshtein distance for fuzzy matching
    const distance = this.levenshteinDistance(query, text)
    const maxLength = Math.max(query.length, text.length)
    const similarity = 1 - (distance / maxLength)
    
    return similarity >= threshold ? similarity : 0
  }

  // Calculate Levenshtein distance
  levenshteinDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Advanced search with multiple criteria
  async search(query, options = {}) {
    const {
      type = 'all',
      limit = 50,
      offset = 0,
      sortBy = 'relevance', // 'relevance', 'date', 'name'
      sortOrder = 'desc',
      filters = {},
      includeHighlights = true,
      fuzzySearch = true
    } = options

    // Merge filters
    const searchFilters = { ...this.searchFilters, ...filters }
    
    // Save to search history
    this.addToSearchHistory(query, searchFilters)
    
    try {
      let results = []
      
      if (type === 'all') {
        // Search across all types
        const [messages, users, groups, files] = await Promise.all([
          this.searchMessages(query, { ...options, type: 'messages' }),
          this.searchUsers(query, { ...options, type: 'users' }),
          this.searchGroups(query, { ...options, type: 'groups' }),
          this.searchFiles(query, { ...options, type: 'files' })
        ])
        
        results = [
          ...messages.map(r => ({ ...r, type: 'message' })),
          ...users.map(r => ({ ...r, type: 'user' })),
          ...groups.map(r => ({ ...r, type: 'group' })),
          ...files.map(r => ({ ...r, type: 'file' }))
        ]
      } else {
        // Search specific type
        switch (type) {
          case 'messages':
            results = await this.searchMessages(query, options)
            break
          case 'users':
            results = await this.searchUsers(query, options)
            break
          case 'groups':
            results = await this.searchGroups(query, options)
            break
          case 'files':
            results = await this.searchFiles(query, options)
            break
        }
      }
      
      // Apply additional filters
      results = this.applyFilters(results, searchFilters)
      
      // Sort results
      results = this.sortResults(results, sortBy, sortOrder)
      
      // Add highlights
      if (includeHighlights) {
        results = this.addHighlights(results, query)
      }
      
      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit)
      
      return {
        results: paginatedResults,
        total: results.length,
        query,
        filters: searchFilters,
        suggestions: this.generateSuggestions(query, results),
        facets: this.generateFacets(results)
      }
    } catch (error) {
      console.error('Search error:', error)
      throw new Error(`Search failed: ${error.message}`)
    }
  }

  // Search messages
  async searchMessages(query, options = {}) {
    const { filters = {} } = options
    
    try {
      // Try server-side search first
      const serverResults = await api.searchMessages({
        q: query,
        ...filters,
        limit: options.limit || 50
      })
      
      return serverResults.messages || []
    } catch (error) {
      console.warn('Server search failed, falling back to client-side search')
      
      // Fallback to client-side search
      const index = this.searchIndex.get('messages')
      if (!index) return []
      
      const queryTokens = this.tokenize(query)
      const matchedItems = new Set()
      
      queryTokens.forEach(token => {
        const items = index.get(token) || []
        items.forEach(item => matchedItems.add(item))
      })
      
      return Array.from(matchedItems)
    }
  }

  // Search users
  async searchUsers(query, options = {}) {
    try {
      const serverResults = await api.searchUsers({
        q: query,
        limit: options.limit || 20
      })
      
      return serverResults.users || []
    } catch (error) {
      console.warn('User search failed:', error)
      return []
    }
  }

  // Search groups
  async searchGroups(query, options = {}) {
    try {
      const serverResults = await api.searchGroups({
        q: query,
        limit: options.limit || 20
      })
      
      return serverResults.groups || []
    } catch (error) {
      console.warn('Group search failed:', error)
      return []
    }
  }

  // Search files
  async searchFiles(query, options = {}) {
    try {
      const serverResults = await api.searchFiles({
        q: query,
        limit: options.limit || 30
      })
      
      return serverResults.files || []
    } catch (error) {
      console.warn('File search failed:', error)
      return []
    }
  }

  // Apply additional filters
  applyFilters(results, filters) {
    return results.filter(item => {
      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const itemDate = new Date(item.createdAt || item.timestamp)
        const now = new Date()
        let cutoff
        
        switch (filters.dateRange) {
          case 'today':
            cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            break
          case 'year':
            cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            break
          default:
            cutoff = new Date(0)
        }
        
        if (itemDate < cutoff) return false
      }
      
      // Sender filter
      if (filters.sender && item.userId !== filters.sender) {
        return false
      }
      
      // Group filter
      if (filters.group && item.groupId !== filters.group) {
        return false
      }
      
      // Attachments filter
      if (filters.hasAttachments && (!item.attachments || item.attachments.length === 0)) {
        return false
      }
      
      // Starred filter
      if (filters.isStarred && !item.isStarred) {
        return false
      }
      
      return true
    })
  }

  // Sort search results
  sortResults(results, sortBy, sortOrder) {
    return results.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'relevance':
          comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0)
          break
        case 'date':
          const dateA = new Date(a.createdAt || a.timestamp || 0)
          const dateB = new Date(b.createdAt || b.timestamp || 0)
          comparison = dateB.getTime() - dateA.getTime()
          break
        case 'name':
          const nameA = (a.name || a.title || '').toLowerCase()
          const nameB = (b.name || b.title || '').toLowerCase()
          comparison = nameA.localeCompare(nameB)
          break
      }
      
      return sortOrder === 'desc' ? comparison : -comparison
    })
  }

  // Add search highlights
  addHighlights(results, query) {
    const queryTokens = this.tokenize(query)
    
    return results.map(item => {
      const highlighted = { ...item }
      
      // Highlight content
      if (item.content) {
        highlighted.highlightedContent = this.highlightText(item.content, queryTokens)
      }
      
      // Highlight name/title
      if (item.name) {
        highlighted.highlightedName = this.highlightText(item.name, queryTokens)
      }
      
      // Highlight description
      if (item.description) {
        highlighted.highlightedDescription = this.highlightText(item.description, queryTokens)
      }
      
      return highlighted
    })
  }

  // Highlight matching text
  highlightText(text, queryTokens) {
    if (!text || !queryTokens.length) return text
    
    let highlightedText = text
    
    queryTokens.forEach(token => {
      const regex = new RegExp(`(${this.escapeRegex(token)})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
    })
    
    return highlightedText
  }

  // Escape regex special characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Generate search suggestions
  generateSuggestions(query, results) {
    const suggestions = []
    
    // Suggest corrections for typos
    if (results.length === 0 && query.length > 3) {
      suggestions.push(`Did you mean "${this.suggestCorrection(query)}"?`)
    }
    
    // Suggest related searches
    const relatedQueries = this.getRelatedQueries(query)
    suggestions.push(...relatedQueries)
    
    return suggestions.slice(0, 5)
  }

  // Generate search facets for filtering
  generateFacets(results) {
    const facets = {
      types: {},
      dates: {},
      senders: {},
      groups: {}
    }
    
    results.forEach(item => {
      // Type facets
      const type = item.type || 'unknown'
      facets.types[type] = (facets.types[type] || 0) + 1
      
      // Date facets
      const date = new Date(item.createdAt || item.timestamp)
      const dateKey = date.toISOString().split('T')[0]
      facets.dates[dateKey] = (facets.dates[dateKey] || 0) + 1
      
      // Sender facets
      if (item.userId || item.senderId) {
        const sender = item.userId || item.senderId
        facets.senders[sender] = (facets.senders[sender] || 0) + 1
      }
      
      // Group facets
      if (item.groupId) {
        facets.groups[item.groupId] = (facets.groups[item.groupId] || 0) + 1
      }
    })
    
    return facets
  }

  // Search history management
  addToSearchHistory(query, filters) {
    if (!query.trim()) return
    
    const searchEntry = {
      query: query.trim(),
      filters,
      timestamp: Date.now()
    }
    
    // Remove duplicate
    this.searchHistory = this.searchHistory.filter(entry => entry.query !== query)
    
    // Add to beginning
    this.searchHistory.unshift(searchEntry)
    
    // Limit history size
    this.searchHistory = this.searchHistory.slice(0, 100)
    
    // Save to localStorage
    this.saveSearchHistory()
  }

  // Get search history
  getSearchHistory(limit = 10) {
    return this.searchHistory.slice(0, limit)
  }

  // Clear search history
  clearSearchHistory() {
    this.searchHistory = []
    this.saveSearchHistory()
  }

  // Save search history to localStorage
  saveSearchHistory() {
    try {
      localStorage.setItem('eeg_search_history', JSON.stringify(this.searchHistory))
    } catch (error) {
      console.warn('Failed to save search history:', error)
    }
  }

  // Load search history from localStorage
  loadSearchHistory() {
    try {
      const saved = localStorage.getItem('eeg_search_history')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.warn('Failed to load search history:', error)
      return []
    }
  }

  // Recent searches management
  addToRecentSearches(query) {
    if (!query.trim()) return
    
    this.recentSearches = this.recentSearches.filter(q => q !== query)
    this.recentSearches.unshift(query.trim())
    this.recentSearches = this.recentSearches.slice(0, 10)
    
    try {
      localStorage.setItem('eeg_recent_searches', JSON.stringify(this.recentSearches))
    } catch (error) {
      console.warn('Failed to save recent searches:', error)
    }
  }

  loadRecentSearches() {
    try {
      const saved = localStorage.getItem('eeg_recent_searches')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.warn('Failed to load recent searches:', error)
      return []
    }
  }

  // Suggest spelling corrections
  suggestCorrection(query) {
    // Simple correction logic - in production, you might use a more sophisticated algorithm
    const commonWords = ['message', 'user', 'group', 'file', 'chat', 'friend', 'notification']
    
    let bestMatch = query
    let bestScore = 0
    
    commonWords.forEach(word => {
      const score = this.fuzzyMatch(query, word, 0.5)
      if (score > bestScore) {
        bestScore = score
        bestMatch = word
      }
    })
    
    return bestMatch
  }

  // Get related queries
  getRelatedQueries(query) {
    const related = []
    const tokens = this.tokenize(query)
    
    // Add variations
    if (tokens.length > 0) {
      related.push(`${tokens[0]} messages`)
      related.push(`${tokens[0]} files`)
      related.push(`${tokens[0]} in groups`)
    }
    
    return related
  }

  // Update search filters
  updateFilters(newFilters) {
    this.searchFilters = { ...this.searchFilters, ...newFilters }
  }

  // Get current filters
  getFilters() {
    return { ...this.searchFilters }
  }

  // Reset filters
  resetFilters() {
    this.searchFilters = {
      type: 'all',
      dateRange: 'all',
      sender: null,
      group: null,
      hasAttachments: false,
      isStarred: false
    }
  }
}

// Global search engine instance
export const searchEngine = new SearchEngine()

export default searchEngine
