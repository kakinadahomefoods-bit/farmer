import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../lib/productService'
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-font text-3xl font-extrabold text-slate-900">Products</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search products..." className="w-64 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
          <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 transition">Search</button>
        </form>
        <select value={sort} onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); prev.set('page', '1'); return prev })} className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 outline-none">
          <option value="created_at">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>

      {categories.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button onClick={() => setSearchParams(prev => { prev.delete('category'); prev.set('page', '1'); return prev })} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${!category ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSearchParams(prev => { prev.set('category', cat.slug || cat.id); prev.set('page', '1'); return prev })} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${category === (cat.slug || cat.id) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat.name}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-bold text-slate-900">No products found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map(product => <ProductCard key={product.id} product={product} compact />)}
          </div>
          {total > 50 && (
            <div className="mt-8 flex justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setSearchParams(prev => { prev.set('page', page - 1); return prev })} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50">Previous</button>
              <span className="flex items-center px-4 text-sm font-bold text-slate-700">Page {page}</span>
              <button disabled={products.length < 50} onClick={() => setSearchParams(prev => { prev.set('page', page + 1); return prev })} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
