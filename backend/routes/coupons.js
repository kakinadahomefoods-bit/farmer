import express from 'express'
import Coupon from '../models/Coupon.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json(coupons)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json(coupon)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' })
    res.json(coupon)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id)
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' })
    res.json({ message: 'Coupon deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle-active', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' })
    coupon.isActive = !coupon.isActive
    await coupon.save()
    res.json(coupon)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/validate', async (req, res) => {
  try {
    const { code, cartValue, cartItems } = req.body
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })
    if (!coupon) return res.json({ valid: false, error: 'Invalid coupon' })
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return res.json({ valid: false, error: 'Coupon expired' })
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.json({ valid: false, error: 'Usage limit reached' })
    if (cartValue < coupon.minPurchase) return res.json({ valid: false, error: `Minimum ₹${coupon.minPurchase} required` })

    if (coupon.type !== 'universal' && Array.isArray(cartItems) && cartItems.length > 0) {
      const hasGrocery = cartItems.some(item => !item.isCombo)
      const hasCombo = cartItems.some(item => item.isCombo)
      if (coupon.type === 'grocery' && !hasGrocery) return res.json({ valid: false, error: 'This coupon is valid only for grocery products' })
      if (coupon.type === 'combo' && !hasCombo) return res.json({ valid: false, error: 'This coupon is valid only for combo products' })
    }

    let applicableValue = cartValue
    if (coupon.type === 'grocery' && Array.isArray(cartItems)) {
      applicableValue = cartItems.filter(item => !item.isCombo).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    } else if (coupon.type === 'combo' && Array.isArray(cartItems)) {
      applicableValue = cartItems.filter(item => item.isCombo).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    }

    let discount = coupon.discountType === 'percentage'
      ? Math.round((applicableValue * coupon.discountValue) / 100)
      : coupon.discountValue
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    res.json({ valid: true, coupon, discount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
