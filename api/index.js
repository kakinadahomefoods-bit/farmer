import mongoose from 'mongoose'
import app from '../backend/app.js'

let cached = global._mongooseCache
if (!cached) cached = global._mongooseCache = { conn: null, promise: null }

async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    }).then(m => m)
  }
  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    console.error('MongoDB connection failed:', err.message)
  }
  return cached.conn
}

connectDB()

export default app
