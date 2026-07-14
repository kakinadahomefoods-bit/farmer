import express from 'express'
import Category from '../models/Category.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.create(req.body)
    res.status(201).json(category)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!category) return res.status(404).json({ error: 'Category not found' })
    res.json(category)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ error: 'Category not found' })
    if (category.cloudinaryPublicId) await deleteFromCloudinary(category.cloudinaryPublicId)
    category.isActive = false
    await category.save()
    res.json({ message: 'Category hidden successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle-active', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ error: 'Category not found' })
    category.isActive = !category.isActive
    await category.save()
    res.json(category)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { orders } = req.body
    for (const { id, order } of orders) {
      await Category.findByIdAndUpdate(id, { order })
    }
    res.json({ message: 'Categories reordered' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
