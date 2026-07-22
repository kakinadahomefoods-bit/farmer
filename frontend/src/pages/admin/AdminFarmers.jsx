import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { generatePlaceholder } from '../../lib/placeholders'
import ImageGenerator from '../../components/admin/ImageGenerator'
import { toast } from 'react-toastify'

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [qrData, setQrData] = useState(null)
  const qrFileRef = useRef(null)
  const [form, setForm] = useState({
    name: '', phone: '', village: '', district: '', state: '',
    products: '', quantity: '', availability: '', pickupDetails: '',
    images: [], cloudinaryPublicIds: [], bio: '', status: 'pending',
  })
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (search) params.search = search
      const result = await api.getAllFarmers(params)
      setFarmers(result.data || [])
      setTotal(result.total || 0)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, search])

  const handleSearch = (e) => { e.preventDefault(); setPage(1) }

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', phone: '', village: '', district: '', state: '', products: '', quantity: '', availability: '', pickupDetails: '', images: [], cloudinaryPublicIds: [], bio: '', status: 'pending' })
  }

  const handleEdit = (f) => {
    setEditing(f._id)
    setForm({
      name: f.name, phone: f.phone, village: f.village || '', district: f.district || '', state: f.state || '',
      products: Array.isArray(f.products) ? f.products.join(', ') : f.products || '',
      quantity: f.quantity || '', availability: f.availability || '', pickupDetails: f.pickupDetails || '',
      images: f.images || [], cloudinaryPublicIds: f.cloudinaryPublicIds || [], bio: f.bio || '', status: f.status || 'pending',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!form.name.trim() || !form.phone.trim()) return toast.error('Name and phone are required')
    setSubmitting(true)
    try {
      const payload = { ...form, products: form.products.split(',').map(s => s.trim()).filter(Boolean) }
      if (editing) { await api.updateFarmer(editing, payload); toast.success('Farmer updated') }
      else { await api.createFarmer(payload); toast.success('Farmer created') }
      resetForm(); load()
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
  }

  const handleToggleActive = async (id) => {
    try {
      await api.toggleFarmerActive(id)
      toast.success('Toggled')
      load()
    } catch (err) { toast.error(err.message) }
  }

  const handleQRUpload = async (e, id) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      toast.info('Uploading QR...')
      const result = await api.uploadImage(file, 'haifarmer/farmers/qr')
      await api.updateFarmer(id, { qrImage: result.url, qrPublicId: result.publicId })
      toast.success('QR code uploaded')
      load()
    } catch (err) { toast.error(err.message) }
    if (qrFileRef.current) qrFileRef.current.value = ''
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this farmer?')) return
    try { await api.deleteFarmer(id); toast.success('Farmer deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleStatus = async (id, status) => {
    try { await api.updateFarmerStatus(id, status); toast.success(`Farmer ${status}`); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    try {
      toast.info('Uploading...')
      const results = await api.uploadMultiple(files, 'haifarmer/farmers')
      setForm(prev => ({
        ...prev, images: [...prev.images, ...results.map(r => r.url)],
        cloudinaryPublicIds: [...prev.cloudinaryPublicIds, ...results.map(r => r.publicId)],
      }))
      toast.success('Images uploaded')
    } catch (err) { toast.error(err.message) }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleQR = async (id) => {
    try {
      const qr = await api.getFarmerQR(id)
      setQrData(qr)
      toast.success('QR generated')
    } catch (err) { toast.error(err.message) }
  }

  const downloadQR = () => {
    if (!qrData?.qrImage) return
    const link = document.createElement('a')
    link.href = qrData.qrImage
    link.download = `farmer-qr-${qrData.code}.png`
    link.click()
  }

  if (loading && farmers.length === 0) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Farmers</h1>
        <button onClick={() => { resetForm(); setEditing('new') }} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">+ Add Farmer</button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, village..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-500" />
        <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">Search</button>
      </form>

      {editing === 'new' || editing ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{editing === 'new' ? 'Add Farmer' : 'Edit Farmer'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Name *" required className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone *" required className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.village} onChange={e => setForm(prev => ({ ...prev, village: e.target.value }))} placeholder="Village" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.district} onChange={e => setForm(prev => ({ ...prev, district: e.target.value }))} placeholder="District" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.state} onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))} placeholder="State" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.products} onChange={e => setForm(prev => ({ ...prev, products: e.target.value }))} placeholder="Products (comma separated)" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))} placeholder="Quantity" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <input value={form.availability} onChange={e => setForm(prev => ({ ...prev, availability: e.target.value }))} placeholder="Availability" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <div className="sm:col-span-2">
              <textarea value={form.pickupDetails} onChange={e => setForm(prev => ({ ...prev, pickupDetails: e.target.value }))} placeholder="Pickup Details" rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
            <div className="sm:col-span-2">
              <textarea value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Bio" rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
            <div className="sm:col-span-2">
              <div className="flex flex-wrap gap-3 mb-2">
                {form.images.length > 0 ? form.images.map((url, i) => (
                  <img key={i} src={url} alt="" className="h-16 w-16 rounded-lg object-cover border"
                    onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.src = generatePlaceholder('farmer', form.name) } }} />
                )) : (
                  <div className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">No img</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600">Upload Images</button>
                <ImageGenerator entity="farmer" name={form.name} currentImage={form.images[0]} currentPublicId={form.cloudinaryPublicIds?.[0]}
                  onImageChange={(url, publicId) => {
                    if (url) setForm(prev => ({ ...prev, images: [url, ...prev.images], cloudinaryPublicIds: [publicId, ...prev.cloudinaryPublicIds] }))
                  }}
                  fileInputRef={fileRef} />
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageUpload} hidden />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={submitting} className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">{submitting ? 'Saving...' : editing === 'new' ? 'Create' : 'Update'}</button>
              <button type="button" onClick={() => { setEditing(null); resetForm() }} className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
            <th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Phone</th><th className="p-3 font-medium">Village</th><th className="p-3 font-medium">Active</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">QR</th><th className="p-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {farmers.map(f => (
              <tr key={f._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-3 font-medium text-slate-900">{f.name}</td>
                <td className="p-3 text-slate-600">{f.phone}</td>
                <td className="p-3 text-slate-600">{f.village || '-'}</td>
                <td className="p-3">
                  <button onClick={() => handleToggleActive(f._id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{f.isActive ? 'Active' : 'Inactive'}</button>
                </td>
                <td className="p-3">
                  <select value={f.status} onChange={e => handleStatus(f._id, e.target.value)} className={`rounded-lg border px-2 py-1 text-xs outline-none ${f.status === 'approved' ? 'border-green-200 text-green-700' : f.status === 'rejected' ? 'border-red-200 text-red-700' : 'border-amber-200 text-amber-700'}`}>
                    <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleQR(f._id)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">View</button>
                    <button onClick={() => { qrFileRef.current?.click(); qrFileRef.current.dataset.farmerId = f._id }} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Upload</button>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(f)} className="text-xs font-semibold text-brand-600">Edit</button>
                    <button onClick={() => handleDelete(f._id)} className="text-xs font-semibold text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {farmers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-slate-400 mb-1">No farmers found</p>
            <p className="text-sm text-slate-400">{search ? 'Try a different search term' : 'Click "Add Farmer" to register one'}</p>
          </div>
        )}
      </div>

      <input ref={qrFileRef} type="file" accept="image/*" onChange={(e) => { const id = qrFileRef.current?.dataset?.farmerId; if (id) handleQRUpload(e, id) }} className="hidden" />

      {qrData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setQrData(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-3">Farmer QR Code</h3>
            <img src={qrData.qrImage} alt="QR" className="mx-auto w-48 h-48 mb-3" />
            <p className="text-xs text-slate-500 mb-4">Code: {qrData.code}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={downloadQR} className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700">Download</button>
              <button onClick={() => setQrData(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {total > 20 && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Previous</button>
          <span className="flex items-center px-3 text-sm text-slate-600">Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  )
}
