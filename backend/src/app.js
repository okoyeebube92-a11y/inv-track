import express from 'express'
import cors from 'cors'
import entryRoutes from './routes/entryRoutes.js'
import exitRoutes from './routes/exitRoutes.js'
import { requireAuth } from './middleware/auth.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/__health', (req, res) => {
  console.log('HEALTH HIT')
  res.json({ status: 'alive' })
})

app.use('/api/entries', requireAuth, entryRoutes)
app.use('/api/exits', requireAuth, exitRoutes)

export default app
