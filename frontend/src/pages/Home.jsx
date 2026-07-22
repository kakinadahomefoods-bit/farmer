import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
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

const CERTIFICATIONS = [
  { label: 'FSSAI Certified', icon: '✓' },
  { label: '100% Natural', icon: '🌿' },
  { label: 'Free Delivery', icon: '🚚' },

]

const CATEGORIES = [
  { name: 'Millets', slug: 'millets', desc: 'Nutrient-rich traditional grains' },
  { name: 'Honey', slug: 'honey', desc: 'Pure raw forest honey' },
  { name: 'Spices', slug: 'spices', desc: 'Aromatic single-origin spices' },
  { name: 'Pulses & Grains', slug: '', desc: 'Farm-fresh daily essentials' },
  { name: 'Cold-Pressed Oils', slug: '', desc: 'Wood-pressed traditional oils' },
  { name: 'Combos', slug: 'combos', desc: 'Curated value gift boxes' },
]

const BENEFITS = [
  { label: 'Immunity', icon: '🛡️' },
  { label: 'Gut Health', icon: '🌱' },
  { label: 'Diabetes Friendly', icon: '🍃' },
  { label: 'Energy', icon: '⚡' },
  { label: 'Sleep', icon: '🌙' },
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

  const bestSellers = products.filter(p => p.is_best_seller || p.totalSold > 10 || p.isFeatured).slice(0, 4)
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

      {/* 1.5. Certifications strip */}
      <section className="border-b border-border bg-sand/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-4 lg:py-5">
          <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-20">
            {CERTIFICATIONS.map((cert, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-ink">
                <span className="text-lg">{cert.icon}</span>
                <span className="font-medium text-[13px]">{cert.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1.75. Categories */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Shop by Category</h2>
              <p className="text-sm text-muted mt-1">Explore our range of natural products</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={cat.slug ? `/products?category=${cat.slug}` : '/products'} className="group block">
                <div className="aspect-square rounded-xl bg-green-50 flex flex-col items-center justify-center p-4 text-center transition-all group-hover:shadow-md group-hover:-translate-y-0.5 border border-transparent group-hover:border-green-200">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
                    {cat.name === 'Millets' && '🌾'}
                    {cat.name === 'Honey' && '🍯'}
                    {cat.name === 'Spices' && '🌶'}
                    {cat.name === 'Pulses & Grains' && '🫘'}
                    {cat.name === 'Cold-Pressed Oils' && '🫒'}
                    {cat.name === 'Combos' && '📦'}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-ink">{cat.name}</h3>
                  <p className="text-[10px] text-muted mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(bestSellers.length ? bestSellers : products.slice(0, 4)).map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3.5. Shop by Benefit */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink text-center">Shop by Concern</h2>
          <p className="text-sm text-muted text-center mt-1">Find products tailored to your wellness needs</p>
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-5 gap-4">
            {BENEFITS.map(b => (
              <Link key={b.label} to="/products" className="group block text-center">
                <div className="aspect-square rounded-xl bg-green-50 flex items-center justify-center text-3xl transition-all group-hover:shadow-md group-hover:-translate-y-0.5 border border-transparent group-hover:border-green-200">{b.icon}</div>
                <p className="mt-2 text-xs font-semibold text-ink">{b.label}</p>
              </Link>
            ))}
          </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {bundles.slice(0, 6).map(bundle => {
                const id = bundle._id || bundle.id
                const name = bundle.name || bundle.bundle_name
                const image = bundle.image || bundle.bundle_image_url || bundle.image_url
                const items = bundle?.items || bundle?.bundle_items || []
                const discountPct = Math.round(bundle.discountPercent || bundle.bundle_discount_percent || 0)
                const originalTotal = items.reduce((sum, item) => sum + (item.price || item.variant?.price || 0) * item.quantity, 0) || 0
                const bundlePrice = discountPct > 0 ? Number((originalTotal - originalTotal * discountPct / 100).toFixed(2)) : Number(bundle?.price || bundle?.bundle_price || 0)
                const savings = originalTotal > bundlePrice ? Math.round(originalTotal - bundlePrice) : 0
                return (
                  <Link key={id} to={`/combos/${bundle.slug || id}`} className="group bg-white rounded-xl border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="aspect-[4/3] bg-white flex items-center justify-center p-4">
                      <img src={getImageUrl(image, settings?.placeholder_image)} alt={name} className="h-full w-full object-contain" loading="lazy"
                        onError={(e) => { e.currentTarget.src = settings?.placeholder_image || 'https://placehold.co/400x300?text=Combo' }} />
                      {discountPct > 0 && (
                        <span className="absolute top-3 left-3 rounded-full bg-sale px-2.5 py-0.5 text-[9px] font-semibold uppercase text-white shadow-sm">Save {discountPct}%</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-ink line-clamp-1 group-hover:text-green-600 transition-colors">{name}</h3>
                      {items.length > 0 && <p className="text-[10px] text-muted mt-0.5">{items.length} Products</p>}
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-ink">{formatPrice(bundlePrice)}</span>
                        {savings > 0 && (
                          <span className="text-[10px] font-semibold text-sale">Save {formatPrice(savings)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
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

      {/* 6.5. Deal of the Week */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="rounded-2xl bg-green-700 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <p className="text-green-200 text-[10px] font-semibold tracking-[0.12em] uppercase">Deal of the Week</p>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-2 leading-tight">Forest Honey<br />Combo Pack</h2>
                <p className="text-white/70 text-sm mt-3">Pure wild honey + organic turmeric — the ultimate immunity duo.</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-bold text-white">₹599</span>
                  <span className="text-sm text-white/50 line-through">₹899</span>
                  <span className="text-sm font-semibold text-white bg-white/15 px-2 py-0.5 rounded">Save ₹300</span>
                </div>
                <Link to="/combos" className="mt-6 inline-flex items-center justify-center bg-white text-green-700 px-8 py-3 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors w-fit">Shop the Deal →</Link>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 min-h-[300px] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-white/10 flex items-center justify-center text-5xl">🍯</div>
                </div>
              </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(section7Products.length ? section7Products : products.slice(4, 7)).map(product => (
                    <ProductCard key={product.id || product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7.5. Brand Story */}
      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="aspect-[4/3] rounded-xl bg-green-50 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center mx-auto text-3xl">👨‍🌾</div>
                <p className="mt-4 text-sm text-muted italic">Our farmers are the heart of our purpose</p>
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Our Farmers Are the Heart of Our Purpose</h2>
              <p className="mt-4 text-sm text-muted leading-relaxed">HaiFarmer works hand-in-hand with tribal communities across India, bringing you wild-harvested and natural products while creating real impact where it matters most.</p>
              <p className="mt-3 text-sm text-muted leading-relaxed">Every purchase supports fair trade, preserves traditional knowledge, and helps sustain forest ecosystems.</p>
              <Link to="/farmers" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                Meet the Farmers
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
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

      {/* Trust strip */}
      <section className="py-6 bg-white border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {CERTIFICATIONS.map(item => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted">
                <span className="text-base">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </div>
            ))}
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
