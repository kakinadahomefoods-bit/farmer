import mongoose from 'mongoose'

let cached = global._mongooseCache
if (!cached) cached = global._mongooseCache = { conn: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  try {
    cached.conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    })
  } catch (err) {
    cached.conn = null
    console.error('MongoDB connection failed:', err.message)
  }
  return cached.conn
}

connectDB()

export async function ensureDB() {
  if (!cached.conn) {
    try {
      await connectDB()
    } catch {}
    if (!cached.conn) return false
  }
  return true
}
