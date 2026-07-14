import express from 'express'
import Farmer from '../models/Farmer.js'
import QRCode from '../models/QRCode.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'
import QRCodeLib from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { approved } = req.query
    const query = approved === 'true' ? { isActive: true, isApproved: true } : {}
    const farmers = await Farmer.find(query).sort({ createdAt: -1 })
    res.json(farmers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query
    const query = {}
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }, { village: { $regex: search, $options: 'i' } }]
    if (status) query.status = status
    const total = await Farmer.countDocuments(query)
    const farmers = await Farmer.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    res.json({ data: farmers, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
    res.json(farmer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const farmer = await Farmer.create(req.body)
    res.status(201).json(farmer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
    res.json(farmer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
    for (const publicId of farmer.cloudinaryPublicIds || []) {
      await deleteFromCloudinary(publicId)
    }
    await QRCode.deleteMany({ farmer: req.params.id })
    await Farmer.findByIdAndDelete(req.params.id)
    res.json({ message: 'Farmer deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, isApproved: req.body.status === 'approved' },
      { new: true }
    )
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
    res.json(farmer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id/qr', protect, adminOnly, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' })
    let qr = await QRCode.findOne({ farmer: req.params.id, isActive: true })
    if (!qr) {
      const code = uuidv4().slice(0, 8).toUpperCase()
      const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/farmers/${code}`
      const qrImage = await QRCodeLib.toDataURL(url)
      qr = await QRCode.create({ farmer: req.params.id, code, url, qrImage })
    }
    res.json(qr)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/qr/regenerate', protect, adminOnly, async (req, res) => {
  try {
    await QRCode.updateMany({ farmer: req.params.id }, { isActive: false })
    const code = uuidv4().slice(0, 8).toUpperCase()
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/farmers/${code}`
    const qrImage = await QRCodeLib.toDataURL(url)
    const qr = await QRCode.create({ farmer: req.params.id, code, url, qrImage })
    res.json(qr)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/qr/toggle', protect, adminOnly, async (req, res) => {
  try {
    const qr = await QRCode.findOne({ farmer: req.params.id, isActive: true })
    if (!qr) return res.status(404).json({ error: 'No active QR found' })
    qr.isActive = !qr.isActive
    await qr.save()
    res.json(qr)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
