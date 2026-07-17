import express from 'express'
import Bundle from '../models/Bundle.js'
import Product from '../models/Product.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { combo } = req.query
    const query = { isActive: true }
    if (combo === 'true') query.isCombo = true
    const bundles = await Bundle.find(query).populate('items.product', 'name images slug basePrice').sort({ createdAt: -1 })
    res.json(bundles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const bundles = await Bundle.find().populate('items.product', 'name images slug basePrice').sort({ createdAt: -1 })
    res.json(bundles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const bundle = await Bundle.findOne({ slug: req.params.slug }).populate('items.product', 'name images slug basePrice discountPercent')
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' })
    res.json(bundle)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const bundle = await Bundle.create(req.body)
    const populated = await Bundle.findById(bundle._id).populate('items.product', 'name images slug basePrice')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('items.product', 'name images slug basePrice')
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' })
    res.json(bundle)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id)
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' })
    if (bundle.cloudinaryPublicId) await deleteFromCloudinary(bundle.cloudinaryPublicId)
    await Bundle.findByIdAndDelete(req.params.id)
    res.json({ message: 'Bundle deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle-active', protect, adminOnly, async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id)
    if (!bundle) return res.status(404).json({ error: 'Bundle not found' })
    bundle.isActive = !bundle.isActive
    await bundle.save()
    res.json(bundle)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router