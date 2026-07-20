import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories } from '../lib/productService'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

const CATEGORY_CARDS = [
  { name: 'All Products', slug: '', icon: '🌾' },
  { name: 'Millets', slug: 'millets', icon: '🌿' },
  { name: 'Honey', slug: 'honey', icon: '🍯' },
  { name: 'Spices', slug: 'spices', icon: '🌶️' },
  { name: 'Combos', slug: 'combos', icon: '📦' },
]

const HARVEST_TYPES = [
  { label: 'Wild Crafted', count: 12 },
  { label: 'Rainfed', count: 8 },
  { label: 'Forest Harvested', count: 6 },
  { label: 'Terrace Farmed', count: 4 },
]
const PRICE_RANGES = [
  { label: 'Under ₹200', min: 0, max: 200, count: 5 },
  { label: '₹200 – ₹500', min: 200, max: 500, count: 12 },
  { label: '₹500+', min: 500, max: Infinity, count: 8 },
]
const BENEFITS = [
  { label: 'Gluten Free', count: 10 },
  { label: 'High Fiber', count: 7 },
  { label: 'Immunity Boost', count: 6 },
  { label: 'Iron Rich', count: 4 },
  { label: 'Protein', count: 5 },
  { label: 'Detox', count: 3 },
]

const FILTER_ICONS = { 'Harvest Type': '🌱', 'Price Range': '💰', 'Benefits': '✨' }

