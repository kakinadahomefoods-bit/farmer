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

const HERO_SLIDES = [
  { title: 'Pure Food from the Heart of the Forest', sub: 'Wild-harvested millets, honey, and spices sourced directly from tribal communities.', cta: 'Shop Now', img: '' },
  { title: 'Nature\'s Finest, Direct to Your Door', sub: 'Chemical-free produce grown with traditional wisdom. Taste the difference.', cta: 'Explore Products', img: '' },
  { title: 'Support Tribal Farmers, Eat Pure', sub: 'Every purchase supports indigenous farming communities across India.', cta: 'Meet Our Farmers', img: '' },
]

const TESTIMONIALS = [
  { quote: 'The millets taste just like home. So fresh and authentic!', name: 'Priya S.', rating: 5 },
  { quote: 'Finally, real chemical-free produce. The forest honey is incredible.', name: 'Rajesh K.', rating: 5 },
  { quote: 'Direct from tribal farmers with no middlemen. This is the future.', name: 'Ananya M.', rating: 5 },
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
  const [loading, setLoading] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [productsData, bundlesData] = await Promise.all([
          api.getProducts({ limit: 12 }).then(r => r.data || []).catch(() => []),
          api.getBundles({ limit: 6 }).then(r => r.data || r || []).catch(() => []),
        ])
        if (cancelled) return
        setProducts(productsData)
        setBundles(Array.isArray(bundlesData) ? bundlesData : bundlesData?.data || [])
      } catch (err) { console.error(err) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    const id = setInterval(() => setHeroIdx(prev => (prev + 1) % HERO_SLIDES.length), 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const bestSellers = products.filter(p => p.is_best_seller || p.totalSold > 10 || p.isFeatured).slice(0, 6)
  const section2Products = products.filter(p => !bestSellers.includes(p)).slice(0, 4)
  const section7Products = products.slice(4, 8)

  return (
    <div className="bg-white">
      <SeoHead title="HaiFarmer" description="Wild-harvested and natural products sourced directly from tribal communities. Pure. Honest. Sustainable." />

      {/* 1. Hero slider */}
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[70vh] flex items-center">
          {HERO_SLIDES.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
            </div>
          ))}
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
          <Link to="/products" className="group relative block rounded-2xl overflow-hidden bg-gradient-to-r from-green-700 to-green-800 min-h-[200px] lg:min-h-[280px]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
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

      {/* 3. Products #1 — Bestsellers */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Best Sellers</h2>
              <p className="text-sm text-muted mt-1">Most loved by our customers</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-80 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {(bestSellers.length ? bestSellers : products.slice(0, 6)).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Video section */}
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
            <div className="aspect-video rounded-xl overflow-hidden bg-green-50 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <p className="mt-3 text-sm text-muted">Video placeholder — embed your brand film here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Products #2 — Combos */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Value Combos</h2>
              <p className="text-sm text-muted mt-1">Curated bundles for the best value</p>
            </div>
            <Link to="/combos" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-64 animate-pulse" />)}
            </div>
          ) : bundles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {bundles.slice(0, 3).map(bundle => (
                <BundleCard key={bundle._id || bundle.id} bundle={bundle} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted">No combos available yet. Check back soon!</p>
              <Link to="/products" className="mt-3 inline-flex text-sm font-semibold text-green-600 hover:text-green-700">Browse Products →</Link>
            </div>
          )}
        </div>
      </section>

      {/* 6. YouTube video section */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-8">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-green-600">Watch & Learn</span>
            <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-ink">From Farm to Table</h2>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">See how traditional farming methods preserve nature and nourish communities.</p>
          </div>
          <div className="aspect-video rounded-xl overflow-hidden bg-green-50 max-w-4xl mx-auto flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-sale flex items-center justify-center">
                <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <p className="mt-3 text-sm text-muted">YouTube embed placeholder — add your video URL here</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Products #3 with left banner */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left banner */}
            <Link to="/products?category=honey" className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-green-700 to-green-900 min-h-[300px] lg:min-h-full flex flex-col justify-end p-6 lg:col-span-1">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '25px 25px' }} />
              <div className="relative z-10">
                <p className="text-green-200 text-[10px] font-semibold tracking-[0.12em] uppercase">Featured Collection</p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-white">Pure Forest<br />Honey</h3>
                <p className="mt-1 text-sm text-white/70">Raw, unfiltered, straight from tribal beekeepers.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:underline">
                  Explore →
                </span>
              </div>
            </Link>

            {/* Right product grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink">More from Our Collection</h2>
                <Link to="/products" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors shrink-0">View All →</Link>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-xl bg-white border border-border h-80 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {(section7Products.length ? section7Products : products.slice(4, 7)).map(product => (
                    <ProductCard key={product.id || product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink text-center">What Our Customers Say</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(item => (
              <div key={item.name} className="bg-off-white rounded-xl border border-border p-6">
                <div className="flex text-green-600 text-sm mb-2">{'★'.repeat(item.rating)}</div>
                <p className="text-sm text-muted leading-relaxed italic">"{item.quote}"</p>
                <p className="mt-3 text-sm font-semibold text-ink">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter */}
      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Sign Up To Get Updates</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">Get 15% off your first order + updates on new products and exclusive offers.</p>
          <div className="mt-6 flex gap-2 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-ink placeholder:text-muted-light outline-none focus:border-green-600 bg-white" />
            <button className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shrink-0">Subscribe</button>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="py-6 bg-white border-t border-border">
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
