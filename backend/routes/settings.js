import express from 'express'
import SiteSetting from '../models/SiteSetting.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    let settings = await SiteSetting.findOne()
    if (!settings) settings = await SiteSetting.create({})
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await SiteSetting.findOne()
    if (!settings) settings = new SiteSetting()
    Object.assign(settings, req.body)
    await settings.save()
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
