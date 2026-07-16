import express from 'express'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search, sort, featured, active } = req.query
    const query = {}
    if (category) query.category = category
    if (search) query.$text = { $search: search }
    if (featured === 'true') query.isFeatured = true
    if (active === 'true' || !active) query.isActive = true
    if (active === 'all') delete query.isActive

    let sortObj = { displayOrder: 1, createdAt: -1 }
    if (sort === 'price') sortObj = { basePrice: 1 }
    else if (sort === 'price_desc') sortObj = { basePrice: -1 }
    else if (sort === 'name') sortObj = { name: 1 }
    else if (sort === 'sold') sortObj = { totalSold: -1 }

    const total = await Product.countDocuments(query)
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ data: products, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isNewArrival: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/best-selling', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ totalSold: -1 })
      .limit(10)
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug')
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    for (const publicId of product.cloudinaryPublicIds || []) {
      await deleteFromCloudinary(publicId)
    }
    product.isActive = false
    await product.save()
    res.json({ message: 'Product hidden successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle-active', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    product.isActive = !product.isActive
    await product.save()
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle-featured', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    product.isFeatured = !product.isFeatured
    await product.save()
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { orders } = req.body
    if (!Array.isArray(orders)) return res.status(400).json({ error: 'orders must be an array' })
    const ops = orders.map(({ id, displayOrder }) =>
      Product.updateOne({ _id: id }, { $set: { displayOrder: Number(displayOrder) } })
    )
    await Promise.all(ops)
    res.json({ message: 'Products reordered' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
