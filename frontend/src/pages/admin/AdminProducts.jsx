import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/utils'
import { cld } from '../../lib/cloudinary'
import { toast } from 'react-toastify'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const [editingPrice, setEditingPrice] = useState(null)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [priceValue, setPriceValue] = useState('')
  const [discountValue, setDiscountValue] = useState('')
  const dragItem = useRef(null)
  const fileInputRef = useRef(null)
  const [imageUploadTarget, setImageUploadTarget] = useState(null)

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

  const handleSearch = (e) => { e.preventDefault(); setPage(1) }

  const handleToggleActive = async (id) => {
    try { await api.toggleProductActive(id); toast.success('Toggled'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleToggleFeatured = async (id) => {
    try { await api.toggleProductFeatured(id); toast.success('Featured toggled'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to hide this product?')) return
    try { await api.deleteProduct(id); toast.success('Product hidden'); load() }
    catch (err) { toast.error(err.message) }
  }

  const startEditPrice = (p) => {
    setEditingPrice(p._id)
    setPriceValue(String(p.basePrice || 0))
  }

  const savePrice = async (id) => {
    const val = Number(priceValue)
    if (isNaN(val) || val < 0) { toast.error('Invalid price'); return }
    try {
      await api.updateProduct(id, { basePrice: val })
      toast.success('Price updated')
      setEditingPrice(null)
      load()
    } catch (err) { toast.error(err.message) }
  }

  const startEditDiscount = (p) => {
    setEditingDiscount(p._id)
    setDiscountValue(String(Math.round(p.discountPercent || 0)))
  }

  const saveDiscount = async (id) => {
    const val = Math.round(Number(discountValue))
    if (isNaN(val) || val < 0 || val > 100) { toast.error('Discount must be 0-100'); return }
    try {
      await api.updateProduct(id, { discountPercent: val })
      toast.success('Discount updated')
      setEditingDiscount(null)
      load()
    } catch (err) { toast.error(err.message) }
  }

  const handleImageReplace = async (e, id) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/products')
      const p = products.find(x => x._id === id)
      const images = [result.url, ...(p?.images?.filter((_, i) => i > 0) || [])]
      const cloudinaryPublicIds = [result.publicId, ...(p?.cloudinaryPublicIds?.filter((_, i) => i > 0) || [])]
      await api.updateProduct(id, { images, cloudinaryPublicIds })
      toast.success('Image replaced')
      load()
    } catch (err) { toast.error(err.message) }
    if (fileInputRef.current) fileInputRef.current.value = ''
    setImageUploadTarget(null)
  }

  const handleDragStart = (e, idx) => {
    dragItem.current = idx
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setOverIdx(null)
  }

  const handleDrop = async (e, dropIdx) => {
    e.preventDefault()
    const fromIdx = dragItem.current
    if (fromIdx === null || fromIdx === dropIdx) { handleDragEnd(); return }
    const reordered = [...products]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    setProducts(reordered)
    handleDragEnd()
    try {
      const orders = reordered.map((p, i) => ({ id: p._id, displayOrder: i }))
      await api.reorderProducts(orders)
      toast.success('Products reordered')
    } catch (err) {
      toast.error(err.message)
      load()
    }
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

      {!search && products.length > 1 && (
        <p className="mb-2 text-xs text-slate-400">Drag rows to reorder products. Click price or discount to edit inline.</p>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageReplace(e, imageUploadTarget)} className="hidden" />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                <th className="p-3 font-medium w-8"></th>
                <th className="p-3 font-medium">Product</th><th className="p-3 font-medium">Category</th><th className="p-3 font-medium">Price</th><th className="p-3 font-medium">Discount</th><th className="p-3 font-medium">Stock</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Featured</th><th className="p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr
                    key={p._id}
                    draggable={!search}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`border-b border-slate-50 transition-colors ${
                      dragIdx === idx ? 'opacity-40' : ''
                    } ${overIdx === idx && dragIdx !== idx ? 'border-t-2 border-t-brand-500' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="p-3 text-center text-slate-300 cursor-grab active:cursor-grabbing select-none">
                      <svg className="h-4 w-4 mx-auto" fill="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative group">
                          <img src={cld(p.images?.[0], 'f_auto,q_auto,w_200,c_fill')} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                          <button
                            onClick={() => { setImageUploadTarget(p._id); fileInputRef.current?.click() }}
                            className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Replace image"
                          >
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                        <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-[10px] text-slate-400">{p.slug}</p></div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{p.category?.name || '-'}</td>
                    <td className="p-3">
                      {editingPrice === p._id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={priceValue} onChange={e => setPriceValue(e.target.value)} className="w-20 rounded border border-brand-300 px-1.5 py-0.5 text-xs outline-none focus:border-brand-500" autoFocus onKeyDown={e => { if (e.key === 'Enter') savePrice(p._id); if (e.key === 'Escape') setEditingPrice(null) }} onBlur={() => savePrice(p._id)} />
                        </div>
                      ) : (
                        <button onClick={() => startEditPrice(p)} className="font-medium text-brand-700 hover:text-brand-800 cursor-pointer" title="Click to edit price">{formatPrice(p.basePrice)}</button>
                      )}
                    </td>
                    <td className="p-3">
                      {editingDiscount === p._id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-16 rounded border border-brand-300 px-1.5 py-0.5 text-xs outline-none focus:border-brand-500" autoFocus onKeyDown={e => { if (e.key === 'Enter') saveDiscount(p._id); if (e.key === 'Escape') setEditingDiscount(null) }} onBlur={() => saveDiscount(p._id)} />
                          <span className="text-xs">%</span>
                        </div>
                      ) : (
                        <button onClick={() => startEditDiscount(p)} className={`font-semibold ${p.discountPercent > 0 ? 'text-green-600' : 'text-slate-400'} hover:text-brand-700 cursor-pointer`} title="Click to edit discount">{Math.round(p.discountPercent || 0)}%</button>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold ${p.variants?.some(v => v.stock > 0) ? 'text-green-600' : 'text-red-600'}`}>
                        {p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0}
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
            {products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-slate-400 mb-1">No products found</p>
                <p className="text-sm text-slate-400">{search ? 'Try a different search term' : 'Click "Add Product" to create one'}</p>
              </div>
            )}
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