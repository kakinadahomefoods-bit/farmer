import mongoose from 'mongoose'

const qrCodeSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  code: { type: String, unique: true, required: true },
  url: { type: String },
  qrImage: String,
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
}, { timestamps: true })

qrCodeSchema.index({ code: 1 })
qrCodeSchema.index({ farmer: 1 })

export default mongoose.model('QRCode', qrCodeSchema)
