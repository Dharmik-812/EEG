const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000'

let _accessToken = null
let _refreshToken = null
let _tokenExpiry = null

export function setTokens({ accessToken, refreshToken, expiresIn }) {
  _accessToken = accessToken
  _refreshToken = refreshToken
  _tokenExpiry = Date.now() + (expiresIn * 1000)
  
  if (accessToken && refreshToken) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('token_expiry', _tokenExpiry.toString())
  } else {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expiry')
  }
}

export function getAccessToken() {
  return _accessToken || localStorage.getItem('access_token') || null
}

export function getRefreshToken() {
  return _refreshToken || localStorage.getItem('refresh_token') || null
}

export function isTokenExpired() {
  const expiry = _tokenExpiry || parseInt(localStorage.getItem('token_expiry') || '0')
  return Date.now() >= expiry - 60000 // Refresh 1 minute before expiry
}

// Legacy support
export function setToken(token) {
  console.warn('setToken is deprecated, use setTokens instead')
  if (token) {
    setTokens({ accessToken: token, refreshToken: null, expiresIn: 7 * 24 * 60 * 60 })
  } else {
    setTokens({ accessToken: null, refreshToken: null, expiresIn: 0 })
  }
}

export function getToken() {
  console.warn('getToken is deprecated, use getAccessToken instead')
  return getAccessToken()
}

// Refresh access token using refresh token
async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
  
  if (!response.ok) {
    // Refresh token is invalid, clear all tokens
    setTokens({ accessToken: null, refreshToken: null, expiresIn: 0 })
    throw new Error('Session expired, please login again')
  }
  
  const data = await response.json()
  setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn
  })
  
  return data.accessToken
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  let accessToken = getAccessToken()
  
  // Check if token needs refresh
  if (accessToken && isTokenExpired()) {
    try {
      accessToken = await refreshAccessToken()
    } catch (error) {
      // Redirect to login or handle auth error
      window.dispatchEvent(new CustomEvent('auth:expired'))
      throw error
    }
  }
  
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  
  // Handle token expiry during request
  if (res.status === 401) {
    const errorData = await res.json().catch(() => ({}))
    if (errorData.code === 'INVALID_TOKEN' && getRefreshToken()) {
      try {
        // Try to refresh and retry the request
        accessToken = await refreshAccessToken()
        const retryRes = await fetch(`${API_BASE}${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        })
        
        if (!retryRes.ok) {
          const retryErr = await retryRes.json().catch(() => ({}))
          throw new Error(retryErr.error || `API ${retryRes.status}`)
        }
        
        return retryRes.json()
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent('auth:expired'))
        throw refreshError
      }
    }
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API ${res.status}`)
  }
  
  return res.json()
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
  me: () => request('/auth/me'),
  users: (q = '') => request(`/users${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  userById: (id) => request(`/users/${id}`),
  updateMe: (data) => request('/users/me', { method: 'PUT', body: data }),
  changePassword: (currentPassword, newPassword) => request('/users/me/password', { method: 'PUT', body: { currentPassword, newPassword } }),
  updateMyKey: (publicKeyJwk) => request('/users/me/keys', { method: 'PUT', body: { publicKeyJwk } }),
  // Friends
  friendRequest: (toUserId) => request('/friends/request', { method: 'POST', body: { toUserId } }),
  friendRequests: (type='incoming') => request(`/friends/requests?type=${type}`),
  friendAccept: (id) => request(`/friends/requests/${id}/accept`, { method: 'POST' }),
  friendDecline: (id) => request(`/friends/requests/${id}/decline`, { method: 'POST' }),
  friendCancel: (id) => request(`/friends/requests/${id}/cancel`, { method: 'POST' }),
  friends: () => request('/friends'),
  // DMs
  dmList: () => request('/dms'),
  dmMessages: (threadKey) => request(`/dms/${threadKey}/messages`),
  dmSend: (otherId, payload) => request(`/dms/${otherId}/messages`, { method: 'POST', body: payload }),
  dmEdit: (id, content) => request(`/dms/messages/${id}`, { method: 'PUT', body: { content } }),
  dmDelete: (id) => request(`/dms/messages/${id}`, { method: 'DELETE' }),
  dmReact: (id, emoji) => request(`/dms/messages/${id}/reactions`, { method: 'POST', body: { emoji } }),
  dmRead: (threadKey) => request(`/dms/${threadKey}/read`, { method: 'PUT' }),
  // Groups
  groups: (q = '') => request(`/groups${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  groupCreate: (data) => request('/groups', { method: 'POST', body: data }),
  groupJoin: (id) => request(`/groups/${id}/join`, { method: 'POST' }),
  groupLeave: (id) => request(`/groups/${id}/leave`, { method: 'POST' }),
  groupSettings: (id, data) => request(`/groups/${id}/settings`, { method: 'PUT', body: data }),
  groupMessages: (id) => request(`/groups/${id}/messages`),
  groupSend: (id, payload) => request(`/groups/${id}/messages`, { method: 'POST', body: payload }),
  groupReact: (id, emoji) => request(`/groups/messages/${id}/reactions`, { method: 'POST', body: { emoji } }),
  groupPin: (id, messageId) => request(`/groups/${id}/pins`, { method: 'POST', body: { messageId, action: 'pin' } }),
  groupUnpin: (id, messageId) => request(`/groups/${id}/pins`, { method: 'POST', body: { messageId, action: 'unpin' } }),
  // Invites & Search (optional server support)
  groupInviteLink: (id) => request(`/groups/${id}/invite-link`),
  groupJoinByCode: (code) => request(`/groups/join-by-code`, { method: 'POST', body: { code } }),
  // Reports & Admin
  reportCreate: ({ targetType, targetId, reason, evidenceUrls = [] }) => request('/reports', { method: 'POST', body: { targetType, targetId, reason, evidenceUrls } }),
  reportsList: (status = '') => request(`/reports${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  reportUpdate: (id, updates) => request(`/reports/${id}`, { method: 'PUT', body: updates }),
  adminBanUser: ({ userId, reason, until }) => request('/admin/ban', { method: 'POST', body: { userId, reason, until } }),
  adminUnbanUser: ({ userId }) => request('/admin/unban', { method: 'POST', body: { userId } }),
}
