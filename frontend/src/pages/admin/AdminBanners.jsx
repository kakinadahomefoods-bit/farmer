import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { cld } from '../../lib/cloudinary'
import { generatePlaceholder } from '../../lib/placeholders'
import ImageGenerator from '../../components/admin/ImageGenerator'
import { toast } from 'react-toastify'

const IMAGE_TYPES = [
  { key: 'desktop', label: 'Desktop', ratio: '1920 × 700', hint: 'Wide landscape' },
  { key: 'tablet', label: 'Tablet', ratio: '1200 × 600', hint: 'Landscape' },
  { key: 'mobile', label: 'Mobile', ratio: '1080 × 1350', hint: 'Portrait' },
]

const emptyForm = {
  title: '',
  subtitle: '',
  buttonText: '',
  redirectLink: '',
  order: 0,
  isActive: true,
  position: 'hero',
  startDate: '',
  endDate: '',
  desktopImage: '',
  desktopPublicId: '',
  tabletImage: '',
  tabletPublicId: '',
  mobileImage: '',
  mobilePublicId: '',
}

function formatDateLocal(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 16)
}

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const fileRefs = useRef({})
  const [activeUpload, setActiveUpload] = useState(null)

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
    setForm({ ...emptyForm })
  }

  const handleEdit = (b) => {
    setEditing(b._id)
    setForm({
      ...emptyForm,
      title: b.title || '',
      subtitle: b.subtitle || '',
      buttonText: b.buttonText || '',
      redirectLink: b.redirectLink || '',
      order: b.order || 0,
      isActive: b.isActive,
      position: b.position || 'hero',
      startDate: formatDateLocal(b.startDate),
      endDate: formatDateLocal(b.endDate),
      desktopImage: b.desktopImage || b.image || '',
      desktopPublicId: b.desktopPublicId || b.cloudinaryPublicId || '',
      tabletImage: b.tabletImage || '',
      tabletPublicId: b.tabletPublicId || '',
      mobileImage: b.mobileImage || '',
      mobilePublicId: b.mobilePublicId || '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!form.desktopImage && !form.tabletImage && !form.mobileImage && !form.image) {
      return toast.error('At least one banner image is required')
    }
    if (form.redirectLink && !form.redirectLink.startsWith('http://') && !form.redirectLink.startsWith('https://') && !form.redirectLink.startsWith('/')) {
      return toast.error('Redirect link must be a valid URL or path')
    }
    if (form.order < 0) return toast.error('Order must be 0 or greater')

    const payload = {
      ...form,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    }

    setSubmitting(true)
    try {
      if (editing) {
        await api.updateBanner(editing, payload)
        toast.success('Banner updated')
      } else {
        await api.createBanner(payload)
        toast.success('Banner created')
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
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

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    setActiveUpload(type)
    try {
      const result = await api.uploadImage(file, 'haifarmer/banners')
      setForm(prev => ({
        ...prev,
        [`${type}Image`]: result.url,
        [`${type}PublicId`]: result.publicId,
      }))
      toast.success(`${type} image uploaded`)
    } catch (err) { toast.error(err.message) }
    finally { setActiveUpload(null) }
  }

  const setGeneratedImage = (type, url, publicId) => {
    setForm(prev => ({
      ...prev,
      [`${type}Image`]: url,
      [`${type}PublicId`]: publicId,
    }))
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Banners</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={form.position} onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                <option value="hero">Hero Banner</option>
                <option value="promotional">Promotional Banner</option>
                <option value="side">Side Banner</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title (optional)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                <input value={form.subtitle} onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Subtitle (optional)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input value={form.buttonText} onChange={e => setForm(prev => ({ ...prev, buttonText: e.target.value }))} placeholder="Button text (optional)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                <input value={form.redirectLink} onChange={e => setForm(prev => ({ ...prev, redirectLink: e.target.value }))} placeholder="Button link" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Start date</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">End date</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                </div>
              </div>

              <input type="number" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))} placeholder="Display order" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Banner images</p>
                {IMAGE_TYPES.map(type => {
                  const imageKey = `${type.key}Image`
                  const publicIdKey = `${type.key}PublicId`
                  const image = form[imageKey]
                  return (
                    <div key={type.key} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">{type.label} <span className="font-normal text-slate-400">({type.ratio})</span></span>
                        <span className="text-[10px] text-slate-400">{type.hint}</span>
                      </div>
                      {image ? (
                        <img src={cld(image, 'f_auto,q_auto,w_400,c_limit')} alt="" className="h-24 w-full rounded-lg object-cover mb-2"
                          onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.src = generatePlaceholder('banner', form.title) } }} />
                      ) : (
                        <div className="h-24 w-full rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs mb-2">No {type.label.toLowerCase()} image</div>
                      )}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => fileRefs.current[type.key]?.click()} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 transition text-center">
                          {activeUpload === type.key ? 'Uploading...' : image ? 'Change' : `Upload ${type.label}`}
                        </button>
                        <ImageGenerator entity="banner" name={`${form.title || 'Banner'} ${type.label}`} currentImage={image} currentPublicId={form[publicIdKey]}
                          onImageChange={(url, publicId) => setGeneratedImage(type.key, url, publicId)} />
                        <input ref={el => fileRefs.current[type.key] = el} type="file" accept="image/*" onChange={e => handleImageUpload(e, type.key)} hidden />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {banners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <p className="text-lg font-medium text-slate-400 mb-1">No banners yet</p>
              <p className="text-sm text-slate-400">Upload your first banner using the form</p>
            </div>
          ) : ['hero', 'promotional', 'side'].map(position => {
            const filtered = banners.filter(b => b.position === position)
            if (filtered.length === 0 && position !== 'hero') return null
            return (
              <div key={position}>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 capitalize">{position} Banners</h3>
                <div className="grid gap-3">
                  {filtered.map(b => (
                    <div key={b._id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      {b.desktopImage || b.image ? (
                        <img src={cld(b.desktopImage || b.image, 'f_auto,q_auto,w_200,h_80,c_fill')} alt="" className="h-16 w-28 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-16 w-28 rounded-lg bg-slate-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{b.title || 'Untitled'}</p>
                        <p className="text-xs text-slate-500 truncate">{b.subtitle || b.redirectLink || ''}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {b.startDate && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">From {new Date(b.startDate).toLocaleDateString()}</span>}
                          {b.endDate && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Until {new Date(b.endDate).toLocaleDateString()}</span>}
                        </div>
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
