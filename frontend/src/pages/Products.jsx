import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories } from '../lib/productService'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

const CATEGORY_ICONS = {
  'Natural Sweeteners': '🍯',
  'Lentils & Beans': '🫘',
  'Spices & Seasonings': '🌶️',
  'Millets': '🌿',
  'Salt & Essentials': '🧂',
}

const HARVEST_TYPES = ['Rainfed', 'Wild Crafted', 'Forest Harvested', 'Terrace Farmed']
const PRICE_RANGES = [
  { label: 'Under ₹200', min: 0, max: 200 },
  { label: '₹200 – ₹500', min: 200, max: 500 },
  { label: '₹500+', min: 500, max: Infinity },
]
const BENEFITS = ['Gluten Free', 'High Fiber', 'Immunity Boost', 'Iron Rich', 'Protein', 'Detox']

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const page = parseInt(searchParams.get('page') || '1')
  const catSlug = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at'
  const [searchInput, setSearchInput] = useState(search)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedHarvest, setSelectedHarvest] = useState([])
  const [selectedPrice, setSelectedPrice] = useState(null)
  const [selectedBenefits, setSelectedBenefits] = useState([])

  const updateParams = (updates) => {
    setSearchParams(prev => {
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === undefined) prev.delete(k)
        else prev.set(k, v)
      })
      return prev
    })
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [cats, result] = await Promise.all([getCategories(), getProducts(page, 50, catSlug || null, search || null, sort, false)])
        setCategories(cats || [])
        setProducts(result?.data || [])
        setTotal(result?.total || 0)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [page, catSlug, search, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams({ search: searchInput || null, page: '1' })
  }

  const FilterGroup = ({ title, children }) => (
    <div className="border-b border-forest-900/10 pb-4 last:border-0 last:pb-0">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-forest-900/50">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )

  const FilterCheckbox = ({ label, checked, onChange }) => (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-forest-900/70 transition-colors hover:bg-forest-900/5">
      <input type="checkbox" checked={checked} onChange={onChange}
        className="h-3.5 w-3.5 rounded border-forest-900/30 text-terracotta-500 focus:ring-terracotta-500/30 accent-terracotta-500" />
      {label}
    </label>
  )

  const FilterRadio = ({ label, checked, onChange }) => (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-forest-900/70 transition-colors hover:bg-forest-900/5">
      <input type="radio" checked={checked} onChange={onChange} name="price"
        className="h-3.5 w-3.5 border-forest-900/30 text-terracotta-500 focus:ring-terracotta-500/30 accent-terracotta-500" />
      {label}
    </label>
  )

  const allCategories = useMemo(() => [
    { name: 'All', slug: '' },
    ...(categories.map(c => ({ name: c.name, slug: c.slug || c.id }))),
  ], [categories])

  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title="Products" description="Browse our selection of premium organic produce from tribal villages — millets, honey, spices, lentils and more." />

      {/* Header */}
      <section className="relative bg-forest-900 pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_#1B3326_0%,_#0F1E15_100%)]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-gold-500">From Tribal Farms</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl lg:text-6xl tracking-tight">Our Products</h1>
          <p className="mt-3 text-cream-50/50 max-w-lg mx-auto">Premium organic produce straight from indigenous farming communities. Pesticide-free, chemical-free, pure.</p>
        </div>
      </section>

      {/* Category pills */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="-mt-5 relative z-10 flex flex-wrap gap-2 justify-center">
          {allCategories.map(cat => (
            <button key={cat.name} onClick={() => updateParams({ category: cat.slug || null, page: '1' })}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-all ${catSlug === cat.slug || (!catSlug && !cat.slug) ? 'bg-terracotta-500 text-cream-50 border-terracotta-500 shadow-lg shadow-terracotta-500/20' : 'bg-white text-forest-900/60 border-forest-900/10 hover:bg-forest-900/5 hover:text-forest-900'}`}>
              {CATEGORY_ICONS[cat.name] && <span>{CATEGORY_ICONS[cat.name]}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-8">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between gap-4 mb-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-font inline-flex items-center gap-2 rounded-xl border border-forest-900/10 bg-white px-4 py-2 text-xs font-semibold text-forest-900 transition-all hover:bg-forest-900/5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" /></svg>
            Filters
          </button>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search..."
              className="flex-1 rounded-xl border border-forest-900/10 bg-white px-4 py-2 text-xs text-forest-900 placeholder:text-forest-900/40 focus:border-terracotta-500 outline-none min-w-0" />
            <button type="submit" className="btn-font rounded-xl bg-terracotta-500 px-4 py-2 text-xs font-semibold uppercase text-cream-50 transition-all hover:bg-terracotta-600">Go</button>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters — desktop always, mobile toggle */}
          <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:relative lg:inset-auto lg:z-auto lg:block lg:w-56 lg:flex-shrink-0`}>
            {/* Mobile overlay */}
            {sidebarOpen && <div className="absolute inset-0 bg-forest-900/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
            <div className={`relative w-72 max-w-[85vw] bg-cream-50 p-6 lg:w-auto lg:bg-transparent lg:p-0 overflow-y-auto ${sidebarOpen ? '' : ''}`}>
              {/* Mobile close */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <span className="text-sm font-semibold text-forest-900">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="text-forest-900/50 hover:text-forest-900"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {/* Search — desktop */}
              <form onSubmit={handleSearch} className="hidden lg:block mb-5">
                <div className="relative">
                  <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..."
                    className="w-full rounded-xl border border-forest-900/10 bg-white px-4 py-2.5 pr-10 text-sm text-forest-900 placeholder:text-forest-900/40 focus:border-terracotta-500 outline-none" />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-900/30 hover:text-terracotta-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                </div>
              </form>

              <div className="space-y-5">
                <FilterGroup title="Harvest Type">
                  {HARVEST_TYPES.map(t => (
                    <FilterCheckbox key={t} label={t} checked={selectedHarvest.includes(t)}
                      onChange={() => setSelectedHarvest(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} />
                  ))}
                </FilterGroup>
                <FilterGroup title="Price Range">
                  {PRICE_RANGES.map(r => (
                    <FilterRadio key={r.label} label={r.label} checked={selectedPrice === r.label}
                      onChange={() => setSelectedPrice(selectedPrice === r.label ? null : r.label)} />
                  ))}
                </FilterGroup>
                <FilterGroup title="Benefits">
                  {BENEFITS.map(b => (
                    <FilterCheckbox key={b} label={b} checked={selectedBenefits.includes(b)}
                      onChange={() => setSelectedBenefits(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])} />
                  ))}
                </FilterGroup>
              </div>

              {/* Mobile apply button */}
              <button onClick={() => setSidebarOpen(false)} className="mt-6 w-full btn-font rounded-xl bg-forest-900 py-3 text-xs font-semibold uppercase text-cream-50 transition-all hover:bg-forest-800 lg:hidden">Apply Filters</button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-xs text-forest-900/50">{total} Product{total !== 1 ? 's' : ''} found</p>
              <div className="flex items-center gap-3">
                <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                  className="rounded-xl border border-forest-900/10 bg-white px-4 py-2 text-xs text-forest-900 outline-none focus:border-terracotta-500">
                  <option value="created_at">Newest</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <p className="font-heading text-2xl font-semibold text-forest-900 italic">No products found</p>
                <p className="mt-1 text-sm text-forest-900/50">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {products.map(product => (
                    <div key={product.id} className="group relative">
                      <ProductCard product={product} compact />
                      {/* Seal badge */}
                      <button className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-terracotta-500 text-cream-50 opacity-0 shadow-lg shadow-terracotta-500/30 transition-all duration-300 group-hover:opacity-100 hover:scale-110 active:scale-95">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                <div className="mt-10 flex items-center justify-center gap-1">
                  <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}
                    className="btn-font rounded-lg border border-forest-900/10 bg-white px-3 py-2 text-xs font-semibold text-forest-900 transition-all hover:bg-forest-900/5 disabled:opacity-30">◀ Prev</button>
                  {Array.from({ length: Math.min(5, Math.ceil(total / 50)) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => updateParams({ page: String(p) })}
                      className={`btn-font rounded-lg px-3 py-2 text-xs font-semibold transition-all ${page === p ? 'bg-forest-900 text-cream-50 shadow' : 'border border-forest-900/10 bg-white text-forest-900 hover:bg-forest-900/5'}`}>{p}</button>
                  ))}
                  <span className="px-2 text-[10px] text-forest-900/40">of {Math.ceil(total / 50)}</span>
                  <button disabled={page >= Math.ceil(total / 50)} onClick={() => updateParams({ page: String(page + 1) })}
                    className="btn-font rounded-lg border border-forest-900/10 bg-white px-3 py-2 text-xs font-semibold text-forest-900 transition-all hover:bg-forest-900/5 disabled:opacity-30">Next ▶</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
