const API_URL = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  try {
    const adminSession = localStorage.getItem('adminSession')
    if (adminSession) {
      const parsed = JSON.parse(adminSession)
      return parsed.token
    }
    return null
  } catch { return null }
}

async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    })

    let data
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      const text = await res.text()
      throw new Error(`Server returned ${res.status}: ${text.slice(0, 200)}`)
    }

    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
    return data
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out')
    if (err.message?.includes('Failed to fetch')) {
      throw new Error('Network error — check your connection or the server may be down')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  getAdminMe: () => request('/auth/admin/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Products
  getProducts: (params = {}) => request(`/products?${new URLSearchParams(params)}`),
  getProduct: (slug) => request(`/products/${slug}`),
  getNewArrivals: () => request('/products/new-arrivals'),
  getBestSelling: () => request('/products/best-selling'),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  toggleProductActive: (id) => request(`/products/${id}/toggle-active`, { method: 'PATCH' }),
  toggleProductFeatured: (id) => request(`/products/${id}/toggle-featured`, { method: 'PATCH' }),
  reorderProducts: (orders) => request('/products/reorder', { method: 'PATCH', body: JSON.stringify({ orders }) }),

  // Categories
  getCategories: () => request('/categories'),
  getAllCategories: () => request('/categories/all'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  toggleCategoryActive: (id) => request(`/categories/${id}/toggle-active`, { method: 'PATCH' }),
  reorderCategories: (orders) => request('/categories/reorder', { method: 'PATCH', body: JSON.stringify({ orders }) }),

  // Orders
  getOrders: (params = {}) => request(`/orders/all?${new URLSearchParams(params)}`),
  getUserOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders/direct', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getOrderStats: () => request('/orders/stats'),
  getRecentOrders: () => request('/orders/recent'),
  getSalesGraph: () => request('/orders/sales-graph'),

  // Coupons
  getCoupons: () => request('/coupons'),
  createCoupon: (data) => request('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id, data) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoupon: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),
  toggleCouponActive: (id) => request(`/coupons/${id}/toggle-active`, { method: 'PATCH' }),
  validateCoupon: (code, cartValue, cartItems) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cartValue, cartItems }) }),

  // Banners
  getBanners: (params = {}) => request(`/banners?${new URLSearchParams(params)}`),
  getAllBanners: () => request('/banners/all'),
  createBanner: (data) => request('/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id, data) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: 'DELETE' }),
  toggleBannerActive: (id) => request(`/banners/${id}/toggle-active`, { method: 'PATCH' }),

  // Farmers
  getFarmers: (params = {}) => request(`/farmers?${new URLSearchParams(params)}`),
  getAllFarmers: (params = {}) => request(`/farmers/all?${new URLSearchParams(params)}`),
  getFarmer: (id) => request(`/farmers/${id}`),
  getFarmerByQRCode: (code) => request(`/farmers/qr/${code}`),
  createFarmer: (data) => request('/farmers', { method: 'POST', body: JSON.stringify(data) }),
  updateFarmer: (id, data) => request(`/farmers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFarmer: (id) => request(`/farmers/${id}`, { method: 'DELETE' }),
  toggleFarmerActive: (id) => request(`/farmers/${id}/toggle-active`, { method: 'PATCH' }),
  updateFarmerStatus: (id, status) => request(`/farmers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getFarmerQR: (id) => request(`/farmers/${id}/qr`),
  regenerateFarmerQR: (id) => request(`/farmers/${id}/qr/regenerate`, { method: 'POST' }),
  toggleFarmerQR: (id) => request(`/farmers/${id}/qr/toggle`, { method: 'PATCH' }),

  // Bundles
  getBundles: (params = {}) => request(`/bundles?${new URLSearchParams(params)}`),
  getAllBundles: () => request('/bundles/all'),
  getBundle: (slug) => request(`/bundles/${slug}`),
  createBundle: (data) => request('/bundles', { method: 'POST', body: JSON.stringify(data) }),
  updateBundle: (id, data) => request(`/bundles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBundle: (id) => request(`/bundles/${id}`, { method: 'DELETE' }),
  toggleBundleActive: (id) => request(`/bundles/${id}/toggle-active`, { method: 'PATCH' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Upload
  uploadImage: (file, folder = 'haifarmer') => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', folder)
    return request('/upload', { method: 'POST', body: formData })
  },
  uploadMultiple: (files, folder = 'haifarmer') => {
    const formData = new FormData()
    files.forEach(f => formData.append('images', f))
    formData.append('folder', folder)
    return request('/upload/multiple', { method: 'POST', body: formData })
  },
  deleteImage: (url) => request('/upload', { method: 'DELETE', body: JSON.stringify({ url }) }),

  // Image generation
  generateImage: (entity, name, existingPublicId) =>
    request('/generate-image', { method: 'POST', body: JSON.stringify({ entity, name, existingPublicId }) }),
  previewImage: (entity, name) =>
    request('/generate-image/preview', { method: 'POST', body: JSON.stringify({ entity, name }) }),
}
