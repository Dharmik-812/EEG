const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const { fileTypeFromBuffer } = require('file-type')
const mimeTypes = require('mime-types')
const { sanitizeFilename } = require('./sanitization')

// Allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  
  // Archives (if needed)
  // 'application/zip': ['.zip'],
}

// File size limits
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILES_PER_REQUEST = 5

// Dangerous file signatures to block
const DANGEROUS_SIGNATURES = [
  // Executable files
  Buffer.from([0x4D, 0x5A]), // PE/EXE
  Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF
  Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), // Mach-O
  
  // Scripts
  Buffer.from('<?php'), // PHP
  Buffer.from('<script'), // JavaScript/HTML
  Buffer.from('#!/bin/'), // Shell scripts
  
  // Office macros (simplified check)
  Buffer.from('Microsoft Office'), // Office files with potential macros
]

/**
 * Check if file buffer starts with dangerous signatures
 */
function hasDangerousSignature(buffer) {
  if (!buffer || buffer.length < 4) return false
  
  return DANGEROUS_SIGNATURES.some(signature => {
    if (buffer.length < signature.length) return false
    return buffer.subarray(0, signature.length).equals(signature)
  })
}

/**
 * Validate file type by checking both MIME type and file signature
 */
async function validateFileType(buffer, originalMimeType, filename) {
  try {
    // Check file signature using file-type library
    const detectedType = await fileTypeFromBuffer(buffer)
    
    if (!detectedType) {
      // For text files, file-type might not detect anything
      if (originalMimeType === 'text/plain') {
        // Additional validation for text files
        const text = buffer.toString('utf8', 0, Math.min(1024, buffer.length))
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text)) {
          throw new Error('Text file contains binary data')
        }
        return true
      }
      throw new Error('Unable to determine file type')
    }
    
    // Check if detected MIME type is allowed
    if (!ALLOWED_FILE_TYPES[detectedType.mime]) {
      throw new Error(`File type ${detectedType.mime} is not allowed`)
    }
    
    // Verify MIME type matches what was declared
    if (detectedType.mime !== originalMimeType) {
      console.warn(`MIME type mismatch: declared ${originalMimeType}, detected ${detectedType.mime}`)
      // Use detected type for security
    }
    
    // Check file extension matches MIME type
    const ext = path.extname(filename).toLowerCase()
    const allowedExts = ALLOWED_FILE_TYPES[detectedType.mime]
    if (!allowedExts.includes(ext)) {
      throw new Error(`File extension ${ext} doesn't match MIME type ${detectedType.mime}`)
    }
    
    return true
  } catch (error) {
    throw new Error(`File validation failed: ${error.message}`)
  }
}

/**
 * Scan file content for malicious patterns
 */
function scanFileContent(buffer, mimeType) {
  // Check for dangerous signatures
  if (hasDangerousSignature(buffer)) {
    throw new Error('File contains dangerous signature')
  }
  
  // For text-based files, scan content
  if (mimeType.startsWith('text/') || mimeType === 'application/pdf') {
    const text = buffer.toString('utf8', 0, Math.min(8192, buffer.length))
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Event handlers
      /eval\s*\(/i,
      /document\.write/i,
      /window\.location/i,
      /\.exe\b/i,
      /\.bat\b/i,
      /\.cmd\b/i,
      /\.scr\b/i,
      /\.pif\b/i,
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        throw new Error(`Suspicious content detected: ${pattern}`)
      }
    }
  }
  
  // For images, check for embedded scripts in metadata
  if (mimeType.startsWith('image/')) {
    const text = buffer.toString('utf8')
    if (text.includes('<script') || text.includes('javascript:')) {
      throw new Error('Image contains embedded scripts')
    }
  }
  
  return true
}

/**
 * Generate secure filename
 */
function generateSecureFilename(originalName, userId) {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  const ext = path.extname(originalName).toLowerCase()
  const baseName = sanitizeFilename(path.basename(originalName, ext))
  
  return `${userId}_${timestamp}_${random}_${baseName}${ext}`
}

/**
 * Multer storage configuration
 */
const storage = multer.memoryStorage()

/**
 * File filter function
 */
function fileFilter(req, file, cb) {
  try {
    // Check MIME type
    if (!ALLOWED_FILE_TYPES[file.mimetype]) {
      return cb(new Error(`File type ${file.mimetype} is not allowed`), false)
    }
    
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExts = ALLOWED_FILE_TYPES[file.mimetype]
    if (!allowedExts.includes(ext)) {
      return cb(new Error(`File extension ${ext} doesn't match MIME type ${file.mimetype}`), false)
    }
    
    // Sanitize filename
    file.originalname = sanitizeFilename(file.originalname)
    
    cb(null, true)
  } catch (error) {
    cb(error, false)
  }
}

/**
 * Create multer upload middleware
 */
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_REQUEST,
    fields: 10,
    fieldNameSize: 100,
    fieldSize: 1024 * 1024, // 1MB for field values
  },
  fileFilter
})

/**
 * Enhanced file validation middleware
 */
function validateUploadedFiles(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next()
  }
  
  const validationPromises = req.files.map(async (file) => {
    try {
      // Validate file type by signature
      await validateFileType(file.buffer, file.mimetype, file.originalname)
      
      // Scan file content
      scanFileContent(file.buffer, file.mimetype)
      
      // Generate secure filename
      file.secureFilename = generateSecureFilename(file.originalname, req.user?.id || 'anonymous')
      
      // Add file hash for deduplication
      file.hash = crypto.createHash('sha256').update(file.buffer).digest('hex')
      
      console.log(`File validated: ${file.originalname} -> ${file.secureFilename}`)
      
      return file
    } catch (error) {
      throw new Error(`File "${file.originalname}": ${error.message}`)
    }
  })
  
  Promise.all(validationPromises)
    .then(() => next())
    .catch((error) => {
      console.error('File validation error:', error.message)
      res.status(400).json({
        error: error.message,
        code: 'FILE_VALIDATION_FAILED'
      })
    })
}

/**
 * File upload endpoint middleware
 */
function createFileUploadMiddleware(options = {}) {
  const fieldName = options.fieldName || 'files'
  const maxFiles = options.maxFiles || MAX_FILES_PER_REQUEST
  
  return [
    upload.array(fieldName, maxFiles),
    validateUploadedFiles
  ]
}

/**
 * Single file upload middleware
 */
function createSingleFileUploadMiddleware(fieldName = 'file') {
  return [
    upload.single(fieldName),
    (req, res, next) => {
      if (req.file) {
        req.files = [req.file] // Normalize to array for validation
      }
      next()
    },
    validateUploadedFiles
  ]
}

module.exports = {
  upload,
  validateUploadedFiles,
  createFileUploadMiddleware,
  createSingleFileUploadMiddleware,
  validateFileType,
  scanFileContent,
  generateSecureFilename,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_REQUEST
}
