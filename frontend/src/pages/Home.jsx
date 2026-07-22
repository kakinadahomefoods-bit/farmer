import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import BundleCard from '../components/BundleCard'
import { useCart } from '../contexts/CartContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import { api } from '../lib/api'
import { formatPrice, getImageUrl } from '../lib/utils'
import { CartIcon } from '../components/Icons'
import { HOME_ASSETS, getHeroAsset } from '../lib/homeAssets'


const HERO_SLIDES = [
  { title: 'Pure Food from the Heart of the Forest', sub: 'Wild-harvested millets, honey, and spices sourced directly from tribal communities.', cta: 'Shop Now' },
  { title: 'Nature\'s Finest, Direct to Your Door', sub: 'Chemical-free produce grown with traditional wisdom. Taste the difference.', cta: 'Explore Products' },
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
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [productsData, bundlesData, milletData, grainData, farmersData] = await Promise.all([
          api.getProducts({ limit: 100 }).then(r => r.data || []).catch(() => []),
          api.getBundles({ limit: 6 }).then(r => r.data || r || []).catch(() => []),
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

  // Fetch categories
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

  // Fetch products for active category
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

  const bestSellers = products.filter(p => p.is_best_seller || p.totalSold > 10 || p.isFeatured).slice(0, 6)

  return (
    <div className="bg-white">
      <SeoHead title="HaiFarmer" description="Wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable." />

      {/* 1. Hero slider */}
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[70vh] flex items-center">
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
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full">
            <div className="max-w-2xl">
              <p className="text-green-200 text-[11px] font-semibold tracking-[0.12em] uppercase mb-3">Rooted in Tradition</p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">{HERO_SLIDES[heroIdx].title}</h1>
              <p className="mt-4 text-sm text-white/70 max-w-lg">{HERO_SLIDES[heroIdx].sub}</p>
              <Link to="/products" className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-green-500 transition-colors">
                {HERO_SLIDES[heroIdx].cta}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === heroIdx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* 2. Advertisement banner */}
      <section className="py-8 lg:py-10 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Link to="/products" className="group relative block rounded-2xl overflow-hidden min-h-[200px] lg:min-h-[280px]">
            <picture>
              <source srcSet={HOME_ASSETS.adBanner.desktop} media="(min-width: 768px)" />
              <img src={HOME_ASSETS.adBanner.mobile} alt={HOME_ASSETS.adBanner.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-green-700/90 to-green-800/80" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12 h-full">
              <div className="text-center lg:text-left">
                <p className="text-green-200 text-[10px] font-semibold tracking-[0.12em] uppercase">Special Offer</p>
                <h2 className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">Free Delivery<br /><span className="text-green-200">on orders above ₹999</span></h2>
              </div>
              <div className="mt-4 lg:mt-0">
                <span className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-lg text-sm font-semibold transition-all group-hover:bg-green-50 group-hover:-translate-y-0.5">
                  Shop Now →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Groceries — all products */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Groceries</h2>
              <p className="text-sm text-muted mt-1">Everyday essentials straight from nature</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 15 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-80 animate-pulse" />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {products.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-border">
              <p className="text-base text-muted">No products available yet.</p>
              <p className="text-sm text-muted-light mt-1">Check back soon for our fresh harvest!</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Our Story video */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Our Story</span>
              <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-ink">From the Forest to Your Home</h2>
              <p className="mt-3 text-sm text-muted leading-relaxed">Watch how we work with tribal farmers to bring you the purest, most natural products. Every step of our journey is rooted in respect for nature and tradition.</p>
              <Link to="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                Learn More →
              </Link>
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
                    <div className="w-16 h-16 rounded-full bg-green-600/90 flex items-center justify-center transition-transform group-hover:scale-110">
                      <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/40 px-3 py-1 rounded-full">Brand film coming soon</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Super Saver Combos */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Super Saver Combos</h2>
              <p className="text-sm text-muted mt-1">Curated bundles for the best value</p>
            </div>
            <Link to="/combos" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-64 animate-pulse" />)}
            </div>
          ) : bundles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {bundles.slice(0, 3).map(bundle => (
                <BundleCard key={bundle._id || bundle.id} bundle={bundle} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-off-white rounded-xl border border-border">
              <p className="text-sm text-muted">No combos available yet. Check back soon!</p>
              <Link to="/products" className="mt-3 inline-flex text-sm font-semibold text-green-600 hover:text-green-700">Browse Products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 6. YouTube video */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-8">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Watch & Learn</span>
            <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-ink">From Farm to Table</h2>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">See how traditional farming methods preserve nature and nourish communities.</p>
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

      {/* 7. Millets */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Traditional Grains</span>
              <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-ink">Millets</h2>
              <p className="text-sm text-muted mt-1">Rainwater-fed, chemical-free millets straight from tribal farms</p>
            </div>
            <Link to="/products?category=millets" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-80 animate-pulse" />)}
            </div>
          ) : milletProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {milletProducts.slice(0, 6).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-off-white rounded-xl border border-border">
              <p className="text-sm text-muted">No millet products available yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-sm font-semibold text-green-600 hover:text-green-700">Browse all products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 8. Grains */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Protein Rich</span>
              <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-ink">Lentils & Beans</h2>
              <p className="text-sm text-muted mt-1">Traditional protein-packed legumes from indigenous farms</p>
            </div>
            <Link to="/products?category=lentils-beans" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-80 animate-pulse" />)}
            </div>
          ) : grainProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {grainProducts.slice(0, 6).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-border">
              <p className="text-sm text-muted">No grain products available yet.</p>
              <Link to="/products" className="mt-2 inline-flex text-sm font-semibold text-green-600 hover:text-green-700">Browse all products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 9. About Farmers */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Our Heroes</span>
            <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-ink">Meet Our Tribal Farmers</h2>
            <p className="text-sm text-muted mt-1 max-w-lg mx-auto">Every product tells a story of dedication, tradition, and harmony with nature.</p>
          </div>
          {farmers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="p-4">
                    <h3 className="font-heading text-base font-bold text-ink group-hover:text-green-600 transition-colors">{farmer.name}</h3>
                    {farmer.village && <p className="text-xs text-muted mt-0.5">{farmer.village}{farmer.district ? `, ${farmer.district}` : ''}</p>}
                    <p className="text-xs text-muted mt-1 line-clamp-2">{farmer.bio || farmer.products || 'Traditional tribal farmer'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Rama Devi', village: 'Araku Valley', products: 'Millets, Honey', bio: 'Third-generation tribal farmer practicing traditional millet cultivation' },
                { name: 'Lakshmi Naidu', village: 'Paderu', products: 'Spices, Tamarind', bio: 'Forest spice gatherer and organic turmeric farmer' },
                { name: 'Sanya Bai', village: 'Chintapalli', products: 'Honey, Medicinal Herbs', bio: 'Trained in sustainable forest honey harvesting' },
                { name: 'Mohan Rao', village: 'Maredumilli', products: 'Lentils, Millets', bio: 'Leads a collective of 25 tribal farming families' },
              ].map((farmer, i) => (
                <Link key={i} to="/farmers"
                  className="group rounded-xl border border-border bg-off-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="aspect-[1/1] overflow-hidden bg-green-100 flex items-center justify-center text-green-600/40 text-5xl">👨‍🌾</div>
                  <div className="p-4">
                    <h3 className="font-heading text-base font-bold text-ink group-hover:text-green-600 transition-colors">{farmer.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{farmer.village}</p>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{farmer.bio}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/farmers"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              Meet All Our Farmers
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Shop by Category — pills */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Shop by</span>
            <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-ink">Category</h2>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">Discover pure, wild-harvested goodness across our range</p>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.length === 0 ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 w-24 rounded-full bg-border animate-pulse" />)}
              </div>
            ) : (
              categories.map(cat => {
                const cid = cat.id || cat._id
                const isActive = cid === activeCategory
                return (
                  <button key={cid} onClick={() => setActiveCategory(cid)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                      isActive ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-muted border-border hover:border-green-300 hover:text-green-600'
                    }`}>
                    {cat.name}
                  </button>
                )
              })
            )}
          </div>

          {/* Active category product showcase */}
          {categories.map(cat => {
            const cid = cat.id || cat._id
            if (cid !== activeCategory) return null
            const catName = cat.slug || cat.name?.toLowerCase()
            const catProducts = categoryProducts[catName]
            const isLoading = catLoading[catName]

            return (
              <div key={cid}>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Category banner */}
                  <Link to={`/products?category=${catName}`} className="group relative rounded-xl overflow-hidden min-h-[280px] lg:min-h-full flex flex-col justify-end p-6 lg:col-span-1">
                    <img src={cat.image_url ? getImageUrl(cat.image_url) : '/assets/left-banner.svg'} alt={cat.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-800/30 to-transparent" />
                    <div className="relative z-10">
                      <h3 className="font-heading text-2xl font-bold text-white">{cat.name}</h3>
                      {cat.description && <p className="mt-1 text-sm text-white/70">{cat.description}</p>}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:underline">
                        Shop {cat.name} →
                      </span>
                    </div>
                  </Link>

                  {/* Product grid */}
                  <div className="lg:col-span-2">
                    {isLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-80 animate-pulse" />)}
                      </div>
                    ) : catProducts && catProducts.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        {catProducts.slice(0, 6).map(product => (
                          <ProductCard key={product.id || product._id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[200px] bg-white rounded-xl border border-border">
                        <p className="text-sm text-muted">No products in this category yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* View All link */}
                {catProducts && catProducts.length > 6 && (
                  <div className="mt-6 text-center">
                    <Link to={`/products?category=${catName}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                      View All {cat.name} Products →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 11. Newsletter */}
      <section className="py-14 lg:py-18 bg-white border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Sign Up To Get Updates</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">Get 15% off your first order + updates on new products and exclusive offers.</p>
          <div className="mt-6 flex gap-2 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-ink placeholder:text-muted-light outline-none focus:border-green-600 bg-white" />
            <button className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shrink-0">Subscribe</button>
          </div>
        </div>
      </section>

      {/* 12. Values strip */}
      <section className="py-6 bg-off-white border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {VALUES.map(v => (
              <div key={v.label} className="flex items-center gap-2 text-sm text-muted">
                <span className="text-base">{v.icon}</span>
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
