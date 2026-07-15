import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const CartContext = createContext(null)

const GUEST_CART_KEY = 'grocery_guest_cart'
const PRODUCT_SELECTIONS_KEY = 'grocery_product_selections'
const BUNDLE_SELECTIONS_KEY = 'grocery_bundle_selections'

function calculateBundlePrice(bundle) {
  const total = (Array.isArray(bundle?.bundle_items) ? bundle.bundle_items : [])
    .reduce((sum, item) => sum + Number(item.variant?.price ?? item.variant_price ?? item.price ?? item.unit_price ?? 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.bundle_discount_percent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.bundle_price || 0)
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [coupon, setCoupon] = useState(null)
  const [productSelections, setProductSelection] = useState(() =>
    JSON.parse(localStorage.getItem(PRODUCT_SELECTIONS_KEY) || '{}')
  )
  const [bundleSelections, setBundleSelection] = useState(() =>
    JSON.parse(localStorage.getItem(BUNDLE_SELECTIONS_KEY) || '{}')
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => { localStorage.setItem(PRODUCT_SELECTIONS_KEY, JSON.stringify(productSelections)) }, [productSelections])
  useEffect(() => { localStorage.setItem(BUNDLE_SELECTIONS_KEY, JSON.stringify(bundleSelections)) }, [bundleSelections])

  useEffect(() => {
    setProductSelection(prev => {
      let changed = false
      const next = { ...prev }
      cartItems.forEach(item => {
        if (!item.product_id || !item.variant_id) return
        const sel = next[item.product_id] || {}
        if (sel.variantId === item.variant_id && sel.quantity === item.quantity) return
        next[item.product_id] = { variantId: item.variant_id, quantity: item.quantity }
        changed = true
      })
      return changed ? next : prev
    })
  }, [cartItems])

  useEffect(() => {
    setBundleSelection(prev => {
      let changed = false
      const next = { ...prev }
      cartItems.forEach(item => {
        if (!item.bundle_id) return
        if ((next[item.bundle_id] || {}).quantity !== item.quantity) {
          next[item.bundle_id] = { quantity: item.quantity }
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [cartItems])

  async function persistGuestCart(items) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  }

  async function mergeGuestCartIntoUser(userId) {
    const guestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
    if (!guestCart.length || !userId) return
    for (const guestItem of guestCart) {
      const { data: existing } = await supabase.from('cart_items').select('*').match({
        user_id: userId, product_id: guestItem.product_id,
        variant_id: guestItem.variant_id, bundle_id: guestItem.bundle_id
      }).single()
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + guestItem.quantity }).eq('id', existing.id)
      } else {
        await supabase.from('cart_items').insert({
          user_id: userId, product_id: guestItem.product_id,
          variant_id: guestItem.variant_id, bundle_id: guestItem.bundle_id,
          quantity: guestItem.quantity
        })
      }
    }
    localStorage.removeItem(GUEST_CART_KEY)
    const { data: refreshed, error } = await supabase.from('cart_items')
      .select('*, product:products(*), variant:product_variants(*), bundle:bundles(*, bundle_items(*, product:products(*), variant:product_variants(*)))')
      .eq('user_id', userId)
    if (!error) setCartItems(refreshed || [])
  }

  useEffect(() => {
    (async () => {
      setLoading(true)
      if (user) {
        const { data, error } = await supabase.from('cart_items')
          .select('*, product:products(*), variant:product_variants(*), bundle:bundles(*, bundle_items(*, product:products(*), variant:product_variants(*)))')
          .eq('user_id', user.id)
        if (!error) setCartItems(data || [])
        await mergeGuestCartIntoUser(user.id)
      } else {
        const guestCart = (JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]') || []).map(item => ({
          id: item.id || crypto.randomUUID(),
          product_id: item.product_id || null,
          variant_id: item.variant_id || null,
          bundle_id: item.bundle_id || null,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          product: item.product || null,
          variant: item.variant || null,
          bundle: item.bundle || null
        }))
        setCartItems(guestCart)
        await persistGuestCart(guestCart)
      }
      setLoading(false)
    })()
  }, [user])

  const addToCart = useCallback(async function(item) {
    const itemData = {
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      bundle_id: item.bundle_id || null,
      quantity: item.quantity
    }
    const fullItem = {
      ...itemData,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      product: item.product || null,
      variant: item.variant || null,
      bundle: item.bundle || null
    }

    if (user) {
      const existing = cartItems.find(e => e.product_id === itemData.product_id && e.variant_id === itemData.variant_id && e.bundle_id === itemData.bundle_id)
      const updated = existing
        ? cartItems.map(e => e === existing ? { ...e, quantity: e.quantity + itemData.quantity } : e)
        : [...cartItems, fullItem]
      setCartItems(updated)

      let serverItem = null
      try {
        const { data } = await supabase.from('cart_items').select('*').match({
          user_id: user.id, product_id: itemData.product_id,
          variant_id: itemData.variant_id, bundle_id: itemData.bundle_id
        }).single()
        if (data) serverItem = data
      } catch {}

      if (serverItem) {
        await supabase.from('cart_items').update({ quantity: serverItem.quantity + itemData.quantity }).eq('id', serverItem.id)
      } else {
        await supabase.from('cart_items').insert({ ...itemData, user_id: user.id })
      }

      try {
        const { data } = await supabase.from('cart_items')
          .select('*, product:products(*), variant:product_variants(*), bundle:bundles(*, bundle_items(*, product:products(*), variant:product_variants(*)))')
          .eq('user_id', user.id)
        if (data) setCartItems(data)
      } catch {}
    } else {
      const existing = cartItems.find(e => e.product_id === itemData.product_id && e.variant_id === itemData.variant_id && e.bundle_id === itemData.bundle_id)
      const updated = existing
        ? cartItems.map(e => e === existing ? { ...e, quantity: e.quantity + itemData.quantity } : e)
        : [...cartItems, fullItem]
      setCartItems(updated)
      await persistGuestCart(updated)
    }
  }, [user, cartItems])

  const removeFromCart = useCallback(async function(itemId) {
    const item = cartItems.find(t => t.id === itemId)
    if (user) {
      await supabase.from('cart_items').delete().eq('id', itemId)
      setCartItems(prev => prev.filter(t => t.id !== itemId))
    } else {
      const updated = cartItems.filter(t => t.id !== itemId)
      setCartItems(updated)
      await persistGuestCart(updated)
    }
    if (item?.product_id) {
      setProductSelection(prev => ({
        ...prev,
        [item.product_id]: { ...prev[item.product_id], variantId: item.variant_id || prev[item.product_id]?.variantId, quantity: 1 }
      }))
    }
    if (item?.bundle_id) {
      setBundleSelection(prev => ({
        ...prev,
        [item.bundle_id]: { ...prev[item.bundle_id], quantity: 1 }
      }))
    }
  }, [user, cartItems])

  const updateQuantity = useCallback(async function(itemId, qty) {
    if (qty < 1) return
    if (user) {
      await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId)
      setCartItems(prev => prev.map(e => e.id === itemId ? { ...e, quantity: qty } : e))
    } else {
      const updated = cartItems.map(e => e.id === itemId ? { ...e, quantity: qty } : e)
      setCartItems(updated)
      await persistGuestCart(updated)
    }
  }, [user])

  const totals = useMemo(() => {
    const getPrice = (item) => {
      if (item?.bundle && Array.isArray(item.bundle.bundle_items)) return calculateBundlePrice(item.bundle)
      return item?.variant?.price || item.variant_price || item?.bundle?.bundle_price || item.bundle_price || 0
    }
    const baseTotal = cartItems.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0)
    const discountTotal = cartItems.reduce((sum, item) => {
      const price = getPrice(item)
      return sum + (item.product?.discount_percent ? price * item.product.discount_percent / 100 : 0) * item.quantity
    }, 0)
    const couponDiscount = coupon
      ? coupon.discount_type === 'percentage'
        ? (baseTotal - discountTotal) * (coupon.discount_value / 100)
        : coupon.discount_value
      : 0
    return {
      baseTotal,
      discountTotal,
      couponDiscount,
      finalTotal: Math.max(0, baseTotal - discountTotal - couponDiscount)
    }
  }, [cartItems, coupon])

  const value = {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    productSelections,
    setProductSelection: function(productId, selection) {
      setProductSelection(prev => ({ ...prev, [productId]: { ...prev[productId], ...selection } }))
    },
    bundleSelections,
    setBundleSelection: function(bundleId, selection) {
      setBundleSelection(prev => ({ ...prev, [bundleId]: { ...prev[bundleId], ...selection } }))
    },
    coupon,
    setCoupon,
    totals,
    loading
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
