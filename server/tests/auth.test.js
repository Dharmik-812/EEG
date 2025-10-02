const request = require('supertest')
const app = require('../index')

function uniq(s) {
  return `${s}_${Date.now()}_${Math.floor(Math.random()*1e6)}`
}

describe('Auth flows', () => {
  it('registers a user and returns token + user, then allows /auth/me', async () => {
    const email = uniq('user') + '@test.com'
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email, password: 'password123' })
      .expect(200)

    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('email', email)

    const me = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${res.body.token}`)
      .expect(200)

    expect(me.body.user).toHaveProperty('email', email)
  })

  it('rejects duplicate registration by email', async () => {
    const email = uniq('dup') + '@test.com'
    await request(app).post('/auth/register').send({ name: 'A', email, password: 'password123' }).expect(200)

    const dup = await request(app).post('/auth/register').send({ name: 'B', email, password: 'password123' }).expect(400)
    expect(dup.body).toHaveProperty('error')
  })

  it('logs in with correct credentials and rejects wrong password', async () => {
    const email = uniq('login') + '@test.com'
    const password = 'password123'
    await request(app).post('/auth/register').send({ name: 'Login User', email, password }).expect(200)

    const ok = await request(app).post('/auth/login').send({ email, password }).expect(200)
    expect(ok.body).toHaveProperty('token')

    await request(app).post('/auth/login').send({ email, password: 'wrong' }).expect(401)
  })
})
