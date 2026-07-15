import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { formatPrice, getImageUrl } from '../../lib/utils'
import { toast } from 'react-toastify'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const result = await api.getProducts({ page, limit: 20, search, active: 'all' })
      setProducts(result.data || [])
      setTotal(result.total || 0)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load() }

  const handleToggleActive = async (id) => {
    try { await api.toggleProductActive(id); toast.success('Toggled'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleToggleFeatured = async (id) => {
    try { await api.toggleProductFeatured(id); toast.success('Featured toggled'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to hide this product? Orders will be preserved.')) return
    try { await api.deleteProduct(id); toast.success('Product hidden'); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">+ Add Product</Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
        <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 transition">Search</button>
      </form>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                <th className="p-3 font-medium">Product</th><th className="p-3 font-medium">Category</th><th className="p-3 font-medium">Price</th><th className="p-3 font-medium">Stock</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Featured</th><th className="p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(p.images?.[0])} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                        <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-[10px] text-slate-400">{p.slug}</p></div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{p.category?.name || '-'}</td>
                    <td className="p-3 font-medium">{formatPrice(p.basePrice)}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold ${p.variants?.some(v => v.stock > 0) ? 'text-green-600' : 'text-red-600'}`}>
                        {p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0} units
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggleActive(p._id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{p.isActive ? 'Active' : 'Hidden'}</button>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggleFeatured(p._id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>{p.isFeatured ? 'Featured' : 'Normal'}</button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/products/${p._id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Edit</Link>
                        <button onClick={() => handleDelete(p._id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Hide</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="mt-4 flex justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Previous</button>
              <span className="flex items-center px-3 text-sm text-slate-600">Page {page} of {Math.ceil(total / 20)}</span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
