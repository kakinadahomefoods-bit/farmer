import express from 'express'
import Banner from '../models/Banner.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

function buildActiveQuery(query) {
  const now = new Date()
  return {
    ...query,
    $and: [
      { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
    ],
  }
}

router.get('/', async (req, res) => {
  try {
    const { position } = req.query
    const query = buildActiveQuery({ isActive: true })
    if (position) query.position = position
    const banners = await Banner.find(query).sort({ order: 1 })
    res.json(banners)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 })
    res.json(banners)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.create(req.body)
    res.status(201).json(banner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    res.json(banner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    const publicIds = [
      banner.cloudinaryPublicId,
      banner.desktopPublicId,
      banner.tabletPublicId,
      banner.mobilePublicId,
    ].filter(Boolean)
    await Promise.all(publicIds.map(deleteFromCloudinary))
    await Banner.findByIdAndDelete(req.params.id)
    res.json({ message: 'Banner deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle-active', protect, adminOnly, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) return res.status(404).json({ error: 'Banner not found' })
    banner.isActive = !banner.isActive
    await banner.save()
    res.json(banner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
