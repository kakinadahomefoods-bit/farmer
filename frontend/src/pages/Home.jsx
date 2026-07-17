import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import { api } from '../lib/api'
import { getImageUrl, optimizeImage } from '../lib/utils'
import { CartIcon } from '../components/Icons'
import { getNewArrivals as getSupabaseNewArrivals, getComboBundles as getSupabaseComboBundles, getActiveBanners as getSupabaseBanners } from '../lib/productService'

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

  // Banners from API
  const [heroBanners, setHeroBanners] = useState([])
  const [promoBanners, setPromoBanners] = useState([])
  const [sideBanners, setSideBanners] = useState([])

  // Fallback banner URLs from settings
  const [fallbackBannerUrls, setFallbackBannerUrls] = useState([])
  const [fallbackPromoUrls, setFallbackPromoUrls] = useState([])
  const [fallbackSideUrls, setFallbackSideUrls] = useState({
    middleTop: '', middleBottom: '', rightStory: ''
  })

  const [carouselIdx, setCarouselIdx] = useState(0)
  const [transition, setTransition] = useState(true)
  const [paused, setPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(null)

  const carouselRef = useRef(null)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  const handleBannerClick = (link) => {
    if (!link) return
    if (link.startsWith('/')) navigate(link)
    else window.open(link, '_blank')
  }

  const bannerUrls = heroBanners.length > 0
    ? heroBanners.map(b => b.image)
    : fallbackBannerUrls

  const promoList = promoBanners.length > 0
    ? promoBanners.map(b => ({ url: b.image, link: b.redirectLink || '' }))
    : fallbackPromoUrls

  const sideList = sideBanners.length > 0 ? sideBanners : []

  const goPrev = () => {
    setCarouselIdx(prev => prev > 0 ? prev - 1 : bannerUrls.length - 1)
  }
  const goNext = () => {
    setCarouselIdx(prev => (prev + 1) % bannerUrls.length)
  }
  const goDot = (i) => {
    setTransition(true)
    setCarouselIdx(i)
  }

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev()
    setTouchStart(null)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        let [productsData, bundlesData, heroData, promoData, sideData] = await Promise.all([
          api.getNewArrivals().catch(() => []),
          api.getBundles({ combo: 'true' }).catch(() => []),
          api.getBanners({ position: 'hero' }).catch(() => []),
          api.getBanners({ position: 'promotional' }).catch(() => []),
          api.getBanners({ position: 'side' }).catch(() => []),
        ])
        if (cancelled) return

        if (!productsData || productsData.length === 0) {
          productsData = await getSupabaseNewArrivals().catch(() => [])
        }
        if (!bundlesData || bundlesData.length === 0) {
          bundlesData = await getSupabaseComboBundles().catch(() => [])
        }
        if (!heroData || heroData.length === 0) {
          const supabaseBanners = await getSupabaseBanners().catch(() => [])
          heroData = supabaseBanners.map(b => ({ image: b.image_url, title: '', redirectLink: b.target_link?.link_url || '' }))
        }

        setProducts(productsData || [])
        setBundles(bundlesData || [])
        setHeroBanners(heroData || [])
        setPromoBanners(promoData || [])
        setSideBanners(sideData || [])

        const s = settings || {}
        const fallbackBanners = [
          s.home_banner_url || '',
          s.home_main_banner_1_url || s.home_left_banner_url || '',
          s.home_main_banner_2_url || '',
          s.home_main_banner_3_url || '',
          s.home_main_banner_4_url || '',
        ].filter(u => u !== '')
        setFallbackBannerUrls(fallbackBanners)

        setFallbackPromoUrls([
          { url: s.promo_banner_1_url || '', link: s.promo_banner_1_link || '' },
          { url: s.promo_banner_2_url || '', link: s.promo_banner_2_link || '' },
          { url: s.promo_banner_3_url || '', link: s.promo_banner_3_link || '' },
        ].filter(b => b.url))

        setFallbackSideUrls({
          middleTop: s.home_middle_top_banner_url || '',
          middleBottom: s.home_middle_bottom_banner_url || '',
          rightStory: s.home_right_story_banner_url || '',
        })

        ;[fallbackBanners, (s.home_middle_top_banner_url || ''), (s.home_middle_bottom_banner_url || ''), (s.home_right_story_banner_url || '')].filter(Boolean).forEach(prefetchImage)
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
    if (bannerUrls.length > 0) {
      const first = optimizeImage(bannerUrls[0], 2000)
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = first
      link.fetchPriority = 'high'
      document.head.appendChild(link)
      return () => { document.head.removeChild(link) }
    }
  }, [bannerUrls])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    const handler = (e) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (paused || bannerUrls.length < 2) return
    const id = window.setInterval(() => setCarouselIdx(prev => (prev + 1) % bannerUrls.length), 2100)
    return () => window.clearInterval(id)
  }, [paused, bannerUrls.length])

  const displayProducts = products.length > 5 ? [...products, ...products, ...products] : products

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'OnlineStore'],
    name: 'HAiFarmer',
    url: 'https://haifarmer.com',
    image: 'https://haifarmer.com/og-image.png',
    telephone: '+91-9709704563',
    description: 'Natural & organic groceries, organic food, and vegetables from tribal villages with rainwater-fed crops',
    areaServed: 'IN',
    priceRange: '₹100 - ₹5000',
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 sm:py-8 lg:px-8">
      <SeoHead schema={orgSchema} />

      {/* BANNER GRID SECTION */}
      {bannerUrls.length > 0 && (
        <section className="grid gap-3 md:grid-cols-[2fr,1fr] lg:grid-cols-[2.2fr,0.85fr,0.6fr]">
          <div
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-48 sm:h-64 lg:h-[330px]"
              style={{
                width: `${100 * bannerUrls.length}%`,
                transform: `translateX(-${100 / bannerUrls.length * carouselIdx}%)`,
                transition: transition ? 'transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none'
              }}
            >
              {bannerUrls.map((url, idx) => {
                const banner = heroBanners[idx]
                const hasLink = !!(banner?.redirectLink)
                return (
                  <img
                    key={`main-banner-${idx}`}
                    src={optimizeImage(url, 2000)}
                    alt={banner?.title || `Main offer banner ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    decoding={idx === 0 ? 'sync' : 'async'}
                    onClick={() => handleBannerClick(banner?.redirectLink)}
                    className={`h-48 w-full flex-shrink-0 object-cover sm:h-64 lg:h-[330px]${hasLink ? ' cursor-pointer hover:opacity-90' : ''}`}
                    style={{ width: `${100 / bannerUrls.length}%` }}
                  />
                )
              })}
            </div>
            {bannerUrls.length > 1 && (
              <>
                <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow hover:bg-white transition sm:p-2" aria-label="Previous banner">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow hover:bg-white transition sm:p-2" aria-label="Next banner">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {bannerUrls.map((_, i) => (
                    <button key={i} onClick={() => goDot(i)} className={`h-2 w-2 rounded-full transition ${i === carouselIdx ? 'bg-white' : 'bg-white/50'}`} aria-label={`Go to banner ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            {sideList.length >= 1 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <img
                  src={optimizeImage(sideList[0].image, 800)}
                  alt={sideList[0].title || 'Side offer banner'}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  onClick={() => handleBannerClick(sideList[0].redirectLink)}
                  className={`w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px] ${sideList[0].redirectLink ? 'cursor-pointer hover:opacity-90' : ''}`}
                />
              </div>
            ) : fallbackSideUrls.middleTop ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <img src={optimizeImage(fallbackSideUrls.middleTop, 800)} alt="Top side offer banner" loading="eager" fetchPriority="high" decoding="sync" className="w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px]" />
              </div>
            ) : null}
            {sideList.length >= 2 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <img
                  src={optimizeImage(sideList[1].image, 800)}
                  alt={sideList[1].title || 'Side offer banner'}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  onClick={() => handleBannerClick(sideList[1].redirectLink)}
                  className={`w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px] ${sideList[1].redirectLink ? 'cursor-pointer hover:opacity-90' : ''}`}
                />
              </div>
            ) : fallbackSideUrls.middleBottom ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <img src={optimizeImage(fallbackSideUrls.middleBottom, 800)} alt="Bottom side offer banner" loading="eager" fetchPriority="high" decoding="sync" className="w-full object-contain sm:h-[158px] sm:object-cover lg:h-[159px]" />
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            {sideList.length >= 3 ? (
              <img
                src={optimizeImage(sideList[2].image, 600)}
                alt={sideList[2].title || 'Side story banner'}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                onClick={() => handleBannerClick(sideList[2].redirectLink)}
                className={`h-48 w-full object-cover sm:h-64 lg:h-[330px] ${sideList[2].redirectLink ? 'cursor-pointer hover:opacity-90' : ''}`}
              />
            ) : fallbackSideUrls.rightStory ? (
              <img src={optimizeImage(fallbackSideUrls.rightStory, 600)} alt="Farmer story banner" loading="eager" fetchPriority="high" decoding="sync" className="h-48 w-full object-cover sm:h-64 lg:h-[330px]" />
            ) : null}
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
                    <div key={`${product._id || product.id}-${idx}`} data-new-arrival-card="true" className="w-[170px] flex-none">
                      <ProductCard product={product} compact />
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </div>
      </section>

      {/* 3 MIDDLE PROMO BANNERS */}
      {promoList.length > 0 && (
        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          {promoList.map((b, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {b.link ? (
                <a href={b.link.startsWith('/') ? undefined : b.link} onClick={b.link.startsWith('/') ? () => navigate(b.link) : undefined} target={b.link.startsWith('/') ? undefined : '_blank'} rel={b.link.startsWith('/') ? undefined : 'noopener noreferrer'}>
                  <img src={optimizeImage(b.url, 800)} alt={`Promotional banner ${i + 1}`} loading="lazy" fetchPriority="low" className="aspect-[4/3] w-full object-cover transition hover:opacity-90 sm:aspect-[3/2]" />
                </a>
              ) : (
                <img src={optimizeImage(b.url, 800)} alt={`Promotional banner ${i + 1}`} loading="lazy" fetchPriority="low" className="aspect-[4/3] w-full object-cover sm:aspect-[3/2]" />
              )}
            </div>
          ))}
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
            : bundles.map(b => <BundleCard key={b._id || b.id} bundle={b} />)
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