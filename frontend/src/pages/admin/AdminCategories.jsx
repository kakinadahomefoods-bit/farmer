import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', image: '', cloudinaryPublicId: '', order: 0, isActive: true })
  const fileRef = useRef(null)

  const load = async () => {
    try {
      const data = await api.getAllCategories()
      setCategories(data || [])
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', description: '', image: '', cloudinaryPublicId: '', order: 0, isActive: true })
  }

  const handleEdit = (cat) => {
    setEditing(cat._id)
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '', cloudinaryPublicId: cat.cloudinaryPublicId || '', order: cat.order || 0, isActive: cat.isActive })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    try {
      if (editing) {
        await api.updateCategory(editing, form)
        toast.success('Category updated')
      } else {
        await api.createCategory(form)
        toast.success('Category created')
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hide this category?')) return
    try { await api.deleteCategory(id); toast.success('Category hidden'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleToggle = async (id) => {
    try { await api.toggleCategoryActive(id); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/categories')
      setForm(prev => ({ ...prev, image: result.url, cloudinaryPublicId: result.publicId }))
      toast.success('Image uploaded')
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Categories</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4" onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}>
              <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Category Name *" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input type="number" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))} placeholder="Order" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <div>
                <button type="button" onClick={() => fileRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition text-center">
                  {form.image ? 'Change Image' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
                {form.image && <img src={form.image} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">
                  {editing ? 'Update' : 'Create'}
                </button>
                {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                <th className="p-3 font-medium">Order</th><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3 text-slate-500">{cat.order || 0}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {cat.image && <img src={cat.image} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                        <span className="font-medium text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleToggle(cat._id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{cat.isActive ? 'Active' : 'Hidden'}</button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(cat)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Edit</button>
                        <button onClick={() => handleDelete(cat._id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Hide</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
