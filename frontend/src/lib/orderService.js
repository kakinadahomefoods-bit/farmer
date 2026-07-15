import { supabase } from './supabase'

export async function getOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*), variant:product_variants(*), bundle:bundles(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*), variant:product_variants(*), bundle:bundles(*)), addresses(*)')
    .eq('id', orderId)
    .single()
  if (error) throw error
  return data
}

export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      user_id: orderData.user_id || null,
      items: orderData.items,
      total: orderData.total,
      shipping_cost: orderData.shipping_cost || 0,
      coupon_discount: orderData.coupon_discount || 0,
      coupon_code: orderData.coupon_code || null,
      payment_id: orderData.payment_id || null,
      status: orderData.status || 'pending',
      payment_method: orderData.payment_method || 'whatsapp',
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStock(orderItems) {
  for (const item of orderItems) {
    if (item.variant_id) {
      await supabase
        .from('product_variants')
        .update({ stock_quantity: item.variant.stock_quantity - item.quantity })
        .eq('id', item.variant_id)
    }
  }
}
