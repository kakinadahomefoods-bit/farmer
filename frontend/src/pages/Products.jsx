import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../lib/productService'
import SeoHead from '../components/SeoHead'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at'
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [cats, result] = await Promise.all([getCategories(), getProducts(page, 50, category || null, search || null, sort, false)])
        setCategories(cats || [])
        setProducts(result?.data || [])
        setTotal(result?.total || 0)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [page, category, search, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(prev => { prev.set('search', searchInput); prev.set('page', '1'); return prev })
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="relative bg-forest-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-gold-500">From Tribal Farms</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl tracking-tight">Our Products</h1>
          <p className="mt-3 text-cream-50/60 max-w-lg mx-auto">Naturally grown organic produce from tribal villages. Pesticide-free, chemical-free, pure.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SeoHead title="Products" description="Browse our wide selection of organic groceries including vegetables, fruits, spices like pasupu (turmeric), karam (red chili), and more. All naturally grown from tribal villages." />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." className="w-64 rounded-full border border-border-warm bg-white px-4 py-2 text-sm text-text-dark placeholder:text-forest-900/40 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 outline-none" />
            <button type="submit" className="rounded-full bg-terracotta-500 px-5 py-2 text-sm font-semibold tracking-[0.05em] uppercase text-cream-50 transition hover:bg-terracotta-600">Search</button>
          </form>
          <select value={sort} onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); prev.set('page', '1'); return prev })} className="rounded-full border border-border-warm bg-white px-4 py-2 text-sm text-text-dark focus:border-terracotta-500 outline-none">
            <option value="created_at">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>

        {categories.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button onClick={() => setSearchParams(prev => { prev.delete('category'); prev.set('page', '1'); return prev })} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.05em] transition ${!category ? 'bg-forest-900 text-cream-50' : 'bg-white text-forest-900/60 border border-border-warm hover:bg-cream-100'}`}>All</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSearchParams(prev => { prev.set('category', cat.slug || cat.id); prev.set('page', '1'); return prev })} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.05em] transition ${category === (cat.slug || cat.id) ? 'bg-forest-900 text-cream-50' : 'bg-white text-forest-900/60 border border-border-warm hover:bg-cream-100'}`}>{cat.name}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-heading text-xl font-semibold text-text-dark">No products found</p>
            <p className="mt-1 text-sm text-forest-900/50">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map(product => <ProductCard key={product.id} product={product} compact />)}
            </div>
            {total > 50 && (
              <div className="mt-8 flex justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setSearchParams(prev => { prev.set('page', page - 1); return prev })} className="rounded-full border border-border-warm bg-white px-5 py-2 text-sm font-semibold text-text-dark hover:bg-cream-100 transition disabled:opacity-50">Previous</button>
                <span className="flex items-center px-4 text-sm font-semibold text-text-dark">Page {page}</span>
                <button disabled={products.length < 50} onClick={() => setSearchParams(prev => { prev.set('page', page + 1); return prev })} className="rounded-full border border-border-warm bg-white px-5 py-2 text-sm font-semibold text-text-dark hover:bg-cream-100 transition disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
