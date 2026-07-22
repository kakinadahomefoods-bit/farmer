import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/utils'
import { cld } from '../../lib/cloudinary'
import { generatePlaceholder } from '../../lib/placeholders'
import ImageGenerator from '../../components/admin/ImageGenerator'
import { toast } from 'react-toastify'

export default function AdminBundles() {
  const [bundles, setBundles] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: '', description: '', image: '', cloudinaryPublicId: '',
    discountPercent: 0, isActive: true, isCombo: true,
    items: [{ product: '', variantId: '', variantName: '', quantity: 1, price: 0 }],
  })

  const load = async () => {
    try {
      const [bData, pData] = await Promise.all([
        api.getAllBundles(),
        api.getProducts({ active: 'all', limit: 200 }),
      ])
      setBundles(bData || [])
      setProducts(pData.data || [])
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', description: '', image: '', cloudinaryPublicId: '', discountPercent: 0, isActive: true, isCombo: true, items: [{ product: '', variantId: '', variantName: '', quantity: 1, price: 0 }] })
  }

  const handleEdit = (b) => {
    setEditing(b._id)
    setForm({
      name: b.name || '',
      description: b.description || '',
      image: b.image || '',
      cloudinaryPublicId: b.cloudinaryPublicId || '',
      discountPercent: Math.round(b.discountPercent || 0),
      isActive: b.isActive,
      isCombo: b.isCombo,
      items: b.items?.length > 0 ? b.items.map(i => ({
        product: i.product?._id || i.product || '',
        variantId: i.variantId || '',
        variantName: i.variantName || '',
        quantity: i.quantity || 1,
        price: i.price || 0,
      })) : [{ product: '', variantId: '', variantName: '', quantity: 1, price: 0 }],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!form.name.trim()) return toast.error('Name is required')
    if (form.discountPercent < 0 || form.discountPercent > 100) return toast.error('Discount must be 0-100')
    if (!form.items.some(i => i.product)) return toast.error('At least one item must have a product selected')
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        discountPercent: Number(form.discountPercent) || 0,
        items: form.items.map(i => ({ ...i, quantity: Number(i.quantity) || 1, price: Number(i.price) || 0 })),
      }
      if (editing) { await api.updateBundle(editing, payload); toast.success('Bundle updated') }
      else { await api.createBundle(payload); toast.success('Bundle created') }
      resetForm(); load()
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bundle?')) return
    try { await api.deleteBundle(id); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleToggle = async (id) => {
    try { await api.toggleBundleActive(id); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/bundles')
      setForm(prev => ({ ...prev, image: result.url, cloudinaryPublicId: result.publicId }))
      toast.success('Image uploaded')
    } catch (err) { toast.error(err.message) }
  }

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { product: '', variantId: '', variantName: '', quantity: 1, price: 0 }] }))
  }

  const removeItem = (idx) => {
    if (form.items.length <= 1) return
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  const setItem = (idx, field, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [field]: value }
    if (field === 'product') {
      const p = products.find(x => x._id === value)
      if (p) {
        items[idx].price = p.basePrice || 0
        items[idx].variantName = p.variants?.[0]?.name || ''
        items[idx].variantId = p.variants?.[0]?._id || ''
      }
    }
    if (field === 'variantId') {
      const p = products.find(x => x._id === items[idx].product)
      if (p) {
        const v = p.variants?.find(x => (x._id || x.id) === value)
        if (v) {
          items[idx].variantName = v.name || ''
          items[idx].price = v.price || p.basePrice || 0
        }
      }
    }
    setForm(prev => ({ ...prev, items }))
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Combos & Bundles</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Bundle' : 'Add Bundle'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Bundle Name *" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input type="number" value={form.discountPercent} onChange={e => setForm(prev => ({ ...prev, discountPercent: e.target.value }))} placeholder="Discount %" min="0" max="100" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />

              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Bundle Items</span>
                  <button type="button" onClick={addItem} className="text-xs font-semibold text-brand-600 hover:text-brand-700">+ Add Item</button>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="mb-2 rounded-lg border border-slate-100 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Item {idx + 1}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                    </div>
                    <select value={item.product} onChange={e => setItem(idx, 'product', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-brand-500">
                      <option value="">Select product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    {item.product && (() => {
                      const p = products.find(x => x._id === item.product)
                      return p?.variants?.length > 1 ? (
                        <select value={item.variantId} onChange={e => setItem(idx, 'variantId', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-brand-500">
                          <option value="">Select variant</option>
                          {p.variants.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name} - {formatPrice(v.price)}</option>)}
                        </select>
                      ) : null
                    })()}
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} placeholder="Qty" min="1" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-brand-500" />
                      <input type="number" value={item.price} onChange={e => setItem(idx, 'price', e.target.value)} placeholder="Price" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-brand-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                {form.image ? (
                  <img src={cld(form.image, 'f_auto,q_auto,w_400,c_limit')} alt="" className="mt-2 h-16 w-full rounded-lg object-cover"
                    onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.src = generatePlaceholder('bundle', form.name) } }} />
                ) : (
                  <div className="w-full h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm mt-2">No image</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition text-center">
                    {form.image ? 'Change Image' : 'Upload Image'}
                  </button>
                  <ImageGenerator entity="bundle" name={form.name} currentImage={form.image} currentPublicId={form.cloudinaryPublicId}
                    onImageChange={(url, publicId) => setForm(prev => ({ ...prev, image: url, cloudinaryPublicId: publicId }))}
                    fileInputRef={fileRef} />
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-3">
          {bundles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <p className="text-lg font-medium text-slate-400 mb-1">No bundles yet</p>
              <p className="text-sm text-slate-400">Create your first combo bundle</p>
            </div>
          ) : bundles.map(b => (
            <div key={b._id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {b.image && <img src={cld(b.image, 'f_auto,q_auto,w_200,c_fill')} alt="" className="h-16 w-20 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{b.name}</p>
                <p className="text-xs text-slate-500">{formatPrice(b.price)} {b.discountPercent > 0 && `(-${Math.round(b.discountPercent)}%)`}</p>
                <p className="text-[10px] text-slate-400">{b.items?.length || 0} items</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(b._id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{b.isActive ? 'On' : 'Off'}</button>
                <button onClick={() => handleEdit(b)} className="text-xs font-semibold text-brand-600">Edit</button>
                <button onClick={() => handleDelete(b._id)} className="text-xs font-semibold text-red-600">Del</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}