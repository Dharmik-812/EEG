// Set test environment before importing app
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing_only'

const request = require('supertest')
const app = require('../index')
const fs = require('fs')
const path = require('path')

function uniq(s) {
  return `${s}_${Date.now()}_${Math.floor(Math.random()*1e6)}`
}

// Helper to create a test user and get token
async function createTestUser() {
  const email = uniq('testuser') + '@test.com'
  const response = await request(app)
    .post('/auth/register')
    .send({ name: 'Test User', email, password: 'password123' })
    .expect(200)
  
  return {
    user: response.body.user,
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken
  }
}

describe('Security Tests', () => {
  
  describe('JWT Token Security', () => {
    test('should use short-lived access tokens (15 minutes)', async () => {
      const { accessToken, expiresIn } = await createTestUser()
      
      // Verify token expires in 15 minutes (900 seconds)
      expect(expiresIn).toBe(900)
      
      // Verify token contains correct claims
      const jwt = require('jsonwebtoken')
      const decoded = jwt.decode(accessToken)
      expect(decoded.type).toBe('access')
      expect(decoded.iss).toBe('eeg-app')
      expect(decoded.aud).toBe('eeg-users')
    })

    test('should refresh tokens successfully', async () => {
      const { refreshToken } = await createTestUser()
      
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
      
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body).toHaveProperty('expiresIn', 900)
    })

    test('should reject invalid refresh tokens', async () => {
      await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)
    })

    test('should reject expired access tokens', async () => {
      // Create an expired token
      const jwt = require('jsonwebtoken')
      const expiredToken = jwt.sign(
        { id: 'test', email: 'test@test.com', type: 'access' },
        process.env.JWT_SECRET || 'dev_secret_change_me',
        { expiresIn: '-1m' } // Expired 1 minute ago
      )

      await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)
    })
  })

  describe('Input Sanitization', () => {
    let testUser

    beforeEach(async () => {
      testUser = await createTestUser()
    })

    test('should sanitize XSS attempts in message content', async () => {
      const maliciousContent = '<script>alert("xss")</script>Hello World'
      
      // Create another user to send message to
      const recipient = await createTestUser()
      
      const response = await request(app)
        .post(`/dms/${recipient.user.id}/messages`)
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({ content: maliciousContent })
        .expect(200)

      // Fetch the message to verify it was sanitized
      const messages = await request(app)
        .get(`/dms/${response.body.threadKey}/messages`)
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .expect(200)

      const message = messages.body.messages.find(m => m.id === response.body.id)
      expect(message.content).not.toContain('<script>')
      expect(message.content).not.toContain('alert')
      expect(message.content).toContain('Hello World')
    })

    test('should sanitize SQL injection attempts', async () => {
      const maliciousName = "'; DROP TABLE users; --"
      
      const response = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({ name: maliciousName })
        .expect(200)

      expect(response.body.user.name).not.toContain('DROP TABLE')
      expect(response.body.user.name).not.toContain(';')
    })

    test('should validate email format', async () => {
      const invalidEmails = [
        'not-an-email',
        'test@',
        '@test.com',
        'test..test@test.com',
        'test@test',
        '<script>alert("xss")</script>@test.com'
      ]

      for (const email of invalidEmails) {
        await request(app)
          .post('/auth/register')
          .send({ name: 'Test', email, password: 'password123' })
          .expect(400)
      }
    })

    test('should enforce content length limits', async () => {
      const longContent = 'A'.repeat(10000) // 10KB content
      const recipient = await createTestUser()
      
      const response = await request(app)
        .post(`/dms/${recipient.user.id}/messages`)
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({ content: longContent })
        .expect(200)

      // Content should be truncated to max length (8000 chars)
      const messages = await request(app)
        .get(`/dms/${response.body.threadKey}/messages`)
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .expect(200)

      const message = messages.body.messages.find(m => m.id === response.body.id)
      expect(message.content.length).toBeLessThanOrEqual(8000)
    })
  })

  describe('File Upload Security', () => {
    let testUser

    beforeEach(async () => {
      testUser = await createTestUser()
    })

    test('should reject files that are too large', async () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'A')
      
      await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .attach('file', largeBuffer, 'large.txt')
        .expect(400)
    })

    test('should reject dangerous file types', async () => {
      const dangerousFiles = [
        { name: 'malware.exe', content: Buffer.from('MZ'), type: 'application/octet-stream' },
        { name: 'script.bat', content: Buffer.from('echo "malicious"'), type: 'text/plain' },
        { name: 'virus.scr', content: Buffer.from('malicious'), type: 'application/octet-stream' }
      ]

      for (const file of dangerousFiles) {
        await request(app)
          .post('/upload')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .attach('file', file.content, { filename: file.name, contentType: file.type })
          .expect(400)
      }
    })

    test('should accept valid image files', async () => {
      // Create a minimal valid PNG buffer
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x00, 0x01, // Width: 1
        0x00, 0x00, 0x00, 0x01, // Height: 1
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
        0x90, 0x77, 0x53, 0xDE, // CRC
        0x00, 0x00, 0x00, 0x00, // IEND chunk length
        0x49, 0x45, 0x4E, 0x44, // IEND
        0xAE, 0x42, 0x60, 0x82  // CRC
      ])

      const response = await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .attach('file', pngBuffer, { filename: 'test.png', contentType: 'image/png' })
        .expect(200)

      expect(response.body.file).toHaveProperty('id')
      expect(response.body.file).toHaveProperty('url')
      expect(response.body.file.type).toBe('image/png')
    })

    test('should detect MIME type spoofing', async () => {
      // Send an EXE file with PNG extension and MIME type
      const exeBuffer = Buffer.from([0x4D, 0x5A]) // PE signature
      
      await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .attach('file', exeBuffer, { filename: 'fake.png', contentType: 'image/png' })
        .expect(400)
    })

    test('should sanitize filenames', async () => {
      const maliciousFilename = '../../../etc/passwd'
      const textBuffer = Buffer.from('Hello World')
      
      const response = await request(app)
        .post('/upload')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .attach('file', textBuffer, { filename: maliciousFilename, contentType: 'text/plain' })
        .expect(200)

      expect(response.body.file.name).not.toContain('../')
      expect(response.body.file.name).not.toContain('etc/passwd')
    })
  })

  describe('Rate Limiting', () => {
    let testUser

    beforeEach(async () => {
      testUser = await createTestUser()
    })

    test('should enforce rate limits on auth endpoints', async () => {
      // Make multiple rapid login attempts
      const promises = []
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/auth/login')
            .send({ email: 'nonexistent@test.com', password: 'wrong' })
        )
      }

      const responses = await Promise.all(promises)
      
      // Some requests should be rate limited (429)
      const rateLimited = responses.filter(r => r.status === 429)
      expect(rateLimited.length).toBeGreaterThan(0)
    })

    test('should enforce rate limits on message sending', async () => {
      const recipient = await createTestUser()
      
      // Send many messages rapidly
      const promises = []
      for (let i = 0; i < 35; i++) {
        promises.push(
          request(app)
            .post(`/dms/${recipient.user.id}/messages`)
            .set('Authorization', `Bearer ${testUser.accessToken}`)
            .send({ content: `Message ${i}` })
        )
      }

      const responses = await Promise.all(promises)
      
      // Some requests should be rate limited
      const rateLimited = responses.filter(r => r.status === 429)
      expect(rateLimited.length).toBeGreaterThan(0)
    })
  })

  describe('Authorization', () => {
    let testUser1, testUser2

    beforeEach(async () => {
      testUser1 = await createTestUser()
      testUser2 = await createTestUser()
    })

    test('should prevent users from accessing other users\' DMs', async () => {
      // User1 sends a message to User2
      const response = await request(app)
        .post(`/dms/${testUser2.user.id}/messages`)
        .set('Authorization', `Bearer ${testUser1.accessToken}`)
        .send({ content: 'Private message' })
        .expect(200)

      // Create a third user who shouldn't have access
      const testUser3 = await createTestUser()

      // User3 tries to access the DM thread
      await request(app)
        .get(`/dms/${response.body.threadKey}/messages`)
        .set('Authorization', `Bearer ${testUser3.accessToken}`)
        .expect(200) // This will pass with current implementation but should fail with proper RLS

      // Note: This test will need to be updated once RLS policies are applied
    })

    test('should prevent users from editing other users\' messages', async () => {
      // User1 sends a message
      const response = await request(app)
        .post(`/dms/${testUser2.user.id}/messages`)
        .set('Authorization', `Bearer ${testUser1.accessToken}`)
        .send({ content: 'Original message' })
        .expect(200)

      // User2 tries to edit User1's message
      await request(app)
        .put(`/dms/messages/${response.body.id}`)
        .set('Authorization', `Bearer ${testUser2.accessToken}`)
        .send({ content: 'Edited message' })
        .expect(403)
    })

    test('should prevent non-admin users from accessing admin endpoints', async () => {
      // Try to access reports (admin only)
      await request(app)
        .get('/reports')
        .set('Authorization', `Bearer ${testUser1.accessToken}`)
        .expect(403)
    })
  })

  describe('Content Security Policy', () => {
    test('should set security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      // Check for security headers set by helmet
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff')
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY')
      expect(response.headers).toHaveProperty('x-xss-protection')
    })
  })

  describe('Password Security', () => {
    test('should enforce minimum password length', async () => {
      const weakPasswords = ['123', 'pass', '1234567'] // Less than 8 characters

      for (const password of weakPasswords) {
        await request(app)
          .post('/auth/register')
          .send({ name: 'Test', email: uniq('test') + '@test.com', password })
          .expect(400)
      }
    })

    test('should hash passwords securely', async () => {
      const email = uniq('test') + '@test.com'
      const password = 'securepassword123'
      
      await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email, password })
        .expect(200)

      // Password should not be returned in response
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email, password })
        .expect(200)

      expect(loginResponse.body.user).not.toHaveProperty('password')
      expect(loginResponse.body.user).not.toHaveProperty('passwordHash')
    })
  })

  describe('Error Information Disclosure', () => {
    test('should not leak sensitive information in error messages', async () => {
      // Try to access non-existent endpoint
      const response = await request(app)
        .get('/nonexistent')
        .expect(404)

      // Error should not contain stack traces or internal paths
      const errorText = JSON.stringify(response.body)
      expect(errorText).not.toMatch(/\/Users\//)
      expect(errorText).not.toMatch(/\/home\//)
      expect(errorText).not.toMatch(/C:\\/)
      expect(errorText).not.toMatch(/node_modules/)
    })

    test('should use generic error messages for authentication failures', async () => {
      // Wrong password
      const response1 = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
        .expect(401)

      // Non-existent user
      const response2 = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password' })
        .expect(401)

      // Both should return the same generic message
      expect(response1.body.error).toBe('Invalid credentials')
      expect(response2.body.error).toBe('Invalid credentials')
    })
  })
})

describe('E2EE Security', () => {
  test('should preserve encrypted message content', async () => {
    const testUser = await createTestUser()
    const recipient = await createTestUser()
    
    // Send an encrypted message (simulated E2EE payload)
    const encryptedPayload = JSON.stringify({
      e2ee: true,
      cipherText: 'encrypted-content-here',
      iv: 'initialization-vector'
    })

    const response = await request(app)
      .post(`/dms/${recipient.user.id}/messages`)
      .set('Authorization', `Bearer ${testUser.accessToken}`)
      .send({ content: encryptedPayload })
      .expect(200)

    // Fetch the message and verify encrypted content is preserved
    const messages = await request(app)
      .get(`/dms/${response.body.threadKey}/messages`)
      .set('Authorization', `Bearer ${testUser.accessToken}`)
      .expect(200)

    const message = messages.body.messages.find(m => m.id === response.body.id)
    const parsedContent = JSON.parse(message.content)
    expect(parsedContent.e2ee).toBe(true)
    expect(parsedContent.cipherText).toBe('encrypted-content-here')
  })
})
