import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import { getImageUrl } from '../lib/utils'
import { CartIcon } from '../components/Icons'

const PLACEHOLDER_SVG = '/placeholder.jpg'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function prefetchImage(src) {
  if (!src) return
  const img = new Image()
  img.src = src
}

export default function Home() {
  const { cartItems } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  const [homeAssets, setHomeAssets] = useState({
    legacyHomeBannerUrl: '',
    homeMainBanner1Url: '',
    homeMainBanner2Url: '',
    homeMainBanner3Url: '',
    homeMainBanner4Url: '',
    homeMiddleTopBannerUrl: '',
    homeMiddleBottomBannerUrl: '',
    homeRightStoryBannerUrl: '',
    adBannerLeftUrl: '',
    adBannerRightUrl: ''
  })

  const [bannerLinksMap, setBannerLinksMap] = useState({})
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [transition, setTransition] = useState(true)

  const carouselRef = useRef(null)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  const handleBannerClick = (key) => {
    const url = bannerLinksMap[key]
    if (url) {
      if (url.startsWith('/')) navigate(url)
      else window.open(url, '_blank')
    }
  }

  const bannerUrls = [
    homeAssets.homeMainBanner1Url || homeAssets.legacyHomeBannerUrl || '',
    homeAssets.homeMainBanner2Url || '',
    homeAssets.homeMainBanner3Url || '',
    homeAssets.homeMainBanner4Url || ''
  ].filter(u => u !== '')

  const allBanners = [...bannerUrls, bannerUrls[0]]

  const sideBanners = {
    middleTop: homeAssets.homeMiddleTopBannerUrl || '',
    middleBottom: homeAssets.homeMiddleBottomBannerUrl || '',
    rightStory: homeAssets.homeRightStoryBannerUrl || ''
  }

  const adBanners = {
    left: homeAssets.adBannerLeftUrl || '',
    right: homeAssets.adBannerRightUrl || ''
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [supabaseMod, settingsMod] = await Promise.all([
          import('../lib/supabase'),
          import('../lib/productService')
        ])
        const { supabase } = supabaseMod
        const { getNewArrivals, getComboBundles, getBannerLinks } = await import('../lib/productService')

        const [productsData, bundlesData, bannerLinksData] = await Promise.all([
          getNewArrivals().catch(() => []),
          getComboBundles().catch(() => []),
          getBannerLinks().catch(() => [])
        ])

        if (cancelled) return
        setProducts(productsData || [])
        setBundles(bundlesData || [])

        const bannerLinksMapNew = {}
        ;(bannerLinksData || []).forEach(bl => {
          if (bl.is_active) bannerLinksMapNew[bl.banner_key] = bl.link_url
        })
        setBannerLinksMap(bannerLinksMapNew)

        const s = settings || {}
        const assets = {
          legacyHomeBannerUrl: s.home_banner_url || '',
          homeMainBanner1Url: s.home_main_banner_1_url || s.home_left_banner_url || '',
          homeMainBanner2Url: s.home_main_banner_2_url || '',
          homeMainBanner3Url: s.home_main_banner_3_url || '',
          homeMainBanner4Url: s.home_main_banner_4_url || '',
          homeMiddleTopBannerUrl: s.home_middle_top_banner_url || '',
          homeMiddleBottomBannerUrl: s.home_middle_bottom_banner_url || '',
          homeRightStoryBannerUrl: s.home_right_story_banner_url || '',
          adBannerLeftUrl: s.ad_banner_left_url || '',
          adBannerRightUrl: s.ad_banner_right_url || ''
        }
        setHomeAssets(assets)

        Object.values(assets).forEach(prefetchImage)
      } catch (err) {
        console.error('Error loading homepage data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    const handler = (e) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setCarouselIdx(prev => prev + 1), 2100)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (carouselIdx !== bannerUrls.length) return
    const id = window.setTimeout(() => {
      setTransition(false)
      setCarouselIdx(0)
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTransition(true))
      })
    }, 600)
    return () => window.clearTimeout(id)
  }, [carouselIdx, bannerUrls.length])

  const displayProducts = products.length > 5 ? [...products, ...products, ...products] : products

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 sm:py-8 lg:px-8">
      {/* BANNER GRID SECTION */}
      {(bannerUrls.length > 0) && (
        <section className="grid gap-3 md:grid-cols-[2fr,1fr] lg:grid-cols-[2.2fr,0.85fr,0.6fr]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div
              className="flex h-48 sm:h-64 lg:h-[330px]"
              style={{
                width: `${100 * allBanners.length}%`,
                transform: `translateX(-${100 / allBanners.length * carouselIdx}%)`,
                transition: transition ? 'transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none'
              }}
            >
              {allBanners.map((url, idx) => {
                const bannerKey = ['home_main_banner_1', 'home_main_banner_2', 'home_main_banner_3', 'home_main_banner_4'][idx % bannerUrls.length]
                const hasLink = !!bannerLinksMap[bannerKey]
                return (
                  <img
                    key={`main-banner-${idx}`}
                    src={url}
                    alt={`Main offer banner ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    onClick={() => handleBannerClick(bannerKey)}
                    className={`h-48 w-full flex-shrink-0 object-cover sm:h-64 lg:h-[330px]${hasLink ? ' cursor-pointer hover:opacity-90' : ''}`}
                    style={{ width: `${100 / allBanners.length}%` }}
                  />
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={sideBanners.middleTop}
                alt="Top side offer banner"
                loading="eager"
                fetchPriority="high"
                onClick={() => handleBannerClick('home_middle_top_banner')}
                className={`w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px] ${bannerLinksMap.home_middle_top_banner ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={sideBanners.middleBottom}
                alt="Bottom side offer banner"
                loading="eager"
                fetchPriority="high"
                onClick={() => handleBannerClick('home_middle_bottom_banner')}
                className={`w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px] ${bannerLinksMap.home_middle_bottom_banner ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <img
              src={sideBanners.rightStory}
              alt="Farmer story banner"
              loading="eager"
              fetchPriority="high"
              onClick={() => handleBannerClick('home_right_story_banner')}
              className={`h-48 w-full object-cover sm:h-64 lg:h-[330px] ${bannerLinksMap.home_right_story_banner ? 'cursor-pointer hover:opacity-90' : ''}`}
            />
          </div>
        </section>
      )}

      {/* NEW ARRIVALS SECTION */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">New arrivals</h2>
          <Link className="text-brand-600 hover:text-brand-700" to="/products">Browse all</Link>
        </div>
        <p className="text-slate-600 text-sm mt-1 mb-6">Naturally grown from tribal villages 🌿 Rainwater-fed 🌧 Minimal pollution</p>
        <div className="relative mt-6">
          {products.length === 0
            ? <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No new arrivals selected yet.</div>
            : (
              <>
                <div
                  ref={carouselRef}
                  className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-10"
                  style={isMobile ? { paddingLeft: 'calc(50% - 100px)', paddingRight: 'calc(50% - 100px)' } : undefined}
                >
                  {displayProducts.map((product, idx) => (
                    <div key={`${product.id}-${idx}`} data-new-arrival-card="true" className="w-[170px] flex-none">
                      <ProductCard product={product} compact />
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </div>
      </section>

      {/* AD BANNERS */}
      {(adBanners.left || adBanners.right) && (
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {adBanners.left && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={adBanners.left}
                alt="Advertisement banner for dry fruits"
                onClick={() => handleBannerClick('ad_banner_left')}
                className={`aspect-[16/5] w-full object-cover ${bannerLinksMap.ad_banner_left ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
          )}
          {adBanners.right && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={adBanners.right}
                alt="Advertisement banner for spices and masalas"
                onClick={() => handleBannerClick('ad_banner_right')}
                className={`aspect-[16/5] w-full object-cover ${bannerLinksMap.ad_banner_right ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            </div>
          )}
        </section>
      )}

      {/* COMBOS SECTION */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Combo's</h2>
          <Link className="text-brand-600 hover:text-brand-700" to="/combos">View bundles</Link>
        </div>
        <p className="text-slate-600 text-sm mt-1 mb-6">Curated bundles from tribal farms 🌿 Natural farming 🌿 Pure quality</p>
        <div className="mt-6 grid grid-cols-1 gap-6">
          {bundles.length === 0
            ? <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">No combos selected yet.</div>
            : bundles.map(b => <BundleCard key={b.id} bundle={b} />)
          }
        </div>
      </section>

      {/* FLOATING CART BUTTON */}
      <button
        type="button"
        onClick={() => navigate('/checkout')}
        className="fixed bottom-[68px] right-4 z-50 inline-flex h-14 w-14 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.35)] transition hover:-translate-y-1 hover:bg-brand-700 sm:bottom-6 sm:right-8 sm:h-16 sm:w-16"
        aria-label="Open shopping cart"
      >
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
