import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', subtitle: '', buttonText: '', redirectLink: '', image: '', cloudinaryPublicId: '', order: 0, isActive: true, position: 'hero' })
  const fileRef = useRef(null)

  const load = async () => {
    try {
      const data = await api.getAllBanners()
      setBanners(data || [])
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ title: '', subtitle: '', buttonText: '', redirectLink: '', image: '', cloudinaryPublicId: '', order: 0, isActive: true, position: 'hero' })
  }

  const handleEdit = (b) => {
    setEditing(b._id)
    setForm({ title: b.title || '', subtitle: b.subtitle || '', buttonText: b.buttonText || '', redirectLink: b.redirectLink || '', image: b.image || '', cloudinaryPublicId: b.cloudinaryPublicId || '', order: b.order || 0, isActive: b.isActive, position: b.position || 'hero' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.image) return toast.error('Image is required')
    try {
      if (editing) { await api.updateBanner(editing, form); toast.success('Banner updated') }
      else { await api.createBanner(form); toast.success('Banner created') }
      resetForm(); load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return
    try { await api.deleteBanner(id); toast.success('Banner deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleToggle = async (id) => {
    try { await api.toggleBannerActive(id); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/banners')
      setForm(prev => ({ ...prev, image: result.url, cloudinaryPublicId: result.publicId }))
      toast.success('Image uploaded')
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Banners</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.position} onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                <option value="hero">Hero Banner</option>
                <option value="promotional">Promotional Banner</option>
                <option value="side">Side Banner</option>
              </select>
              <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input value={form.subtitle} onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Subtitle" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input value={form.buttonText} onChange={e => setForm(prev => ({ ...prev, buttonText: e.target.value }))} placeholder="Button Text" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input value={form.redirectLink} onChange={e => setForm(prev => ({ ...prev, redirectLink: e.target.value }))} placeholder="Redirect Link" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input type="number" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))} placeholder="Order" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <div>
                <button type="button" onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition text-center">
                  {form.image ? 'Change Image' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
                {form.image && <img src={form.image} alt="" className="mt-2 h-20 w-full rounded-lg object-cover" />}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">{editing ? 'Update' : 'Create'}</button>
                {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {['hero', 'promotional', 'side'].map(position => {
            const filtered = banners.filter(b => b.position === position)
            if (filtered.length === 0 && position !== 'hero') return null
            return (
              <div key={position}>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 capitalize">{position} Banners</h3>
                <div className="grid gap-3">
                  {filtered.map(b => (
                    <div key={b._id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      {b.image && <img src={b.image} alt="" className="h-16 w-24 rounded-lg object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{b.title || 'Untitled'}</p>
                        <p className="text-xs text-slate-500 truncate">{b.subtitle || b.redirectLink || ''}</p>
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
