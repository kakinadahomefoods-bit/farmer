import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import { api } from '../lib/api'
import { optimizeImage } from '../lib/utils'
import { CartIcon } from '../components/Icons'
import { getNewArrivals as getSupabaseNewArrivals, getComboBundles as getSupabaseComboBundles, getActiveBanners as getSupabaseBanners, getCategories as getSupabaseCategories } from '../lib/productService'

function prefetchImage(src) { if (!src) return; const img = new Image(); img.src = src }

export default function Home() {
  const { cartItems } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
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
  const handleBannerClick = (link) => { if (!link) return; if (link.startsWith('/')) navigate(link); else window.open(link, '_blank') }
  const bannerUrls = heroBanners.length > 0 ? heroBanners.map(b => b.image) : fallbackBannerUrls
  const promoList = promoBanners.length > 0 ? promoBanners.map(b => ({ url: b.image, link: b.redirectLink || '' })) : fallbackPromoUrls
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
        let [productsData, bundlesData, heroData, promoData, sideData, categoriesData, allProductsData] = await Promise.all([
          api.getNewArrivals().catch(() => []),
          api.getBundles({ combo: 'true' }).catch(() => []),
          api.getBanners({ position: 'hero' }).catch(() => []),
          api.getBanners({ position: 'promotional' }).catch(() => []),
          api.getBanners({ position: 'side' }).catch(() => []),
          api.getCategories().catch(() => []),
          api.getProducts({ limit: 50 }).then(r => r.data || []).catch(() => []),
        ])
        if (cancelled) return
        console.log('Home data:', { productsCount: productsData?.length, bundlesCount: bundlesData?.length, heroCount: heroData?.length, promoCount: promoData?.length, categoriesCount: categoriesData?.length, allProductsCount: allProductsData?.length })
        if (!productsData || productsData.length === 0) productsData = await getSupabaseNewArrivals().catch(() => [])
        if (!bundlesData || bundlesData.length === 0) bundlesData = await getSupabaseComboBundles().catch(() => [])
        if (!categoriesData || categoriesData.length === 0) categoriesData = await getSupabaseCategories().catch(() => [])
        if (!allProductsData || allProductsData.length === 0) allProductsData = productsData
        if (!heroData || heroData.length === 0) {
          const supabaseBanners = await getSupabaseBanners().catch(() => [])
          heroData = supabaseBanners.map(b => ({ image: b.image_url, title: '', redirectLink: b.target_link?.link_url || '' }))
        }
        setProducts(productsData || [])
        setAllProducts(allProductsData || [])
        setCategories(categoriesData || [])
        setBundles(bundlesData || [])
        setHeroBanners(heroData || [])
        setPromoBanners(promoData || [])
        setSideBanners(sideData || [])
        const s = settings || {}
        const fb = [s.home_banner_url || '', s.home_main_banner_1_url || s.home_left_banner_url || '', s.home_main_banner_2_url || '', s.home_main_banner_3_url || '', s.home_main_banner_4_url || ''].filter(u => u !== '')
        setFallbackBannerUrls(fb)
        setFallbackPromoUrls([{ url: s.promo_banner_1_url || '', link: s.promo_banner_1_link || '' }, { url: s.promo_banner_2_url || '', link: s.promo_banner_2_link || '' }, { url: s.promo_banner_3_url || '', link: s.promo_banner_3_link || '' }].filter(b => b.url))
        setFallbackSideUrls({ middleTop: s.home_middle_top_banner_url || '', middleBottom: s.home_middle_bottom_banner_url || '', rightStory: s.home_right_story_banner_url || '' })
        ;[fb, s.home_middle_top_banner_url || '', s.home_middle_bottom_banner_url || '', s.home_right_story_banner_url || ''].filter(Boolean).forEach(prefetchImage)
      } catch (err) { console.error(err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (bannerUrls.length > 0) {
      const first = optimizeImage(bannerUrls[0], 2000)
      const link = document.createElement('link')
      link.rel = 'preload'; link.as = 'image'; link.href = first; link.fetchPriority = 'high'
      document.head.appendChild(link)
      return () => { document.head.removeChild(link) }
    }
  }, [bannerUrls])

  useEffect(() => {
    if (paused || bannerUrls.length < 2) return
    const id = window.setInterval(() => setCarouselIdx(prev => (prev + 1) % bannerUrls.length), 5000)
    return () => window.clearInterval(id)
  }, [paused, bannerUrls.length])

  const orgSchema = {
    '@context': 'https://schema.org', '@type': ['LocalBusiness', 'OnlineStore'],
    name: 'HAiFarmer', url: 'https://haifarmer.com', image: 'https://haifarmer.com/og-image.png',
    telephone: '+91-9709704563',
    description: 'Premium organic produce directly from tribal forests. Chemical-free, farm to home.',
    areaServed: 'IN', priceRange: '₹100 - ₹5000',
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-900">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-cream-50/20 border-t-gold-500"></div>
          <p className="mt-5 font-heading text-xl text-cream-50/60 italic">HAiFarmer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream-50">
      <SeoHead schema={orgSchema} />

      {/* Hero */}
      {bannerUrls.length > 0 && (
        <section className="relative min-h-screen flex items-center justify-center bg-forest-900 overflow-hidden"
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="absolute inset-0">
            <div className="flex h-full" style={{ width: `${100 * bannerUrls.length}%`, transform: `translateX(-${100 / bannerUrls.length * carouselIdx}%)`, transition: transition ? 'transform 1200ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none' }}>
              {bannerUrls.map((url, idx) => (
                <div key={idx} className="relative h-full" style={{ width: `${100 / bannerUrls.length}%` }}>
                  <img src={optimizeImage(url, 2000)} alt={heroBanners[idx]?.title || ''} loading={idx === 0 ? 'eager' : 'lazy'} fetchPriority={idx === 0 ? 'high' : 'auto'} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-forest-900/50 to-forest-900/30" />
                </div>
              ))}
            </div>
            {/* Decorative leaf */}
            <div className="absolute top-20 right-20 text-cream-50/5 leaf-float hidden lg:block">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor"><path d="M50 10C30 30 15 55 15 75c0 10 5 15 15 15 20 0 55-30 55-55C85 20 70 10 50 10z"/></svg>
            </div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 text-center lg:text-left">
            <div className="max-w-3xl lg:max-w-2xl animate-fade-up">
              <p className="font-heading text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-500/70 mb-4 sm:mb-5">Rooted in Tradition. Shared with Love.</p>
              <h1 className="font-heading text-5xl font-bold leading-tight text-cream-50 sm:text-6xl lg:text-7xl tracking-tight">
                Real Food.<br />
                <span className="text-gold-500 italic">Real Farmers.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream-50/60 sm:text-base lg:mx-0">
                Discover wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable.
              </p>
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                <Link to="/products" className="btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-9 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 transition-all duration-300 hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/25 btn-lift">
                  Explore Our Products
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
              <div className="mt-5 flex items-center justify-center lg:justify-start gap-4 text-cream-50/40">
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase"><span className="text-gold-500">✦</span> 100% Natural</div>
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase"><span className="text-gold-500">✦</span> Ethically Sourced</div>
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase"><span className="text-gold-500">✦</span> Farm to Home</div>
              </div>
            </div>
            {/* Seal stamp */}
            <div className="absolute top-8 right-8 hidden lg:block">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 100 100">
                  <defs><path id="sealPath" d="M50 5a45 45 0 1 1 0 90 45 45 0 0 1 0-90" fill="none" /></defs>
                  <text fontSize="7" fontWeight="600" letterSpacing="4" fill="#C8A96A"><textPath href="#sealPath" startOffset="3%">WILD · NATURAL · ETHICAL ·</textPath></text>
                </svg>
                <span className="font-heading text-2xl font-bold text-gold-500">100%</span>
              </div>
            </div>
          </div>
          {bannerUrls.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-5 top-1/2 z-20 -translate-y-1/2 rounded-xl bg-cream-50/10 p-3 text-cream-50/40 backdrop-blur-sm transition-all hover:bg-cream-50/20 hover:text-cream-50" aria-label="Previous">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={goNext} className="absolute right-5 top-1/2 z-20 -translate-y-1/2 rounded-xl bg-cream-50/10 p-3 text-cream-50/40 backdrop-blur-sm transition-all hover:bg-cream-50/20 hover:text-cream-50" aria-label="Next">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {bannerUrls.map((_, i) => (
                  <button key={i} onClick={() => goDot(i)} className={`h-2 rounded-full transition-all ${i === carouselIdx ? 'w-10 bg-gold-500' : 'w-2 bg-cream-50/30 hover:bg-cream-50/50'}`} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Trust strip */}
      <section className="bg-cream-50 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-forest-900 sm:text-3xl tracking-tight">Trusted by Families Who Choose Pure Food</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: '🌾', title: '20+ Traditional Foods', desc: 'Authentic pantry essentials sourced from trusted farmers.' },
              { icon: '👨‍🌾', title: '100+ Partner Farmers', desc: 'Supporting local farming communities across India.' },
              { icon: '🚚', title: 'Fresh Delivery', desc: 'Carefully packed and delivered across India.' },
              { icon: '⭐', title: '100% Natural Ingredients', desc: 'No artificial colors, preservatives, or harmful additives.' },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-forest-900/10 bg-white p-5 text-center shadow-sm hover:border-terracotta-500/30 hover:shadow-md transition-all">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-2 font-heading text-base font-semibold text-forest-900">{item.title}</h3>
                <p className="mt-1 text-xs text-forest-900/50">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-forest-900/50 italic">Bringing farm-fresh goodness directly to your home.</p>
        </div>
      </section>

      {/* Story section */}
      <section className="relative bg-cream-100 py-8 lg:py-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-terracotta-500">Our Story</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">From <span className="text-terracotta-500 italic">Our Farmers</span> to Your Family</h2>
            <p className="mt-4 text-sm leading-relaxed text-forest-900/60 max-w-2xl mx-auto">
              We started with one simple mission&mdash;to bring authentic, naturally grown foods from Indian farms directly to every household. By working closely with local farmers and traditional producers, we preserve age-old methods while ensuring freshness, purity, and quality in every product.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-forest-900/60 max-w-2xl mx-auto">
              Whether it&rsquo;s nutrient-rich millets, raw honey, hand-ground spices, cold-pressed oils, or wholesome grocery essentials, every product is carefully selected to deliver the taste of tradition with the trust of modern quality standards.
            </p>
            <div className="mt-6">
              <Link to="/products" className="btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-9 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/25 btn-lift">
                Explore Our Products
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative bg-cream-100 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-terracotta-500">Why Choose Us</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">Pure <span className="text-terracotta-500 italic">&</span> Trusted</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: '🌿', title: '100% Natural', desc: 'Pesticide-free forest-grown produce' },
              { icon: '🤝', title: 'Direct from Tribes', desc: 'Fair trade, no middlemen' },
              { icon: '🧺', title: 'Traditional Farming', desc: 'Rainwater-fed ancient methods' },
              { icon: '🚚', title: 'Farm to Home', desc: 'Delivered fresh to your doorstep' },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-forest-900/10 bg-white p-6 text-center shadow-sm hover:border-terracotta-500/30 hover:shadow-md transition-all">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-3 font-heading text-base font-semibold text-forest-900">{item.title}</h3>
                <p className="mt-1 text-xs text-forest-900/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="relative bg-forest-900 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">Categories</span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">Shop by Category</h2>
          <p className="mt-2 text-sm text-cream-50/50 max-w-md mx-auto">Discover wholesome foods for a healthier lifestyle.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: '🌾', name: 'Millets', slug: 'millets', desc: 'Traditional super grains packed with nutrition.' },
              { icon: '🍯', name: 'Honey', slug: 'honey', desc: 'Pure, raw, unprocessed honey directly from beekeepers.' },
              { icon: '🌶', name: 'Spices', slug: 'spices', desc: 'Freshly sourced aromatic spices for authentic cooking.' },
              { icon: '🥜', name: 'Dry Fruits', slug: 'dry-fruits', desc: 'Premium quality nuts and dried fruits.' },
              { icon: '🌾', name: 'Rice & Grains', slug: 'rice-grains', desc: 'Farm-fresh rice and healthy grains.' },
              { icon: '🛒', name: 'Grocery Essentials', slug: 'grocery', desc: 'Daily essentials sourced with care.' },
            ].map(cat => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="group block">
                <div className="rounded-2xl border border-gold-500/10 bg-forest-950/60 p-5 text-center transition-all hover:border-gold-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10 text-3xl transition-all group-hover:bg-gold-500/20 group-hover:scale-105">
                    {cat.icon}
                  </div>
                  <h3 className="mt-3 font-heading text-sm font-semibold text-cream-50">{cat.name}</h3>
                  <p className="mt-1 text-[10px] text-cream-50/40">{cat.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-gold-500/20 px-3 py-1 text-[9px] font-semibold tracking-[0.1em] uppercase text-gold-500/80 transition-all group-hover:bg-gold-500/10">
                    Shop {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banners */}
      {promoList.length > 0 && (
        <section className="relative bg-forest-900 py-4">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">Special Offers</span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">Farm Fresh Deals</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {promoList.map((b, i) => (
                  <div key={i} className="group overflow-hidden rounded-2xl border border-cream-50/10 bg-forest-950 shadow-xl img-zoom">
                    {b.link ? (
                      <a href={b.link.startsWith('/') ? undefined : b.link} onClick={b.link.startsWith('/') ? () => navigate(b.link) : undefined} target={b.link.startsWith('/') ? undefined : '_blank'} rel={b.link.startsWith('/') ? undefined : 'noopener noreferrer'}>
                        <img src={optimizeImage(b.url, 800)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
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

      {/* How It Works */}
      <section className="relative bg-forest-900 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">How It Works</span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">From <span className="text-gold-500 italic">Farm</span> to Home</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { step: '01', icon: '🌾', title: 'Tribal Farmers Harvest', desc: 'Grown using traditional rainwater-fed methods, pesticide-free' },
              { step: '02', icon: '📦', title: 'Carefully Packed', desc: 'Hygienically processed and packed at source' },
              { step: '03', icon: '🏡', title: 'Delivered to Your Door', desc: 'Farm fresh produce, straight from tribal farms to your home' },
            ].map(item => (
              <div key={item.step} className="rounded-2xl border border-gold-500/10 bg-forest-950/60 p-6 sm:p-7 text-center hover:border-gold-500/30 hover:-translate-y-0.5 transition-all">
                <span className="font-heading text-xs font-bold tracking-[0.2em] uppercase text-gold-500/50">{item.step}</span>
                <div className="mt-3 text-4xl">{item.icon}</div>
                <h3 className="mt-3 font-heading text-lg font-semibold text-cream-50">{item.title}</h3>
                <p className="mt-1.5 text-sm text-cream-50/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact section */}
      <section className="relative bg-forest-900 py-8 lg:py-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">Our Impact</span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">Our <span className="text-gold-500 italic">Impact</span></h2>
          <p className="mt-2 text-sm text-cream-50/50 max-w-md mx-auto">Every purchase creates a positive impact.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { icon: '❤️', title: 'Supporting Local Farmers', desc: 'Every order helps strengthen farming communities.' },
              { icon: '🌱', title: 'Sustainable Farming', desc: 'Encouraging eco-friendly and traditional farming practices.' },
              { icon: '🥣', title: 'Healthy Families', desc: 'Nutritious foods that promote healthier lifestyles.' },
              { icon: '🇮🇳', title: 'Made in India', desc: 'Proudly supporting Indian agriculture and local businesses.' },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-gold-500/10 bg-forest-950/60 p-5 text-center hover:border-gold-500/30 hover:-translate-y-0.5 transition-all">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-2 font-heading text-sm font-semibold text-cream-50">{item.title}</h3>
                <p className="mt-1 text-[11px] text-cream-50/50">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 max-w-2xl mx-auto">
            <p className="text-sm text-cream-50/50 leading-relaxed italic border-l-2 border-gold-500/30 pl-4 text-left">
              &ldquo;When you choose us, you&rsquo;re not just buying food&mdash;you are supporting farmers, protecting traditions, and bringing healthier choices to your family.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative bg-cream-100 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-terracotta-500">Testimonials</span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">What Our <span className="text-terracotta-500 italic">Customers</span> Say</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { quote: 'The millets taste just like home. So fresh and authentic — reminds me of my grandmother\'s cooking.', name: 'Priya S.', location: 'Hyderabad' },
              { quote: 'Finally, real chemical-free produce. My family loves the natural sweetness of the forest honey.', name: 'Rajesh K.', location: 'Bangalore' },
              { quote: 'Direct from tribal farmers with no middlemen. This is the future of food in India.', name: 'Ananya M.', location: 'Chennai' },
            ].map(item => (
              <div key={item.name} className="rounded-2xl border border-forest-900/10 bg-white p-6 text-left shadow-sm hover:border-terracotta-500/30 hover:shadow-md transition-all">
                <div className="flex gap-1 text-terracotta-500/60 text-sm mb-3">★★★★★</div>
                <p className="text-sm text-forest-900/70 leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3 border-t border-forest-900/5 pt-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta-500/20 text-sm font-bold text-terracotta-600">{item.name[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-forest-900">{item.name}</p>
                    <p className="text-xs text-forest-900/40">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Combos */}
      <section className="relative bg-cream-100 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-terracotta-500">Farm to Home</span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">Value Combos You&rsquo;ll Love</h2>
          <p className="mt-2 text-sm text-forest-900/50 max-w-md mx-auto">Handpicked combinations that bring freshness, nutrition, and savings together.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🥣', name: 'Healthy Breakfast Combo', items: 'Millets + Honey + Dry Fruits', save: '15%', original: '₹1,299', discounted: '₹1,099', badge: 'Save 15%', popular: false },
              { icon: '🌶', name: 'Kitchen Essentials Combo', items: 'Spices + Rice + Grocery Staples', save: '10%', original: '₹1,999', discounted: '₹1,799', badge: 'Save 10%', popular: false },
              { icon: '🌾', name: 'Wellness Combo', items: 'Millets + Cold Pressed Oil + Honey', save: '20%', original: '₹1,599', discounted: '₹1,279', badge: 'Best Seller', popular: false },
              { icon: '🎁', name: 'Family Combo Pack', items: 'Everyday groceries for the whole family.', save: '12%', original: '₹2,499', discounted: '₹2,199', badge: 'Most Popular', popular: true },
            ].map((combo, i) => (
              <div key={i} className={`rounded-2xl border ${combo.popular ? 'border-terracotta-500/30 bg-white shadow-lg ring-1 ring-terracotta-500/10' : 'border-forest-900/10 bg-white shadow-sm'} p-5 text-center transition-all hover:shadow-xl hover:-translate-y-1`}>
                {combo.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-500/10 px-3 py-1 text-[9px] font-semibold tracking-[0.1em] uppercase text-terracotta-600 mb-2">Most Popular</span>
                )}
                <span className="text-3xl">{combo.icon}</span>
                <h3 className="mt-2 font-heading text-sm font-semibold text-forest-900">{combo.name}</h3>
                <p className="mt-1 text-[11px] text-forest-900/50">{combo.items}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-xs text-forest-900/30 line-through">{combo.original}</span>
                  <span className="font-heading text-lg font-bold text-terracotta-500">{combo.discounted}</span>
                </div>
                <span className="inline-block mt-1 rounded-full bg-green-600/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">Save {combo.save}</span>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="flex-1 rounded-xl bg-terracotta-500 py-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-cream-50 transition-all hover:bg-terracotta-600">
                    Add to Cart
                  </button>
                  <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest-900/10 text-forest-900/30 transition-all hover:border-terracotta-500/30 hover:text-terracotta-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm to Home closing */}
      <section className="bg-forest-950 py-6 text-center border-t border-gold-500/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="font-heading text-2xl font-bold text-gold-500 sm:text-3xl italic">Farm to Home</p>
          <p className="mt-2 text-xs text-cream-50/40">Pure forest-grown produce from tribal farms. Delivered to your doorstep.</p>
        </div>
      </section>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/919709704563" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-[76px] left-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_8px_32px_rgba(37,211,102,0.35)] transition-all hover:bg-[#20BD5A] hover:-translate-y-1 sm:bottom-8 sm:left-8 sm:h-16 sm:w-16 btn-lift"
        aria-label="WhatsApp">
        <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')}
        className="fixed bottom-[76px] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta-500 text-cream-50 shadow-[0_8px_32px_rgba(182,90,52,0.35)] transition-all hover:bg-terracotta-600 hover:-translate-y-1 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16 btn-lift"
        aria-label="Shopping cart">
        <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-forest-900 px-2 py-0.5 text-xs font-bold text-cream-50 shadow-sm">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
