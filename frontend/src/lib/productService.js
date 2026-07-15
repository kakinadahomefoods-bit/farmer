import { supabase } from './supabase'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export async function getProducts(page = 1, pageSize = 50, category = null, search = null, sort = 'created_at', ascending = false) {
  let query = supabase
    .from('products')
    .select('*, product_variants(*)', { count: 'exact' })
    .eq('is_active', true)

  if (search) query = query.ilike('name', `%${search}%`)
  if (category) query = query.eq('category', category)

  const col = sort === 'name' ? 'name' : sort === 'price' ? 'price' : 'created_at'
  query = query.order(col, { ascending: sort === 'price' || sort === 'name' ? true : ascending })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data || [], total: count || 0 }
}

export async function getNewArrivals() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) return []
  return data || []
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
  if (error) throw error
  return (data || []).find(p => slugify(p.name) === slug) || null
}

export async function getBundleBySlug(slug) {
  const { data, error } = await supabase
    .from('bundles')
    .select('*, bundle_items(*, product:products(*), variant:product_variants(*))')
    .eq('is_active', true)
  if (error) throw error
  return (data || []).find(b => slugify(b.name || b.bundle_name) === slug) || null
}

export async function getActiveBundles() {
  const { data, error } = await supabase
    .from('bundles')
    .select('*, bundle_items(*, product:products(*), variant:product_variants(*))')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getComboBundles() {
  const { data, error } = await supabase
    .from('bundles')
    .select('id, bundle_name, bundle_image_url, bundle_price, bundle_discount_percent, is_combo, bundle_description, bundle_items(id, quantity, product:products(id, name), variant:product_variants(id, weight_label, price))')
    .eq('is_active', true)
    .eq('is_combo', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getBundles(page = 1, pageSize = 50) {
  const { data, error, count } = await supabase
    .from('bundles')
    .select('*, bundle_items(*, product:products(*), variant:product_variants(*))', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)
  if (error) throw error
  return { data: data || [], total: count || 0 }
}

export async function getActiveBanners() {
  const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single().catch(() => ({ data: null }))
  const { data: bannerLinks } = await supabase.from('banner_links').select('*').catch(() => ({ data: null }))
  const banners = []
  const linkMap = {}
  ;(bannerLinks || []).forEach(bl => { linkMap[bl.banner_key] = bl })

  const bannerKeys = [
    'home_main_banner_1_url',
    'home_main_banner_2_url',
    'home_main_banner_3_url',
    'home_main_banner_4_url',
  ]
  for (const key of bannerKeys) {
    const url = settings?.[key]
    if (url) {
      banners.push({
        id: key,
        image_url: url,
        target_link: linkMap[key] || null,
        position: null,
      })
    }
  }
  return banners
}

export async function getBannerLinks() {
  const { data, error } = await supabase.from('banner_links').select('*')
  if (error) return []
  return data || []
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllBundles() {
  const { data, error } = await supabase
    .from('bundles')
    .select('*, bundle_items(*, product:products(*), variant:product_variants(*))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllCategories() {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw error
  return data || []
}

export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').limit(1).single()
  if (error) return getDefaultSiteSettings()
  return data || getDefaultSiteSettings()
}

function getDefaultSiteSettings() {
  return {
    id: 1,
    logo_url: '',
    home_banner_url: '',
    home_main_banner_1_url: '',
    home_main_banner_2_url: '',
    home_main_banner_3_url: '',
    home_main_banner_4_url: '',
    header_text_1: '',
    header_text_2: '',
    header_text_3: '',
    delivery_charge_amount: 99,
    free_delivery_threshold: 2599,
  }
}

export async function prefetchHomeData() {
  const [settings, newArrivals, bundles, bannerLinks] = await Promise.all([
    getSiteSettings(),
    getNewArrivals(),
    getActiveBundles(),
    getBannerLinks()
  ])
  return { settings, newArrivals, bundles, bannerLinks }
}
