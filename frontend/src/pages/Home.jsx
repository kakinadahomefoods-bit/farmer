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
  const sectionRef = useRef([])
  const [visibleSections, setVisibleSections] = useState({})

  const catList = categories.filter(c => c.name && c.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
  const groupedProducts = {}
  const uncategorized = []
  allProducts.forEach(p => {
    const catName = p.category?.name || p.categoryName
    if (catName) {
      if (!groupedProducts[catName]) groupedProducts[catName] = []
      groupedProducts[catName].push(p)
    } else {
      uncategorized.push(p)
    }
  })
  let sectionIdx = 5
  const categorySections = catList.map(cat => {
    const catProducts = groupedProducts[cat.name] || []
    if (catProducts.length === 0) return null
    return {
      key: cat._id || cat.name,
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      desc: cat.description || `Organic ${cat.name}`,
      link: `/products?category=${cat.slug || cat.name}`,
      products: catProducts,
      idx: sectionIdx++,
    }
  }).filter(Boolean)
  const hasCategoryProducts = categorySections.length > 0
  const allProductsPool = allProducts.length > 0 ? allProducts : products
  const fallbackPool = uncategorized.length > 0 ? uncategorized : allProductsPool
  const showFallbackGrid = !hasCategoryProducts && fallbackPool.length > 0

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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [entry.target.dataset.section]: true }))
        }
      })
    }, { threshold: 0.15 })
    sectionRef.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

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

  const displayProducts = products.length > 5 ? [...products, ...products, ...products] : products

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
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
            <div className="max-w-3xl mx-auto animate-fade-up">
              <p className="font-heading text-sm font-semibold tracking-[0.25em] uppercase text-gold-500/60 mb-3">HI</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-5 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500 mb-6">From Tribal Villages</div>
              <p className="font-heading text-sm font-semibold tracking-[0.25em] uppercase text-cream-50/40 mb-4">Real Food. Real Farmers. Real Health.</p>
              <h1 className="font-heading text-5xl font-bold leading-tight text-cream-50 sm:text-6xl lg:text-7xl tracking-tight">
                Naturally Grown,<br />
                <span className="text-gold-500 italic">Tribal Cultivated</span>
              </h1>
              <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-cream-50/60 sm:text-lg">
                Pure forest-grown produce direct from tribal farms. No middlemen. No chemicals. Farm to home.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link to="/products" className="btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-9 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 transition-all duration-300 hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/25 btn-lift">
                  Explore Products
                </Link>
                <Link to="/about" className="btn-font inline-flex items-center gap-2 rounded-xl border border-cream-50/25 px-9 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 transition-all duration-300 hover:bg-cream-50/10 hover:-translate-y-1">
                  Our Story
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-cream-50/40">
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase"><span className="text-gold-500">✦</span> 100% Natural</div>
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase"><span className="text-gold-500">✦</span> Ethically Sourced</div>
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase"><span className="text-gold-500">✦</span> Farm to Home</div>
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
      <div className="organic-divider-gold"><div className="absolute inset-0 bg-cream-50" /></div>
      <section className="bg-cream-50 py-6" ref={el => sectionRef.current[0] = el} data-section="trust">
        <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 reveal ${visibleSections.trust ? 'visible' : ''}`}>
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            {[
              { number: '20+', label: 'Traditional Foods' },
              { number: '100%', label: 'Chemical Free' },
              { number: 'Direct', label: 'From Tribal Farmers' },
              { number: '₹2,599+', label: 'Free Shipping' },
            ].map(item => (
              <div key={item.label}>
                <p className="font-heading text-2xl font-bold text-terracotta-500 sm:text-3xl">{item.number}</p>
                <p className="text-[11px] font-semibold text-forest-900">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <p className="font-heading text-xs italic text-forest-900/50">Every Order Supports Tribal Farmers</p>
          </div>
        </div>
      </section>

      <div className="organic-divider"><div className="absolute inset-0 bg-forest-900" /></div>

      {/* Story section */}
      <section className="relative bg-forest-900 py-14 lg:py-20 overflow-hidden text-center" ref={el => sectionRef.current[1] = el} data-section="story">
        <div className={`mx-auto max-w-3xl px-5 sm:px-8 lg:px-10 reveal ${visibleSections.story ? 'visible' : ''}`}>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500 mb-4">Our Story</span>
          <h2 className="font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">From the <span className="text-gold-500 italic">Tribes</span></h2>
          <p className="mt-4 text-sm leading-relaxed text-cream-50/60 max-w-2xl mx-auto">
            For generations, tribal farmers have cultivated the land using traditional methods — rainwater-fed, pesticide-free, 
            and in perfect harmony with nature. We bring this ancient wisdom directly to your home.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-center">
            {[
              { icon: '🌿', title: 'Direct from Tribes' },
              { icon: '🌱', title: '100% Natural' },
              { icon: '💚', title: 'Supporting Communities' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-2 text-cream-50/70">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium tracking-wider uppercase">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category sections */}
      {hasCategoryProducts ? categorySections.map((section, ci) => (
        <div key={section.key}>
          {ci > 0 && <div className="organic-divider"><div className="absolute inset-0 bg-forest-900" /></div>}
          <section className={`relative bg-forest-900 py-12 lg:py-16 ${ci % 2 === 0 ? '' : 'bg-forest-950'}`} ref={el => sectionRef.current[section.idx] = el} data-section={`cat-${section.slug}`}>
            <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 reveal ${visibleSections[`cat-${section.slug}`] ? 'visible' : ''}`}>
              <div className="flex items-end justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">{section.name}</span>
                  <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">{section.desc}</h2>
                </div>
                <Link to={section.link} className="hidden sm:inline-flex btn-font items-center gap-2 rounded-xl border border-cream-50/20 px-6 py-3 text-xs font-semibold tracking-[0.08em] uppercase text-cream-50/60 transition-all hover:bg-cream-50/10 hover:text-cream-50 hover:-translate-y-0.5">
                  View All
                </Link>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.products.slice(0, 4).map(product => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
              <div className="mt-4 text-center sm:hidden">
                <Link to={section.link} className="btn-font inline-flex items-center gap-2 rounded-xl border border-cream-50/20 px-6 py-3 text-xs font-semibold tracking-[0.08em] uppercase text-cream-50/60 transition-all hover:bg-cream-50/10 hover:text-cream-50">
                  View All {section.name}
                </Link>
              </div>
            </div>
          </section>
        </div>
      )) : showFallbackGrid && (
        <div>
          <div className="organic-divider"><div className="absolute inset-0 bg-forest-900" /></div>
          <section className="relative bg-forest-900 py-12 lg:py-16" ref={el => sectionRef.current[5] = el} data-section="all-products">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">Our Collection</span>
                <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">Premium <span className="text-gold-500 italic">Produce</span></h2>
                <p className="mt-2 text-sm text-cream-50/50 max-w-md mx-auto">Pure forest-grown produce direct from tribal farms</p>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {fallbackPool.slice(0, 8).map(product => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* New arrivals */}
      <section className="relative bg-cream-100 py-14 lg:py-20" ref={el => sectionRef.current[2] = el} data-section="arrivals">
        <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 reveal ${visibleSections.arrivals ? 'visible' : ''}`}>
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-terracotta-500">Fresh from the farm</span>
              <h2 className="mt-3 font-heading text-4xl font-bold text-forest-900 sm:text-5xl tracking-tight">New Arrivals</h2>
              <p className="mt-2 text-sm text-forest-900/50 max-w-md">Handpicked organic produce from tribal farmers. Fresh harvest, direct to your door.</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex btn-font items-center gap-2 rounded-xl border border-forest-900/20 px-6 py-3 text-xs font-semibold tracking-[0.08em] uppercase text-forest-900 transition-all hover:bg-forest-900 hover:text-cream-50 hover:-translate-y-0.5">
              View All
            </Link>
          </div>
          <div className="mt-6">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-forest-900/10 bg-cream-50 p-10 text-center">
                <p className="font-heading text-lg text-forest-900/40 italic">No products yet</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x" style={{ scrollPaddingLeft: 'calc(50% - 140px)' }}>
                {displayProducts.map((product, idx) => (
                  <div key={`${product._id || product.id}-${idx}`} className="w-[200px] flex-none snap-start">
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/products" className="btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-8 py-3 text-xs font-semibold tracking-[0.08em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-0.5 shadow-lg shadow-terracotta-500/20">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Promo banners */}
      {promoList.length > 0 && (
        <>
          <div className="organic-divider"><div className="absolute inset-0 bg-forest-900" /></div>
          <section className="relative bg-forest-900 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">Special Offers</span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-cream-50 sm:text-4xl tracking-tight">Farm Fresh Deals</h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
        </>
      )}

      <div className="organic-divider"><div className="absolute inset-0 bg-forest-900" /></div>

      {/* Impact section */}
      <section className="relative bg-forest-900 py-14 lg:py-20 overflow-hidden" ref={el => sectionRef.current[3] = el} data-section="impact">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #C8A96A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center reveal ${visibleSections.impact ? 'visible' : ''}`}>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">Our Impact</span>
          <h2 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl tracking-tight">Making a <span className="text-gold-500 italic">Difference</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-cream-50/50">Every purchase supports indigenous communities and preserves ancient agricultural traditions.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { number: '20+', label: 'Farmers Empowered', icon: '👨‍🌾' },
              { number: '100%', label: 'Chemical Free', icon: '🌿' },
              { number: '946+', label: 'Community Members', icon: '🤝' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl border border-gold-500/10 bg-forest-950/60 p-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/10 text-2xl">{item.icon}</div>
                <p className="font-heading text-3xl font-bold text-gold-500">{item.number}</p>
                <p className="mt-1 font-heading text-sm font-semibold text-cream-50">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="organic-divider organic-divider-reverse"><div className="absolute inset-0 bg-cream-100" /></div>

      {/* Combos */}
      <section className="relative bg-cream-100 py-14 lg:py-20" ref={el => sectionRef.current[4] = el} data-section="combos">
        <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 reveal ${visibleSections.combos ? 'visible' : ''}`}>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-500/20 bg-terracotta-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-terracotta-500">Farm to Home</span>
            <h2 className="mt-3 font-heading text-4xl font-bold text-forest-900 sm:text-5xl tracking-tight">Family Combos</h2>
            <p className="mt-2 text-sm text-forest-900/50">Thoughtfully curated bundles from tribal farms. Best value, pure quality. Free shipping on orders above ₹2,599.</p>
          </div>
          <div className="mt-6 space-y-4">
            {bundles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-forest-900/10 bg-cream-50 p-10 text-center">
                <p className="font-heading text-lg text-forest-900/40 italic">No combos yet</p>
              </div>
            ) : bundles.map(b => <BundleCard key={b._id || b.id} bundle={b} />)}
          </div>
          <div className="mt-6 text-center">
            <Link to="/combos" className="btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-10 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/20 btn-lift">
              View All Bundles
            </Link>
          </div>
        </div>
      </section>

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
