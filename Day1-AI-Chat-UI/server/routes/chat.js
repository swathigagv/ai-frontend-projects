import express from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = express.Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/', async (req, res) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  // Set headers for Server-Sent Events (streaming)
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: 'You are a helpful, friendly AI assistant.',
    messages,  // the full conversation history from the frontend
  })

  // Stream each token to the client as it arrives
  stream.on('text', (text) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`)
  })

  stream.on('finalMessage', () => {
    res.write('data: [DONE]\n\n')
    res.end()
  })

  stream.on('error', (err) => {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  })
})

export default router
