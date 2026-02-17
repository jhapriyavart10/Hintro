import request from 'supertest'
import express from 'express'
import { createServer } from 'http'

// Mock app setup
const app = express()
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

describe('API Health Check', () => {
  let server

  beforeAll((done) => {
    server = createServer(app)
    server.listen(done)
  })

  afterAll((done) => {
    server.close(done)
  })

  it('should return 200 OK', async () => {
    const res = await request(server).get('/api/health')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('status', 'ok')
  })
})