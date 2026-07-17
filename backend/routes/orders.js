import express from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Cart from '../models/Cart.js'
import Coupon from '../models/Coupon.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const query = {}
    if (status) query.status = status
    const total = await Order.countDocuments(query)
    const orders = await Order.find(query)
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    res.json({ data: orders, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [
      totalOrders, todayOrders, pendingOrders,
      deliveredOrders, cancelledOrders, revenue,
      todayRevenue, totalCustomers
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      (await import('../models/User.js')).default.countDocuments({ role: 'customer' }),
    ])
    res.json({
      totalOrders, todayOrders, pendingOrders, deliveredOrders, cancelledOrders,
      totalRevenue: revenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalCustomers,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/recent', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(10)
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/sales-graph', protect, adminOnly, async (req, res) => {
  try {
    const days = 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const data = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('items.product', 'name images slug')
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images slug basePrice discountPercent')
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' })

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    const shippingCost = req.body.shippingCost || 0
    const couponDiscount = cart.coupon?.discount || 0
    const total = Math.max(0, subtotal + shippingCost - couponDiscount)

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product?._id,
        variantId: item.variantId,
        variantName: item.variantName,
        name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        isBundle: item.isBundle,
        bundleId: item.bundleId,
      })),
      shippingAddress: req.body.shippingAddress,
      subtotal,
      shippingCost,
      couponDiscount,
      couponCode: cart.coupon?.code,
      total,
      paymentMethod: req.body.paymentMethod || 'whatsapp',
      status: 'pending',
    })

    if (cart.coupon?.code) {
      const coupon = await Coupon.findOne({ code: cart.coupon.code })
      if (coupon) {
        coupon.usedCount += 1
        if (coupon.oneUsePerUser) coupon.usedBy.push(req.user._id)
        await coupon.save()
      }
    }

    for (const item of cart.items) {
      if (item.product && item.variantId) {
        await Product.updateOne(
          { _id: item.product._id, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': -item.quantity, totalSold: item.quantity } }
        )
      }
    }

    cart.items = []
    cart.coupon = null
    await cart.save()

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/direct', async (req, res) => {
  try {
    const { items, total, shippingCost, couponDiscount, couponCode, paymentMethod, shippingAddress, guestInfo, paymentId } = req.body
    if (!items || items.length === 0) return res.status(400).json({ error: 'Order must have items' })
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    const order = await Order.create({
      user: req.user?._id,
      items: items.map(item => ({
        name: item.name,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      guestInfo: guestInfo || {},
      shippingAddress: shippingAddress || {},
      subtotal,
      shippingCost: shippingCost || 0,
      couponDiscount: couponDiscount || 0,
      couponCode: couponCode || null,
      total: total || subtotal + (shippingCost || 0) - (couponDiscount || 0),
      paymentMethod: paymentMethod || 'whatsapp',
      paymentStatus: paymentId ? 'paid' : 'pending',
      paymentId: paymentId || null,
      status: 'pending',
    })
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body
    const update = { status }
    if (status === 'delivered') update.deliveredAt = new Date()
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
