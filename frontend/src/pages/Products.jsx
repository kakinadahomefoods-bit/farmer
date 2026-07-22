import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../lib/productService'
import { DEMO_MODE } from '../lib/withDemoFallback'
import { demoProducts } from '../lib/demoData'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

const HARVEST_TYPES = [
  { label: 'Wild Harvested', count: 34 },
  { label: 'Farm Grown', count: 18 },
  { label: 'Natural', count: 27 },
  { label: 'Handcrafted', count: 15 },
]
const PRICE_RANGES = [
  { label: 'Under ₹200', min: 0, max: 200 },
  { label: '₹200 – ₹500', min: 200, max: 500 },
  { label: '₹500 – ₹1000', min: 500, max: 1000 },
  { label: 'Above ₹1000', min: 1000, max: Infinity },
]
const BENEFITS = [
  { label: 'Immunity Booster', count: 12 },
  { label: 'Rich in Protein', count: 8 },
  { label: 'Diabetes Friendly', count: 6 },
  { label: 'Gluten Free', count: 10 },
  { label: 'Antioxidant Rich', count: 7 },
  { label: 'Gut Friendly', count: 5 },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState({ 'Harvest Type': true, 'Price': true, 'Benefits': true })
  const page = parseInt(searchParams.get('page') || '1')
  const catSlug = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at'

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
        const result = await getProducts(page, 50, catSlug || null, search || null, sort, false)
        setProducts(DEMO_MODE && (!result?.data || result.data.length === 0) ? demoProducts : (result?.data || []))
        setTotal(DEMO_MODE && (!result?.data || result.data.length === 0) ? demoProducts.length : (result?.total || 0))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [page, catSlug, search, sort])

  const totalPages = Math.ceil(total / 50)

  const FilterSection = ({ title, children }) => {
    const open = filterOpen[title] !== false
    return (
      <div className="border-b border-border pb-5 last:border-0 last:pb-0">
        <button onClick={() => setFilterOpen(prev => ({ ...prev, [title]: !prev[title] }))}
          className="flex w-full items-center justify-between mb-3">
          <span className="text-sm font-semibold text-ink">{title}</span>
          <svg className={`h-3 w-3 text-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && <div className="space-y-1">{children}</div>}
      </div>
    )
  }

  const FilterCheckbox = ({ label, count }) => (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-green-50">
      <div className="flex items-center gap-2.5">
        <input type="checkbox" className="h-4 w-4 rounded border-border text-green-600 focus:ring-green-500/30 accent-green-600" />
        {label}
      </div>
      {count != null && <span className="text-[10px] text-muted-light">({count})</span>}
    </label>
  )

  const FilterRadio = ({ label }) => (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-green-50">
      <input type="radio" name="price" className="h-4 w-4 border-border text-green-600 focus:ring-green-500/30 accent-green-600" />
      {label}
    </label>
  )

  const collectionTitle = catSlug ? catSlug.charAt(0).toUpperCase() + catSlug.slice(1) : 'All Products'
  const collectionDesc = catSlug
    ? `Browse our range of ${catSlug} — wild-harvested and naturally processed.`
    : 'Explore our handpicked range of wild-harvested and natural products, crafted with care by tribal communities.'

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title={collectionTitle} description={collectionDesc} />

      {/* Breadcrumb + Header */}
      <div className="bg-white border-b border-border">
        <div className="section-container py-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-green-600">All Products</Link>
            {catSlug && <><span>/</span><span className="text-ink font-medium">{catSlug}</span></>}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink mt-3">{collectionTitle}</h1>
          <p className="text-sm text-muted mt-1 max-w-xl">{collectionDesc}</p>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="flex gap-8">
          {/* Filter sidebar */}
          <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:relative lg:inset-auto lg:z-auto lg:block lg:w-60 lg:flex-shrink-0`}>
            {sidebarOpen && <div className="absolute inset-0 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
            <div className="relative w-72 max-w-[85vw] bg-white p-6 lg:w-auto lg:bg-transparent lg:p-0 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-ink">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-ink"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="space-y-5">
                <FilterSection title="Harvest Type">
                  {HARVEST_TYPES.map(t => <FilterCheckbox key={t.label} label={t.label} count={t.count} />)}
                </FilterSection>
                <FilterSection title="Price">
                  {PRICE_RANGES.map(r => <FilterRadio key={r.label} label={r.label} />)}
                </FilterSection>
                <FilterSection title="Benefits">
                  {BENEFITS.map(b => <FilterCheckbox key={b.label} label={b.label} count={b.count} />)}
                </FilterSection>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="mt-6 w-full rounded-lg bg-green-600 text-white py-2.5 text-sm font-semibold lg:hidden">Apply</button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-muted">Showing <span className="font-semibold text-ink">{products.length}</span> of <span className="font-semibold text-ink">{total}</span> products</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-xs font-semibold text-muted hover:text-ink flex items-center gap-1 border border-border rounded-lg px-3 py-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" /></svg>
                  Filters
                </button>
                <select value={sort} onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink outline-none focus:border-green-600 bg-white">
                  <option value="created_at">Featured</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" /></div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <p className="text-lg font-semibold text-ink">No products found</p>
                <p className="text-sm text-muted mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {products.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-green-50 disabled:opacity-30">‹ Prev</button>
                    {Array.from({ length: Math.min(totalPages <= 5 ? totalPages : 3, totalPages) }, (_, i) => {
                      let p; if (totalPages <= 5) p = i + 1; else if (page <= 3) p = i + 1; else if (page >= totalPages - 2) p = totalPages - 4 + i; else p = page - 2 + i
                      return (
                        <button key={p} onClick={() => updateParams({ page: String(p) })}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${page === p ? 'bg-green-600 text-white' : 'border border-border text-muted hover:bg-green-50'}`}>{p}</button>
                      )
                    })}
                    <button disabled={page >= totalPages} onClick={() => updateParams({ page: String(page + 1) })}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-green-50 disabled:opacity-30">Next ›</button>
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