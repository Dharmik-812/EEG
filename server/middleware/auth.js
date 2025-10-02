const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me'
const ACCESS_TOKEN_EXPIRY = '15m'  // Short-lived access tokens
const REFRESH_TOKEN_EXPIRY = '7d'  // Longer-lived refresh tokens

// Warn about default secrets
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret_change_me') {
  console.warn('⚠️  Using default JWT_SECRET. Set JWT_SECRET in environment for production.')
}
if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'dev_refresh_secret_change_me') {
  console.warn('⚠️  Using default JWT_REFRESH_SECRET. Set JWT_REFRESH_SECRET in environment for production.')
}

// Generate token pair (access + refresh)
function generateTokens(user) {
  const payload = { 
    id: user.id, 
    email: user.email,
    role: user.role || 'user'
  }
  
  const accessToken = jwt.sign(
    { ...payload, type: 'access' }, 
    JWT_SECRET, 
    { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'eeg-app',
      audience: 'eeg-users'
    }
  )
  
  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' }, 
    JWT_REFRESH_SECRET, 
    { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'eeg-app',
      audience: 'eeg-users'
    }
  )
  
  return { 
    accessToken, 
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes in seconds
  }
}

// Verify access token
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'eeg-app',
      audience: 'eeg-users'
    })
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type')
    }
    
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired access token')
  }
}

// Verify refresh token
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'eeg-app',
      audience: 'eeg-users'
    })
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type')
    }
    
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired refresh token')
  }
}

// Auth middleware for protected routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN'
    })
  }
  
  try {
    const decoded = verifyAccessToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ 
      error: error.message,
      code: 'INVALID_TOKEN'
    })
  }
}

// Optional auth middleware (doesn't fail if no token)
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  if (token) {
    try {
      const decoded = verifyAccessToken(token)
      req.user = decoded
    } catch (error) {
      // Continue without user context if token is invalid
      req.user = null
    }
  }
  
  next()
}

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  authMiddleware,
  optionalAuthMiddleware,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
}
