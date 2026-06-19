import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import chatRouter from './routes/chat.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: join(__dirname, '../.env') })

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/chat', chatRouter)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO')
})
