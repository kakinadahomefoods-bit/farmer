import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '', description: '', tagline: '', nutrition: '',
    basePrice: '', discountPercent: 0, category: '',
    isActive: true, isFeatured: false, isNewArrival: false,
    images: [], cloudinaryPublicIds: [],
    variants: [{ name: 'Default', weightLabel: '', price: '', originalPrice: '', stock: 0, unit: '', sku: '', barcode: '' }],
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await api.getCategories()
        setCategories(cats || [])
        if (isEdit) {
          const products = await api.getProducts({ active: 'all' })
          const product = products.data?.find(p => p._id === id)
          if (product) {
            setForm({
              name: product.name || '',
              description: product.description || '',
              tagline: product.tagline || '',
              nutrition: product.nutrition || '',
              basePrice: product.basePrice || '',
              discountPercent: product.discountPercent || 0,
              category: product.category?._id || '',
              isActive: product.isActive ?? true,
              isFeatured: product.isFeatured || false,
              isNewArrival: product.isNewArrival || false,
              images: product.images || [],
              cloudinaryPublicIds: product.cloudinaryPublicIds || [],
              variants: product.variants?.length > 0 ? product.variants : form.variants,
              seo: product.seo || form.seo,
            })
          }
        }
      } catch (err) { toast.error(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [id, isEdit])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleVariantChange = (idx, field, value) => {
    const variants = [...form.variants]
    variants[idx] = { ...variants[idx], [field]: value }
    setForm(prev => ({ ...prev, variants }))
  }

  const addVariant = () => {
    setForm(prev => ({ ...prev, variants: [...prev.variants, { name: '', weightLabel: '', price: '', originalPrice: '', stock: 0, unit: '', sku: '', barcode: '' }] }))
  }

  const removeVariant = (idx) => {
    if (form.variants.length <= 1) return
    setForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    try {
      toast.info('Uploading images...')
      const results = await api.uploadMultiple(files, 'haifarmer/products')
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...results.map(r => r.url)],
        cloudinaryPublicIds: [...prev.cloudinaryPublicIds, ...results.map(r => r.publicId)],
      }))
      toast.success(`${results.length} image(s) uploaded`)
    } catch (err) { toast.error(err.message) }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (idx) => {
    const url = form.images[idx]
    api.deleteImage(url).catch(() => {})
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      cloudinaryPublicIds: prev.cloudinaryPublicIds.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice) || 0,
        discountPercent: Number(form.discountPercent) || 0,
        variants: form.variants.map(v => ({
          ...v,
          price: Number(v.price) || 0,
          originalPrice: Number(v.originalPrice) || 0,
          stock: Number(v.stock) || 0,
        })),
      }
      if (isEdit) {
        await api.updateProduct(id, payload)
        toast.success('Product updated')
      } else {
        await api.createProduct(payload)
        toast.success('Product created')
      }
      navigate('/admin/products')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
              <input value={form.name} onChange={e => handleChange('name', e.target.value)} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Base Price *</label>
              <input type="number" value={form.basePrice} onChange={e => handleChange('basePrice', e.target.value)} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount %</label>
              <input type="number" value={form.discountPercent} onChange={e => handleChange('discountPercent', e.target.value)} min="0" max="100" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
            <input value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nutrition</label>
            <textarea value={form.nutrition} onChange={e => handleChange('nutrition', e.target.value)} rows="2" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Variants</h2>
            <button type="button" onClick={addVariant} className="text-sm font-semibold text-brand-600 hover:text-brand-700">+ Add Variant</button>
          </div>
          {form.variants.map((v, idx) => (
            <div key={idx} className="border border-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Variant {idx + 1}</span>
                <button type="button" onClick={() => removeVariant(idx)} className="text-xs font-semibold text-red-600 hover:text-red-700">Remove</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input value={v.name} onChange={e => handleVariantChange(idx, 'name', e.target.value)} placeholder="Name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <input value={v.weightLabel} onChange={e => handleVariantChange(idx, 'weightLabel', e.target.value)} placeholder="Weight (e.g. 500g)" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <input type="number" value={v.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} placeholder="Price *" required className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <input type="number" value={v.stock} onChange={e => handleVariantChange(idx, 'stock', e.target.value)} placeholder="Stock" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <input value={v.sku} onChange={e => handleVariantChange(idx, 'sku', e.target.value)} placeholder="SKU" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <input value={v.barcode} onChange={e => handleVariantChange(idx, 'barcode', e.target.value)} placeholder="Barcode" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                <input value={v.unit} onChange={e => handleVariantChange(idx, 'unit', e.target.value)} placeholder="Unit" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Images</h2>
          <div className="flex flex-wrap gap-3">
            {form.images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">×</button>
              </div>
            ))}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 transition text-2xl">+</button>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">SEO</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
              <input value={form.seo.metaTitle} onChange={e => handleChange('seo', { ...form.seo, metaTitle: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
              <input value={form.seo.metaDescription} onChange={e => handleChange('seo', { ...form.seo, metaDescription: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.isNewArrival} onChange={e => handleChange('isNewArrival', e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            New Arrival
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
        </div>
      </form>
    </div>
  )
}
