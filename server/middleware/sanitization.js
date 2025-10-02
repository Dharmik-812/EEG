const createDOMPurify = require('isomorphic-dompurify')
const { JSDOM } = require('jsdom')
const validator = require('validator')
const xss = require('xss')

// Initialize DOMPurify with JSDOM window
const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

// XSS filter configuration
const xssOptions = {
  whiteList: {
    // Allow only safe HTML tags for rich text (if needed)
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    code: [],
    pre: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
  allowCommentTag: false,
  onIgnoreTag: function (tag, html, options) {
    // Log suspicious tags for monitoring
    console.warn(`XSS: Blocked tag "${tag}" in content: ${html.substring(0, 100)}...`)
  }
}

/**
 * Sanitize text content to prevent XSS attacks
 * @param {string} input - Raw user input
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized content
 */
function sanitizeText(input, options = {}) {
  if (typeof input !== 'string') {
    return input
  }

  let sanitized = input

  // 1. Basic HTML entity encoding
  sanitized = validator.escape(sanitized)

  // 2. XSS filtering with whitelist
  if (options.allowBasicHtml) {
    sanitized = xss(sanitized, xssOptions)
  }

  // 3. DOMPurify as final cleanup
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: options.allowBasicHtml ? ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'] : [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  })

  // 4. Additional validation
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
  }

  // 5. Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /data:application/i,
    /<script/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /expression\s*\(/i, // CSS expression
    /url\s*\(/i // CSS url() that could contain javascript:
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      console.warn(`XSS: Suspicious pattern detected: ${pattern} in content: ${sanitized.substring(0, 100)}...`)
      // Remove the suspicious content
      sanitized = sanitized.replace(pattern, '[BLOCKED]')
    }
  }

  return sanitized
}

/**
 * Sanitize email addresses
 * @param {string} email - Email to validate
 * @returns {string|null} - Normalized email or null if invalid
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return null
  }

  // Normalize and validate email
  const normalized = validator.normalizeEmail(email, {
    gmail_lowercase: true,
    gmail_remove_dots: false,
    outlookdotcom_lowercase: true,
    yahoo_lowercase: true,
    icloud_lowercase: true
  })

  if (!normalized || !validator.isEmail(normalized)) {
    return null
  }

  // Additional security checks
  if (normalized.length > 254) { // RFC 5321 limit
    return null
  }

  return normalized
}

/**
 * Sanitize file names for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Safe filename
 */
function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    return 'file'
  }

  // Remove path traversal attempts
  let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '_')
  
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[\.\s]+/, '')
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop()
    const name = sanitized.substring(0, 250 - ext.length)
    sanitized = `${name}.${ext}`
  }

  // Ensure it's not empty
  if (!sanitized || sanitized === '.') {
    sanitized = `file_${Date.now()}`
  }

  return sanitized
}

/**
 * Validate and sanitize URLs
 * @param {string} url - URL to validate
 * @param {object} options - Validation options
 * @returns {string|null} - Safe URL or null if invalid
 */
function sanitizeUrl(url, options = {}) {
  if (typeof url !== 'string') {
    return null
  }

  // Check if it's a valid URL
  if (!validator.isURL(url, {
    protocols: options.allowedProtocols || ['http', 'https'],
    require_protocol: true,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: false,
    host_whitelist: options.hostWhitelist || false,
    host_blacklist: options.hostBlacklist || false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false
  })) {
    return null
  }

  // Additional security checks
  const suspiciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /file:/i,
    /ftp:/i
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.warn(`URL: Blocked suspicious URL: ${url}`)
      return null
    }
  }

  return url
}

/**
 * Middleware to sanitize request body
 */
