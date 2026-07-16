import { api } from './api'

export async function validateCoupon(code, cartValue, cartItems) {
  const result = await api.validateCoupon(code, cartValue, cartItems)
  if (!result.valid) throw new Error(result.error)
  return result
}

export async function applyCoupon(code, cartValue, cartItems) {
  try {
    const result = await api.validateCoupon(code, cartValue, cartItems)
    return result
  } catch (err) {
    return { valid: false, error: err.message }
  }
}

export function getCouponDiscount(coupon, cartValue) {
  if (!coupon) return 0
  if (coupon.discountType === 'percentage') {
    const disc = Math.round((cartValue * coupon.discountValue) / 100)
    return coupon.maxDiscount ? Math.min(disc, coupon.maxDiscount) : disc
  }
  return coupon.discountValue || 0
}