function ChevronDown({ open }) {
  return (
    <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState('grid')
  const [filterOpen, setFilterOpen] = useState({ 'Harvest Type': true, 'Price Range': true, 'Benefits': true })
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

  const mergedCategories = useMemo(() => {
    const seen = new Set()
    const merged = []
    ;[...CATEGORY_CARDS, ...categories.map(c => ({ name: c.name, slug: c.slug || c.id, icon: '🌿' }))].forEach(c => {
      const key = c.slug || c.name
      if (!seen.has(key)) { seen.add(key); merged.push(c) }
    })
    return merged
  }, [categories])

  const totalPages = Math.ceil(total / 50)

  const FilterSection = ({ title, children }) => {
    const open = filterOpen[title] !== false
    return (
      <div className="border-b border-forest-900/10 pb-4 last:border-0 last:pb-0">
        <button onClick={() => setFilterOpen(prev => ({ ...prev, [title]: !prev[title] }))}
          className="flex w-full items-center justify-between mb-2">
          <span className="font-heading text-sm font-semibold text-forest-900 flex items-center gap-1.5">
            {FILTER_ICONS[title] && <span className="text-xs">{FILTER_ICONS[title]}</span>}
            {title}
          </span>
          <ChevronDown open={open} />
        </button>
        {open && <div className="space-y-1">{children}</div>}
      </div>
    )
  }

  const FilterCheckbox = ({ label, count, checked, onChange }) => (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-forest-900/70 transition-colors hover:bg-forest-900/5">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={checked} onChange={onChange}
          className="h-3.5 w-3.5 rounded border-forest-900/30 text-terracotta-500 focus:ring-terracotta-500/30 accent-terracotta-500" />
        {label}
      </div>
      {count != null && <span className="text-[10px] text-forest-900/30">({count})</span>}
    </label>
  )

  const FilterRadio = ({ label, count, checked, onChange }) => (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-forest-900/70 transition-colors hover:bg-forest-900/5">
      <div className="flex items-center gap-2">
        <input type="radio" checked={checked} onChange={onChange} name="price"
          className="h-3.5 w-3.5 border-forest-900/30 text-terracotta-500 focus:ring-terracotta-500/30 accent-terracotta-500" />
        {label}
      </div>
      {count != null && <span className="text-[10px] text-forest-900/30">({count})</span>}
    </label>
  )

  return (
    <div className="min-h-screen bg-[#F4EEE1]">
      <SeoHead title="All Products" description="Browse our selection of premium organic produce from tribal villages — millets, honey, spices, lentils and more." />

      {/* Header */}
      <section className="relative bg-[#11281D] pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_#11281D_0%,_#0A1E12_100%)]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-gold-500">Rooted in Tradition. Shared with Love.</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl lg:text-6xl tracking-tight">All Products</h1>
          <p className="mt-3 text-cream-50/50 max-w-lg mx-auto">Premium organic produce straight from indigenous farming communities. Pesticide-free, chemical-free, pure.</p>
        </div>
      </section>

      {/* Category cards */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="-mt-6 relative z-10 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {mergedCategories.map(cat => {
            const isActive = (catSlug === cat.slug) || (!catSlug && !cat.slug)
            return (
              <button key={cat.slug || cat.name} onClick={() => updateParams({ category: cat.slug || null, page: '1' })}
                className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 text-center transition-all duration-200 ${
                  isActive
                    ? 'bg-terracotta-500 text-cream-50 shadow-lg shadow-terracotta-500/25'
                    : 'bg-[#FBF8F1] text-terracotta-500 border border-forest-900/10 hover:shadow-md hover:-translate-y-0.5'
                }`}>
                <span className={`text-2xl ${isActive ? 'opacity-100' : 'opacity-80'}`}>{cat.icon}</span>
                <span className="font-heading text-[11px] font-bold tracking-wide uppercase">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-8">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between gap-4 mb-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-font inline-flex items-center gap-2 rounded-xl border border-forest-900/10 bg-[#FBF8F1] px-4 py-2 text-xs font-semibold text-forest-900 transition-all hover:bg-forest-900/5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" /></svg>
            Filters
          </button>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search..."
              className="flex-1 rounded-xl border border-forest-900/10 bg-[#FBF8F1] px-4 py-2 text-xs text-forest-900 placeholder:text-forest-900/40 focus:border-terracotta-500 outline-none min-w-0" />
            <button type="submit" className="btn-font rounded-xl bg-terracotta-500 px-4 py-2 text-xs font-semibold uppercase text-cream-50 transition-all hover:bg-terracotta-600">Go</button>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:relative lg:inset-auto lg:z-auto lg:block lg:w-56 lg:flex-shrink-0`}>
            {sidebarOpen && <div className="absolute inset-0 bg-forest-900/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
            <div className="relative w-72 max-w-[85vw] bg-[#F4EEE1] p-6 lg:w-auto lg:bg-transparent lg:p-0 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <span className="text-sm font-semibold text-forest-900">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="text-forest-900/50 hover:text-forest-900"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {/* Search desktop */}
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
                <FilterSection title="Harvest Type">
                  {HARVEST_TYPES.map(t => (
                    <FilterCheckbox key={t.label} label={t.label} count={t.count} checked={selectedHarvest.includes(t.label)}
                      onChange={() => setSelectedHarvest(prev => prev.includes(t.label) ? prev.filter(x => x !== t.label) : [...prev, t.label])} />
                  ))}
                </FilterSection>
                <FilterSection title="Price Range">
                  {PRICE_RANGES.map(r => (
                    <FilterRadio key={r.label} label={r.label} count={r.count} checked={selectedPrice === r.label}
                      onChange={() => setSelectedPrice(selectedPrice === r.label ? null : r.label)} />
                  ))}
                </FilterSection>
                <FilterSection title="Benefits">
                  {BENEFITS.map(b => (
                    <FilterCheckbox key={b.label} label={b.label} count={b.count} checked={selectedBenefits.includes(b.label)}
                      onChange={() => setSelectedBenefits(prev => prev.includes(b.label) ? prev.filter(x => x !== b.label) : [...prev, b.label])} />
                  ))}
                </FilterSection>
              </div>

              {/* Note card */}
              <div className="mt-6 rounded-xl bg-forest-900/5 p-4 border border-forest-900/5 relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 text-forest-900/[0.03]">
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor"><path d="M50 10C30 30 15 55 15 75c0 10 5 15 15 15 20 0 55-30 55-55C85 20 70 10 50 10z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="font-heading text-[11px] font-semibold text-forest-900 mb-1">Ethically Sourced</p>
                  <p className="text-[10px] leading-relaxed text-forest-900/60">All our products are sourced ethically and crafted with care by tribal communities.</p>
                </div>
              </div>

              <button onClick={() => setSidebarOpen(false)} className="mt-4 w-full btn-font rounded-xl bg-forest-900 py-3 text-xs font-semibold uppercase text-cream-50 transition-all hover:bg-forest-800 lg:hidden">Apply Filters</button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-xs text-forest-900/50">
                Showing <span className="font-semibold text-forest-900">{Math.min(50, total)}</span> of <span className="font-semibold text-forest-900">{total}</span> products
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-forest-900/10 bg-[#FBF8F1] p-0.5">
                  <button onClick={() => setViewMode('grid')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-900/40 hover:text-forest-900'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`rounded-md p-1.5 transition-all ${viewMode === 'list' ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-900/40 hover:text-forest-900'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>
                <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                  className="rounded-xl border border-forest-900/10 bg-[#FBF8F1] px-4 py-2 text-xs text-forest-900 outline-none focus:border-terracotta-500">
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
                <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-1.5">
                    <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}
                      className="btn-font rounded-lg border border-forest-900/10 bg-[#FBF8F1] px-3 py-2 text-xs font-semibold text-forest-900 transition-all hover:bg-forest-900/5 disabled:opacity-30">← Prev</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p
                      if (totalPages <= 5) p = i + 1
                      else if (page <= 3) p = i + 1
                      else if (page >= totalPages - 2) p = totalPages - 4 + i
                      else p = page - 2 + i
                      return (
                        <button key={p} onClick={() => updateParams({ page: String(p) })}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${page === p ? 'bg-terracotta-500 text-cream-50 shadow-sm shadow-terracotta-500/30' : 'border border-forest-900/10 bg-[#FBF8F1] text-forest-900/60 hover:bg-forest-900/5 hover:text-forest-900'}`}>{p}</button>
                      )
                    })}
                    <button disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })}
                      className="btn-font rounded-lg border border-forest-900/10 bg-[#FBF8F1] px-3 py-2 text-xs font-semibold text-forest-900 transition-all hover:bg-forest-900/5 disabled:opacity-30">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