function sanitizeRequestBody(options = {}) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return next()
    }

    try {
      // Define field-specific sanitization rules
      const fieldRules = {
        // Text fields that allow basic formatting
        content: { allowBasicHtml: false, maxLength: 8000 },
        message: { allowBasicHtml: false, maxLength: 8000 },
        description: { allowBasicHtml: false, maxLength: 2000 },
        bio: { allowBasicHtml: false, maxLength: 500 },
        reason: { allowBasicHtml: false, maxLength: 500 },
        
        // Plain text fields
        name: { allowBasicHtml: false, maxLength: 100 },
        title: { allowBasicHtml: false, maxLength: 200 },
        
        // Email fields
        email: 'email',
        
        // URL fields
        avatarUrl: 'url',
        websiteUrl: 'url'
      }

      // Recursively sanitize object
      function sanitizeObject(obj, depth = 0) {
        if (depth > 10) { // Prevent deep recursion attacks
          return obj
        }

        for (const [key, value] of Object.entries(obj)) {
          if (value === null || value === undefined) {
            continue
          }

          if (typeof value === 'string') {
            const rule = fieldRules[key]
            
            if (rule === 'email') {
              obj[key] = sanitizeEmail(value)
            } else if (rule === 'url') {
              obj[key] = sanitizeUrl(value)
            } else if (typeof rule === 'object') {
              obj[key] = sanitizeText(value, rule)
            } else {
              // Default text sanitization
              obj[key] = sanitizeText(value, { maxLength: 1000 })
            }
          } else if (Array.isArray(value)) {
            // Sanitize array elements
            obj[key] = value.map(item => 
              typeof item === 'string' ? sanitizeText(item, { maxLength: 1000 }) :
              typeof item === 'object' ? sanitizeObject(item, depth + 1) : item
            )
          } else if (typeof value === 'object') {
            // Recursively sanitize nested objects
            obj[key] = sanitizeObject(value, depth + 1)
          }
        }

        return obj
      }

      req.body = sanitizeObject(req.body)
      
      // Log sanitization for monitoring
      if (options.logSanitization) {
        console.log(`Sanitized request to ${req.path}:`, {
          method: req.method,
          fieldsProcessed: Object.keys(req.body).length,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        })
      }

      next()
    } catch (error) {
      console.error('Sanitization error:', error)
      return res.status(400).json({ 
        error: 'Invalid input data',
        code: 'SANITIZATION_ERROR'
      })
    }
  }
}

/**
 * Middleware to validate file uploads
 */
function validateFileUpload(options = {}) {
  const allowedMimeTypes = options.allowedMimeTypes || [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ]
  
  const maxFileSize = options.maxFileSize || 5 * 1024 * 1024 // 5MB
  const maxFiles = options.maxFiles || 5

  return (req, res, next) => {
    if (!req.files || !Array.isArray(req.files)) {
      return next()
    }

    try {
      // Validate file count
      if (req.files.length > maxFiles) {
        return res.status(400).json({
          error: `Too many files. Maximum ${maxFiles} files allowed.`,
          code: 'TOO_MANY_FILES'
        })
      }

      // Validate each file
      for (const file of req.files) {
        // Check file size
        if (file.size > maxFileSize) {
          return res.status(400).json({
            error: `File "${file.originalname}" is too large. Maximum size is ${maxFileSize / 1024 / 1024}MB.`,
            code: 'FILE_TOO_LARGE'
          })
        }

        // Check MIME type
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: `File type "${file.mimetype}" is not allowed.`,
            code: 'INVALID_FILE_TYPE'
          })
        }

        // Sanitize filename
        file.originalname = sanitizeFilename(file.originalname)

        // Additional security checks for images
        if (file.mimetype.startsWith('image/')) {
          // Check for embedded scripts in image metadata (basic check)
          if (file.buffer && file.buffer.includes('script')) {
            console.warn(`File upload: Suspicious content in image ${file.originalname}`)
            return res.status(400).json({
              error: 'Invalid file content detected.',
              code: 'SUSPICIOUS_FILE_CONTENT'
            })
          }
        }
      }

      next()
    } catch (error) {
      console.error('File validation error:', error)
      return res.status(400).json({
        error: 'File validation failed',
        code: 'FILE_VALIDATION_ERROR'
      })
    }
  }
}

module.exports = {
  sanitizeText,
  sanitizeEmail,
  sanitizeFilename,
  sanitizeUrl,
  sanitizeRequestBody,
  validateFileUpload
}
