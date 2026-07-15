import app from '../backend/app.js'
import { ensureDB } from '../backend/lib/mongoose.js'

export default async function handler(req, res) {
  if (!(await ensureDB())) {
    res.status(503).json({ error: 'Database not connected. Check MONGODB_URI env var and Atlas IP whitelist.' })
    return
  }
  app(req, res)
}
