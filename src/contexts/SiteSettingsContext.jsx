import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const defaultSettings = {
  store_name: 'HAiFarmer',
  tagline: 'Fresh & Natural Products',
  primary_color: '#16a34a',
  secondary_color: '#059669',
  accent_color: '#10b981',
  whatsapp_number: '9709704563',
  shipping_cost: 0,
  min_order_amount: 0,
  header_text_1: 'Free delivery over ₹1499',
  logo_url: '',
  placeholder_image: '',
  footer_text: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  home_banner_url: '',
  home_main_banner_1_url: '',
  home_main_banner_2_url: '',
  home_main_banner_3_url: '',
  home_main_banner_4_url: '',
  home_left_banner_url: '',
  home_middle_top_banner_url: '',
  home_middle_bottom_banner_url: '',
  home_right_story_banner_url: '',
  ad_banner_left_url: '',
  ad_banner_right_url: '',
  delivery_charge_amount: 99,
  free_delivery_threshold: 2599,
}

let cachedSettings = null
let settingsPromise = null

export async function fetchSiteSettings() {
  if (cachedSettings) return cachedSettings
  if (!settingsPromise) {
    settingsPromise = supabase.from('site_settings').select('*').eq('id', 1).single()
      .then(({ data, error }) => {
        if (error) throw error
        cachedSettings = data || { ...defaultSettings }
        return cachedSettings
      })
      .finally(() => { settingsPromise = null })
  }
  return settingsPromise
}

export function getSiteSettings() {
  return cachedSettings || defaultSettings
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings || defaultSettings)
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    let cancelled = false
    fetchSiteSettings().then(s => {
      if (!cancelled) { setSettings(s); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setSettings(defaultSettings); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  return { settings, loading }
}
