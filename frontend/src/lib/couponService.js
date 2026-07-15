import { supabase } from './supabase'

export async function validateCoupon(code, cartValue) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('coupon_code', code)
    .single()
  if (error) throw error
  if (!data || !data.is_active) throw new Error('Coupon is invalid or inactive')
  if (new Date(data.expiry_date) < new Date()) throw new Error('Coupon has expired')
  if (cartValue < data.min_cart_value) throw new Error(`Minimum cart value is ₹${data.min_cart_value} to redeem this coupon`)
  return data
}

export async function applyCoupon(code, cartValue) {
  try {
    const coupon = await validateCoupon(code, cartValue)
    return { valid: true, coupon }
  } catch (err) {
    return { valid: false, error: err.message }
  }
}

export function getCouponDiscount(coupon, cartValue) {
  if (!coupon) return 0
  if (coupon.discount_type === 'percentage') {
    const disc = Math.round((cartValue * coupon.discount_value) / 100)
    return coupon.max_discount ? Math.min(disc, coupon.max_discount) : disc
  }
  return coupon.discount_value || 0
}
