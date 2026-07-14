import express from 'express'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images slug basePrice discountPercent')
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] })
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/add', protect, async (req, res) => {
  try {
    const { productId, variantId, quantity = 1, isBundle, bundleId } = req.body
    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] })

    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    const variant = product.variants.id(variantId)
    const existingIdx = cart.items.findIndex(item =>
      String(item.product) === productId &&
      String(item.variantId) === variantId &&
      item.isBundle === !!isBundle
    )

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity
    } else {
      cart.items.push({
        product: productId,
        variantId,
        variantName: variant?.name,
        variantWeightLabel: variant?.weightLabel,
        quantity,
        price: variant?.price || product.basePrice,
        image: product.images?.[0],
        isBundle: !!isBundle,
        bundleId,
      })
    }
    await cart.save()
    await cart.populate('items.product', 'name images slug basePrice discountPercent')
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ error: 'Cart not found' })
    const item = cart.items.id(req.params.itemId)
    if (!item) return res.status(404).json({ error: 'Item not found' })
    if (quantity <= 0) {
      cart.items.pull({ _id: req.params.itemId })
    } else {
      item.quantity = quantity
    }
    await cart.save()
    await cart.populate('items.product', 'name images slug basePrice discountPercent')
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ error: 'Cart not found' })
    cart.items.pull({ _id: req.params.itemId })
    await cart.save()
    await cart.populate('items.product', 'name images slug basePrice discountPercent')
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null })
    res.json({ message: 'Cart cleared' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/apply-coupon', protect, async (req, res) => {
  try {
    const { code } = req.body
    const Coupon = (await import('../models/Coupon.js')).default
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })
    if (!coupon) return res.status(400).json({ error: 'Invalid coupon' })
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ error: 'Coupon expired' })
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' })
    if (coupon.oneUsePerUser && coupon.usedBy.includes(req.user._id)) return res.status(400).json({ error: 'Coupon already used' })

    const cart = await Cart.findOne({ user: req.user._id })
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    if (subtotal < coupon.minPurchase) return res.status(400).json({ error: `Minimum purchase of ₹${coupon.minPurchase} required` })

    let discount = coupon.discountType === 'percentage'
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)

    cart.coupon = { code: coupon.code, discount, type: coupon.discountType }
    await cart.save()
    res.json({ cart, discount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/remove-coupon', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    cart.coupon = null
    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
