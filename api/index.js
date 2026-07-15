import app from '../backend/app.js'
import { ensureDB } from '../backend/lib/mongoose.js'

export default async function handler(req, res) {
  const cached = await ensureDB()
  if (!cached.conn) {
    const msg = !process.env.MONGODB_URI
      ? 'MONGODB_URI environment variable is not set in Vercel dashboard'
      : `Database not connected: ${cached.error || 'unknown error'}. Check MONGODB_URI env var and Atlas IP whitelist (0.0.0.0/0).`
    res.status(503).json({ error: msg })
    return
  }
  app(req, res)
}
