import mongoose from 'mongoose'
import app from '../backend/app.js'

let cached = global._mongooseCache
if (!cached) cached = global._mongooseCache = { conn: null }

async function connectDB() {
  if (cached.conn) return cached.conn
  try {
    cached.conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    })
    console.log('MongoDB connected')
  } catch (err) {
    cached.conn = null
    console.error('MongoDB connection failed:', err.message)
  }
  return cached.conn
}

connectDB()

export default async function handler(req, res) {
  if (!cached.conn) {
    try {
      await connectDB()
    } catch {}
    if (!cached.conn) {
      res.status(503).json({ error: 'Database not connected. Check MONGODB_URI env var and Atlas IP whitelist.' })
      return
    }
  }
  app(req, res)
}
