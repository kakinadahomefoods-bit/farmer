import mongoose from 'mongoose'

let cached = global._mongooseCache
if (!cached) cached = global._mongooseCache = { conn: null, error: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!process.env.MONGODB_URI) {
    cached.error = 'MONGODB_URI environment variable is not set'
    return null
  }
  try {
    cached.conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    })
    cached.error = null
  } catch (err) {
    cached.conn = null
    cached.error = err.message
  }
  return cached.conn
}

connectDB()

export async function ensureDB() {
  if (!cached.conn) {
    try { await connectDB() } catch {}
  }
  return cached
}
