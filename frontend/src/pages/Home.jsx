import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import LifestyleCard from '../components/LifestyleCard'
import BundleCard from '../components/BundleCard'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import { api } from '../lib/api'
import { getComboBundles as getSupabaseComboBundles } from '../lib/productService'
import { formatPrice, getImageUrl } from '../lib/utils'
import { CartIcon } from '../components/Icons'
import { HOME_ASSETS, getHeroAsset } from '../lib/homeAssets'

const HERO_SLIDES = [
  { title: 'Pure Food from the Heart of the Forest', sub: 'Wild-harvested millets, honey, and spices sourced directly from tribal communities.', cta: 'Shop Now' },
  { title: 'Nature\'s Finest, Direct to Your Door', sub: 'Chemical-free produce grown with traditional wisdom.', cta: 'Explore Products' },
  { title: 'Support Tribal Farmers, Eat Pure', sub: 'Every purchase supports indigenous farming communities across India.', cta: 'Meet Our Farmers' },
]

const VALUES = [
  { label: 'Made in India', icon: '🇮🇳' },
  { label: 'Eco-Friendly', icon: '♻️' },
  { label: 'Ethical Practices', icon: '🤝' },
  { label: '100% Natural', icon: '🌿' },
  { label: 'Non-GMO', icon: '🌾' },
  { label: 'Farm Fresh', icon: '🌱' },
]

const CAROUSEL_TABS = ['All Products', 'Shop By Category', 'Shop By Condition', 'Super Saver Combos', 'Shop By Goal']

