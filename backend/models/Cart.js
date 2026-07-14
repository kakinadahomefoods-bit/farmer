import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  variantName: String,
  variantWeightLabel: String,
  quantity: { type: Number, required: true, min: 1 },
  price: Number,
  image: String,
  isBundle: { type: Boolean, default: false },
  bundleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bundle' },
  bundleData: mongoose.Schema.Types.Mixed,
})

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    type: String,
  },
}, { timestamps: true })

export default mongoose.model('Cart', cartSchema)
