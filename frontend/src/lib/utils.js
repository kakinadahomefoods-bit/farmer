const PLACEHOLDER_IMAGE = 'https://hnilmlhyqcgsbfbguuuz.supabase.co/storage/v1/object/public/images/placeholder.jpg'

export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(amount))
}

export function discountPercent(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

export function getImageUrl(path, fallback) {
  if (!path) return fallback || PLACEHOLDER_IMAGE
  if (path.startsWith('http')) return path
  const base = 'https://hnilmlhyqcgsbfbguuuz.supabase.co/storage/v1/object/public/images'
  return `${base}/${path}`
}

export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
}

export function calculateSavings(items) {
  return items.reduce((sum, item) => {
    if (item.original_price && item.original_price > item.price) {
      return sum + (item.original_price - item.price) * (item.quantity || 0)
    }
    return sum
  }, 0)
}

export function getShippingCost(total, settings) {
  if (total >= 1499) return 0
  return settings?.shipping_cost || 0
}
