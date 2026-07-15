import express from 'express'
import User from '../models/User.js'
import SiteSetting from '../models/SiteSetting.js'

const router = express.Router()

router.post('/seed', async (req, res) => {
  try {
    const { secret } = req.body
    if (secret !== 'haifarmer-seed-2026') return res.status(401).json({ error: 'Invalid secret' })

    const results = []
    const adminExists = await User.findOne({ role: 'admin' })
    if (!adminExists) {
      await User.create({ email: 'admin@haifarmer.com', password: 'Admin@123', fullName: 'HAiFarmer Admin', role: 'admin' })
      results.push('Admin user created: admin@haifarmer.com / Admin@123')
    } else {
      results.push('Admin user already exists')
    }

    const settingsExists = await SiteSetting.findOne()
    if (!settingsExists) {
      await SiteSetting.create({})
      results.push('Default settings created')
    } else {
      results.push('Settings already exist')
    }

    res.json({ message: results.join(' | ') })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