export default function Home() {
  const { cartItems } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [catLoading, setCatLoading] = useState({})
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)
  const [milletProducts, setMilletProducts] = useState([])
  const [grainProducts, setGrainProducts] = useState([])
  const [farmers, setFarmers] = useState([])
  const [activeTab, setActiveTab] = useState('All Products')
  const carouselRef = useRef(null)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  const scrollCarousel = useCallback((dir) => {
    if (!carouselRef.current) return
    const amt = dir > 0 ? 300 : -300
    carouselRef.current.scrollBy({ left: amt, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [productsData, bundlesData, milletData, grainData, farmersData] = await Promise.all([
          api.getProducts({ limit: 100 }).then(r => r.data || []).catch(() => []),
          api.getBundles({ combo: 'true' }).then(async r => {
            let data = r?.data || r || []
            if (!data || data.length === 0) data = await getSupabaseComboBundles().catch(() => [])
            return data
          }).catch(() => []),
          api.getProducts({ category: 'millets', limit: 6 }).then(r => r.data || []).catch(() => []),
          api.getProducts({ category: 'lentils-beans', limit: 6 }).then(r => r.data || []).catch(() => []),
          api.getFarmers({ limit: 4 }).then(r => r.data || r || []).catch(() => []),
        ])
        if (cancelled) return
        setProducts(productsData)
        setBundles(Array.isArray(bundlesData) ? bundlesData : bundlesData?.data || [])
        setMilletProducts(milletData)
        setGrainProducts(grainData)
        setFarmers(Array.isArray(farmersData) ? farmersData : farmersData?.data || [])
      } catch (err) { console.error(err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    const id = setInterval(() => setHeroIdx(prev => (prev + 1) % HERO_SLIDES.length), 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  useEffect(() => {
    let cancelled = false
    api.getCategories().then(data => {
      if (cancelled) return
      const cats = Array.isArray(data) ? data : data?.data || []
      setCategories(cats)
      if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].id || cats[0]._id)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!activeCategory) return
    const cat = categories.find(c => (c.id || c._id) === activeCategory)
    if (!cat) return
    const catName = cat.slug || cat.name?.toLowerCase()
    if (categoryProducts[catName]?.length) return
    setCatLoading(prev => ({ ...prev, [catName]: true }))
    api.getProducts({ category: catName, limit: 8 }).then(r => {
      const data = r?.data || []
      setCategoryProducts(prev => ({ ...prev, [catName]: data }))
    }).catch(() => {}).finally(() => {
      setCatLoading(prev => ({ ...prev, [catName]: false }))
    })
  }, [activeCategory, categories])

  return (
    <div className="bg-white">
      <SeoHead title="HaiFarmer" description="Wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable." />

      {/* 1. Hero slider */}
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[65vh] flex items-center">
          {HERO_SLIDES.map((slide, i) => {
            const asset = getHeroAsset(i)
            return (
              <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <picture>
                  <source srcSet={asset.desktop} media="(min-width: 768px)" />
                  <img src={asset.mobile} alt={asset.alt} loading={i === 0 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover" />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
              </div>
            )
          })}
          <div className="relative z-10 section-container">
            <div className="max-w-xl">
              <p className="text-green-200 text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">Rooted in Tradition</p>
              <h1 className="text-white">{HERO_SLIDES[heroIdx].title}</h1>
              <p className="mt-3 text-sm text-white/70 max-w-lg">{HERO_SLIDES[heroIdx].sub}</p>
              <Link to="/products" className="mt-5 inline-flex items-center gap-2 bg-green-600 text-white px-7 py-3 rounded-lg text-sm font-semibold hover:bg-green-500 transition-colors">
                {HERO_SLIDES[heroIdx].cta}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* 2. Advertisement banner — cinematic strip */}
      <section className="py-6 lg:py-8 bg-white">
        <div className="section-container">
          <Link to="/products" className="group relative block rounded-xl overflow-hidden aspect-[3/1] lg:aspect-[4/1]">
            <picture>
              <source srcSet={HOME_ASSETS.adBanner.desktop} media="(min-width: 768px)" />
              <img src={HOME_ASSETS.adBanner.mobile} alt={HOME_ASSETS.adBanner.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-green-700/90 to-green-800/80" />
            <div className="relative z-10 flex items-center justify-between h-full px-6 lg:px-10">
              <div>
                <p className="text-green-200 text-[10px] font-semibold tracking-[0.12em] uppercase">Special Offer</p>
                <h2 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold text-white">Free Delivery on orders above ₹999</h2>
              </div>
              <span className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all group-hover:bg-green-50 group-hover:-translate-y-0.5 shrink-0">
                Shop Now →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Tall lifestyle product carousel */}
      <section className="py-10 lg:py-14 bg-off-white overflow-hidden">
        <div className="section-container">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CAROUSEL_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all tracking-wide ${
                  activeTab === tab ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-ink/60 hover:text-green-600 border border-border'
                }`}>
                {tab === 'All Products' ? 'All Products' : tab}
              </button>
            ))}
          </div>

          {/* Carousel with arrows */}
          <div className="relative">
            <button onClick={() => scrollCarousel(-1)} className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-ink hover:text-green-600 transition border border-border" aria-label="Previous">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollCarousel(1)} className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md text-ink hover:text-green-600 transition border border-border" aria-label="Next">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <div ref={carouselRef} className="flex gap-3.5 overflow-x-auto hide-scrollbar carousel-snap pb-2">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <div key={i} className="lifestyle-card bg-white/80 animate-pulse rounded-xl" />)
              ) : products.length > 0 ? (
                products.slice(0, 20).map((product, i) => (
                  <LifestyleCard key={product.id || product._id} product={product} priority={i < 4}
                    headline={i % 3 === 0 ? 'Support your vitality with nature\'s purity' : undefined} />
                ))
              ) : (
                <div className="flex items-center justify-center w-full py-20 text-sm text-muted">No products yet</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Groceries — auto-scrolling carousel */}
      <section className="py-10 lg:py-14 bg-white overflow-hidden">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading">Groceries</h2>
              <p className="text-sm text-muted mt-0.5">Everyday essentials</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-72 animate-pulse" />)}
            </div>
          ) : products.length > 0 ? (
            <div className="relative w-full">
              <style>{`
                @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .carousel-track { display: flex; gap: 1rem; width: max-content; animation: scroll-left 80s linear infinite; }
                .carousel-track:hover { animation-play-state: paused; }
                .carousel-track > * { width: 200px; flex-shrink: 0; }
                @media (min-width: 640px) { .carousel-track > * { width: 220px; } }
                @media (min-width: 1024px) { .carousel-track > * { width: 240px; } }
              `}</style>
              <div className="carousel-track">
                {[...products, ...products].map((product, i) => (
                  <div key={`${product.id || product._id}-${i}`} className="h-full"><ProductCard product={product} /></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-off-white rounded-xl border border-border">
              <p className="text-sm text-muted">No products available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. 9:16 Vertical Videos — Reels */}
      <section className="py-10 lg:py-14 bg-white overflow-hidden">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading">Stories from the Soil</h2>
              <p className="text-sm text-muted mt-0.5">Short videos from our tribal communities</p>
            </div>
            <a href={`https://www.youtube-nocookie.com/embed/${HOME_ASSETS.youtube.videoId}`} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">Watch All →</a>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar carousel-snap pb-2">
            {HOME_ASSETS.reels.map((reel, i) => (
              <div key={i} className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[240px]">
                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-green-50 relative group cursor-pointer">
                  {reel.src ? (
                    <video muted loop playsInline preload="none"
                      className="h-full w-full object-cover"
                      poster={reel.poster}
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                      onTouchStart={(e) => {
                        const v = e.currentTarget
                        v.paused ? v.play().catch(() => {}) : v.pause()
                      }}>
                      <source src={reel.src} type="video/mp4" />
                    </video>
                  ) : (
                    <>
                      <img src={reel.poster} alt={reel.alt} loading="lazy" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                          <svg className="h-5 w-5 text-ink ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <p className="text-xs font-medium text-white drop-shadow-sm line-clamp-1">{reel.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Our Story video */}
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Our Story</span>
              <h2 className="mt-1">From the Forest to Your Home</h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">Watch how we work with tribal farmers to bring you the purest, most natural products.</p>
              <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">Learn More →</Link>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-green-50 relative group cursor-pointer">
              {HOME_ASSETS.videoSection.src ? (
                <video controls poster={HOME_ASSETS.videoSection.poster} className="h-full w-full object-cover" preload="none">
                  <source src={HOME_ASSETS.videoSection.src} type={HOME_ASSETS.videoSection.type} />
                </video>
              ) : (
                <>
                  <img src={HOME_ASSETS.videoSection.poster} alt={HOME_ASSETS.videoSection.alt} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-green-600/90 flex items-center justify-center transition-transform group-hover:scale-110">
                      <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/40 px-3 py-1 rounded-full">Brand film coming soon</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Combos */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading">Value Combos</h2>
              <p className="text-sm text-muted mt-0.5">Curated bundles, best savings</p>
            </div>
            <Link to="/combos" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-56 animate-pulse" />)}
            </div>
          ) : bundles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bundles.slice(0, 4).map(bundle => (
                <BundleCard key={bundle._id || bundle.id} bundle={bundle} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-off-white rounded-xl border border-border">
              <p className="text-sm text-muted">No combos available yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-sm font-semibold text-green-600 hover:text-green-700">Browse Products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 8. YouTube video */}
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="text-center mb-6">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Watch & Learn</span>
            <h2 className="mt-1">From Farm to Table</h2>
            <p className="text-sm text-muted mt-0.5 max-w-md mx-auto">See how traditional farming nourishes communities.</p>
          </div>
          <div className="aspect-video rounded-xl overflow-hidden bg-green-50 max-w-4xl mx-auto">
            <div className="relative h-full w-full" style={{ padding: '56.25% 0 0 0' }}>
              <iframe src={`https://www.youtube-nocookie.com/embed/${HOME_ASSETS.youtube.videoId}?rel=0&showinfo=0`}
                title="HaiFarmer — From Farm to Table"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. Millets */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Traditional Grains</span>
              <h2 className="mt-0.5">Millets</h2>
            </div>
            <Link to="/products?category=millets" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-72 animate-pulse" />)}
            </div>
          ) : milletProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {milletProducts.slice(0, 6).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-off-white rounded-xl border border-border">
              <p className="text-sm text-muted">No millet products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-sm font-semibold text-green-600 hover:text-green-700">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 10. Lentils & Beans */}
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Protein Rich</span>
              <h2 className="mt-0.5">Lentils & Beans</h2>
            </div>
            <Link to="/products?category=lentils-beans" className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-72 animate-pulse" />)}
            </div>
          ) : grainProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {grainProducts.slice(0, 6).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-border">
              <p className="text-sm text-muted">No grain products yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-sm font-semibold text-green-600 hover:text-green-700">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 11. About Farmers */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Our Heroes</span>
            <h2 className="mt-1">Meet Our Tribal Farmers</h2>
          </div>
          {farmers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {farmers.slice(0, 4).map(farmer => (
                <Link key={farmer._id || farmer.id} to={`/farmers/${farmer.qrCode || farmer.code || farmer._id}`}
                  className="group rounded-xl border border-border bg-off-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-[1/1] overflow-hidden bg-green-100">
                    {farmer.image_url ? (
                      <img src={getImageUrl(farmer.image_url)} alt={farmer.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-green-600/40 text-5xl">👨‍🌾</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-heading text-sm font-bold text-ink group-hover:text-green-600 transition-colors">{farmer.name}</h3>
                    {farmer.village && <p className="text-xs text-muted mt-0.5">{farmer.village}{farmer.district ? `, ${farmer.district}` : ''}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Rama Devi', village: 'Araku Valley' },
                { name: 'Lakshmi Naidu', village: 'Paderu' },
                { name: 'Sanya Bai', village: 'Chintapalli' },
                { name: 'Mohan Rao', village: 'Maredumilli' },
              ].map((farmer, i) => (
                <Link key={i} to="/farmers"
                  className="group rounded-xl border border-border bg-off-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-[1/1] overflow-hidden bg-green-100 flex items-center justify-center text-green-600/40 text-5xl">👨‍🌾</div>
                  <div className="p-3">
                    <h3 className="font-heading text-sm font-bold text-ink group-hover:text-green-600 transition-colors">{farmer.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{farmer.village}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link to="/farmers"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-7 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              Meet All Our Farmers
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Shop by Category */}
      <section className="py-10 lg:py-14 bg-off-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Shop by</span>
            <h2 className="mt-1">Category</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.length === 0 ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-9 w-20 rounded-full bg-border animate-pulse" />)}
              </div>
            ) : (
              categories.map(cat => {
                const cid = cat.id || cat._id
                const isActive = cid === activeCategory
                return (
                  <button key={cid} onClick={() => setActiveCategory(cid)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                      isActive ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-muted border-border hover:border-green-300 hover:text-green-600'
                    }`}>
                    {cat.name}
                  </button>
                )
              })
            )}
          </div>
          {categories.map(cat => {
            const cid = cat.id || cat._id
            if (cid !== activeCategory) return null
            const catName = cat.slug || cat.name?.toLowerCase()
            const catProducts = categoryProducts[catName]
            const isLoading = catLoading[catName]
            return (
              <div key={cid}>
                <div className="grid lg:grid-cols-3 gap-4">
                  <Link to={`/products?category=${catName}`} className="group relative rounded-xl overflow-hidden min-h-[240px] lg:min-h-full flex flex-col justify-end p-5 lg:col-span-1">
                    <img src={cat.image_url ? getImageUrl(cat.image_url) : '/assets/left-banner.svg'} alt={cat.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-800/30 to-transparent" />
                    <div className="relative z-10">
                      <h3 className="font-heading text-xl font-bold text-white">{cat.name}</h3>
                      {cat.description && <p className="mt-1 text-sm text-white/70 line-clamp-1">{cat.description}</p>}
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:underline">Shop {cat.name} →</span>
                    </div>
                  </Link>
                  <div className="lg:col-span-2">
                    {isLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-72 animate-pulse" />)}
                      </div>
                    ) : catProducts && catProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {catProducts.slice(0, 6).map(product => (
                          <ProductCard key={product.id || product._id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[180px] bg-white rounded-xl border border-border">
                        <p className="text-sm text-muted">No products in this category yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                {catProducts && catProducts.length > 6 && (
                  <div className="mt-5 text-center">
                    <Link to={`/products?category=${catName}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                      View All {cat.name} Products →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 13. Values strip */}
      <section className="py-5 bg-off-white border-t border-border">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {VALUES.map(v => (
              <div key={v.label} className="flex items-center gap-1.5 text-sm text-muted">
                <span className="text-sm">{v.icon}</span>
                <span className="text-[11px] font-medium">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating cart */}
      <button type="button" onClick={() => navigate('/checkout')}
        className="fixed bottom-[76px] left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all hover:bg-green-700 hover:-translate-y-1 sm:bottom-8 sm:left-8 sm:h-14 sm:w-14"
        aria-label="Shopping cart">
        <CartIcon className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-sale px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">{cartCount}</span>
        )}
      </button>
    </div>
  )
}
