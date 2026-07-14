import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

router.post('/signup', async (req, res) => {
  try {
    const { email, phone, password, fullName } = req.body
    if (!password) return res.status(400).json({ error: 'Password is required' })
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone is required' })
    const existing = await User.findOne({ $or: [{ email }, { phone }] })
    if (existing) return res.status(400).json({ error: 'User already exists' })
    const user = await User.create({ email, phone, password, fullName })
    const token = generateToken(user._id)
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body
    if (!password) return res.status(400).json({ error: 'Password is required' })
    const user = await User.findOne({ $or: [{ email }, { phone }] }).select('+password')
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' })
    if (!user.isActive) return res.status(403).json({ error: 'Account is disabled' })
    user.lastLogin = new Date()
    await user.save()
    const token = generateToken(user._id)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user })
})

router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phone, addresses } = req.body
    const user = await User.findById(req.user._id)
    if (fullName) user.fullName = fullName
    if (phone) user.phone = phone
    if (addresses) user.addresses = addresses
    await user.save()
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
