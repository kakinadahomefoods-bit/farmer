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

  const [heroBanners, setHeroBanners] = useState([])
  const [promoBanners, setPromoBanners] = useState([])
  const [sideBanners, setSideBanners] = useState([])

  const [fallbackBannerUrls, setFallbackBannerUrls] = useState([])
  const [fallbackPromoUrls, setFallbackPromoUrls] = useState([])
  const [fallbackSideUrls, setFallbackSideUrls] = useState({ middleTop: '', middleBottom: '', rightStory: '' })

  const [carouselIdx, setCarouselIdx] = useState(0)
  const [transition, setTransition] = useState(true)
  const [paused, setPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(null)

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

  const goPrev = () => setCarouselIdx(prev => prev > 0 ? prev - 1 : bannerUrls.length - 1)
  const goNext = () => setCarouselIdx(prev => (prev + 1) % bannerUrls.length)
  const goDot = (i) => { setTransition(true); setCarouselIdx(i) }

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
        const fb = [
          s.home_banner_url || '',
          s.home_main_banner_1_url || s.home_left_banner_url || '',
          s.home_main_banner_2_url || '',
          s.home_main_banner_3_url || '',
          s.home_main_banner_4_url || '',
        ].filter(u => u !== '')
        setFallbackBannerUrls(fb)
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
        ;[fb, s.home_middle_top_banner_url || '', s.home_middle_bottom_banner_url || '', s.home_right_story_banner_url || ''].filter(Boolean).forEach(prefetchImage)
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
    if (paused || bannerUrls.length < 2) return
    const id = window.setInterval(() => setCarouselIdx(prev => (prev + 1) % bannerUrls.length), 4000)
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
      <div className="flex min-h-screen items-center justify-center bg-forest-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cream-50/30 border-t-gold-500"></div>
          <p className="mt-4 font-heading text-lg text-cream-50/60">HAiFarmer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream-50">
      <SeoHead schema={orgSchema} />

      {/* HERO SECTION */}
      {bannerUrls.length > 0 && (
        <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-end bg-forest-900 overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="flex h-full"
              style={{
                width: `${100 * bannerUrls.length}%`,
                transform: `translateX(-${100 / bannerUrls.length * carouselIdx}%)`,
                transition: transition ? 'transform 800ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none'
              }}
            >
              {bannerUrls.map((url, idx) => (
                <div key={idx} className="relative h-full" style={{ width: `${100 / bannerUrls.length}%` }}>
                  <img
                    src={optimizeImage(url, 2000)}
                    alt={heroBanners[idx]?.title || `Banner ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/40 to-forest-900/20" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
            <div className="max-w-2xl animate-fade-up">
              <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1 text-xs font-semibold tracking-[0.12em] uppercase text-gold-500">From Tribal Villages</span>
              <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-cream-50 sm:text-5xl lg:text-6xl tracking-tight">
                Naturally Grown,<br />
                <span className="text-gold-500">Tribal Cultivated</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-cream-50/70 sm:text-lg">
                Rainwater-fed organic produce straight from indigenous farming communities. Pesticide-free, chemical-free, pure.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-terracotta-500 px-8 py-3 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 transition hover:bg-terracotta-600 shadow-lg shadow-terracotta-500/20">
                  Explore Products
                </Link>
                <Link to="/about" className="inline-flex items-center gap-2 rounded-full border border-cream-50/30 px-8 py-3 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 transition hover:bg-cream-50/10">
                  Our Story
                </Link>
              </div>
            </div>
          </div>

          {bannerUrls.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-cream-50/10 p-2 text-cream-50/60 backdrop-blur-sm transition hover:bg-cream-50/20 hover:text-cream-50" aria-label="Previous">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={goNext} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-cream-50/10 p-2 text-cream-50/60 backdrop-blur-sm transition hover:bg-cream-50/20 hover:text-cream-50" aria-label="Next">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {bannerUrls.map((_, i) => (
                  <button key={i} onClick={() => goDot(i)} className={`h-2 rounded-full transition-all ${i === carouselIdx ? 'w-8 bg-gold-500' : 'w-2 bg-cream-50/40 hover:bg-cream-50/60'}`} aria-label={`Go to slide ${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* SIDE BANNERS SECTION */}
      {(sideList.length > 0 || fallbackSideUrls.middleTop) && (
        <section className="relative bg-forest-900">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map(i => {
                const banner = sideList[i]
                const fallback = i === 0 ? fallbackSideUrls.middleTop : i === 1 ? fallbackSideUrls.middleBottom : fallbackSideUrls.rightStory
                const url = banner?.image || fallback
                if (!url) return null
                return (
                  <div key={i} className="group overflow-hidden rounded-2xl border border-cream-50/10 bg-forest-950 shadow-xl">
                    <img
                      src={optimizeImage(url, 800)}
                      alt={banner?.title || ''}
                      onClick={() => handleBannerClick(banner?.redirectLink)}
                      className={`w-full h-48 sm:h-56 object-cover transition duration-500 group-hover:scale-105 ${banner?.redirectLink ? 'cursor-pointer' : ''}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <div className="organic-divider"><div className="absolute inset-0 bg-cream-100" /></div>

      {/* NEW ARRIVALS SECTION */}
      <section className="relative bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-terracotta-500">Fresh from the farm</span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">New Arrivals</h2>
              <p className="mt-2 text-sm text-forest-900/60 max-w-md">Handpicked organic produce from tribal farmers. Fresh harvest, direct to your door.</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-1 rounded-full border border-forest-900/20 px-5 py-2 text-xs font-semibold tracking-[0.08em] uppercase text-forest-900 transition hover:bg-forest-900 hover:text-cream-50">
              View All
            </Link>
          </div>
          <div className="mt-10">
            {products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-sand-300 bg-cream-50 p-12 text-center">
                <p className="font-heading text-lg text-forest-900/50">No new arrivals selected yet.</p>
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar snap-x" style={{ scrollPaddingLeft: 'calc(50% - 140px)' }}>
                {displayProducts.map((product, idx) => (
                  <div key={`${product._id || product.id}-${idx}`} className="w-[180px] flex-none snap-start">
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center gap-1 rounded-full bg-terracotta-500 px-6 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase text-cream-50 transition hover:bg-terracotta-600">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <div className="organic-divider organic-divider-reverse"><div className="absolute inset-0 bg-forest-900" /></div>

      {/* PROMO BANNERS */}
      {promoList.length > 0 && (
        <section className="relative bg-forest-900 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-gold-500">Special Offers</span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">Farm Fresh Deals</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {promoList.map((b, i) => (
                <div key={i} className="group overflow-hidden rounded-2xl border border-cream-50/10 bg-forest-950 shadow-xl">
                  {b.link ? (
                    <a href={b.link.startsWith('/') ? undefined : b.link} onClick={b.link.startsWith('/') ? () => navigate(b.link) : undefined} target={b.link.startsWith('/') ? undefined : '_blank'} rel={b.link.startsWith('/') ? undefined : 'noopener noreferrer'}>
                      <img src={optimizeImage(b.url, 800)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
                    </a>
                  ) : (
                    <img src={optimizeImage(b.url, 800)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="organic-divider"><div className="absolute inset-0 bg-cream-100" /></div>

      {/* COMBOS SECTION */}
      <section className="relative bg-cream-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-terracotta-500">Curated Bundles</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">Combo's</h2>
            <p className="mt-2 text-sm text-forest-900/60">Thoughtfully curated bundles from tribal farms. Best value, pure quality.</p>
          </div>
          <div className="mt-10 space-y-6">
            {bundles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-sand-300 bg-cream-50 p-12 text-center">
                <p className="font-heading text-lg text-forest-900/50">No combos selected yet.</p>
              </div>
            ) : bundles.map(b => <BundleCard key={b._id || b.id} bundle={b} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/combos" className="inline-flex items-center gap-1 rounded-full bg-terracotta-500 px-8 py-3 text-xs font-semibold tracking-[0.08em] uppercase text-cream-50 transition hover:bg-terracotta-600 shadow-lg shadow-terracotta-500/20">
              View All Bundles
            </Link>
          </div>
        </div>
      </section>

      {/* FLOATING CART BUTTON */}
      <button
        type="button"
        onClick={() => navigate('/checkout')}
        className="fixed bottom-[72px] right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-500 text-cream-50 shadow-[0_8px_32px_rgba(183,91,52,0.35)] transition hover:bg-terracotta-600 hover:-translate-y-1 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
        aria-label="Open shopping cart"
      >
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-forest-900 px-2 py-0.5 text-xs font-semibold text-cream-50">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
