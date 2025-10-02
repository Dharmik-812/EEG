const request = require('supertest')
const app = require('../index')

function uniq(s) {
  return `${s}_${Date.now()}_${Math.floor(Math.random()*1e6)}`
}

describe('DM flows', () => {
  it('sends a DM from user A to user B and lists it in /dms and thread messages', async () => {
    // Register A
    const emailA = uniq('a') + '@test.com'
    const regA = await request(app).post('/auth/register').send({ name: 'Alice', email: emailA, password: 'password123' }).expect(200)
    const tokenA = regA.body.token
    const userA = regA.body.user

    // Register B
    const emailB = uniq('b') + '@test.com'
    const regB = await request(app).post('/auth/register').send({ name: 'Bob', email: emailB, password: 'password123' }).expect(200)
    const userB = regB.body.user

    // A -> B send message
    const send = await request(app)
      .post(`/dms/${userB.id}/messages`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'hello Bob!' })
      .expect(200)

    expect(send.body).toHaveProperty('threadKey')

    // A lists conversations
    const conv = await request(app)
      .get('/dms')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    expect(Array.isArray(conv.body.conversations)).toBe(true)
    const mine = conv.body.conversations.find(c => c.otherUserId === userB.id)
    expect(mine).toBeTruthy()
    expect(mine.lastMessage.content).toBe('hello Bob!')

    // Fetch thread messages
    const msgs = await request(app)
      .get(`/dms/${send.body.threadKey}/messages`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    expect(Array.isArray(msgs.body.messages)).toBe(true)
    expect(msgs.body.messages.length).toBeGreaterThanOrEqual(1)
    expect(msgs.body.messages[msgs.body.messages.length - 1].content).toBe('hello Bob!')
  })
})
