import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

const typeLabels = { universal: 'Grocery + Combo', grocery: 'Grocery Only', combo: 'Combo Only' }
const typeColors = { universal: 'bg-blue-100 text-blue-700', grocery: 'bg-green-100 text-green-700', combo: 'bg-purple-100 text-purple-700' }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [form, setForm] = useState({
    code: '', type: 'universal', discountType: 'percentage', discountValue: '',
    maxDiscount: '', minPurchase: 0, maxUses: 0, expiryDate: '', isActive: true, oneUsePerUser: false,
  })

  const load = async () => {
    try {
      const data = await api.getCoupons()
      setCoupons(data || [])
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditing(null)
    setForm({ code: '', type: 'universal', discountType: 'percentage', discountValue: '', maxDiscount: '', minPurchase: 0, maxUses: 0, expiryDate: '', isActive: true, oneUsePerUser: false })
  }

  const handleEdit = (c) => {
    setEditing(c._id)
    setForm({
      code: c.code, type: c.type, discountType: c.discountType, discountValue: c.discountValue,
      maxDiscount: c.maxDiscount || '', minPurchase: c.minPurchase || 0, maxUses: c.maxUses || 0,
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : '', isActive: c.isActive, oneUsePerUser: c.oneUsePerUser || false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code.trim() || !form.discountValue) return toast.error('Code and value are required')
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined, minPurchase: Number(form.minPurchase), maxUses: Number(form.maxUses) }
      if (editing) { await api.updateCoupon(editing, payload); toast.success('Coupon updated') }
      else { await api.createCoupon(payload); toast.success('Coupon created') }
      resetForm(); load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return
    try { await api.deleteCoupon(id); toast.success('Coupon deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  const handleToggle = async (id) => {
    try { await api.toggleCouponActive(id); load() }
    catch (err) { toast.error(err.message) }
  }

  const filtered = typeFilter ? coupons.filter(c => c.type === typeFilter) : coupons

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Coupons</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} placeholder="Coupon Code *" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 uppercase" />
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Applies To</label>
                <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="universal">Both Grocery + Combo</option>
                  <option value="grocery">Grocery Products Only</option>
                  <option value="combo">Combo Products Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Discount Type</label>
                <select value={form.discountType} onChange={e => setForm(prev => ({ ...prev, discountType: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <input type="number" value={form.discountValue} onChange={e => setForm(prev => ({ ...prev, discountValue: e.target.value }))} placeholder="Discount Value *" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              {form.discountType === 'percentage' && (
                <input type="number" value={form.maxDiscount} onChange={e => setForm(prev => ({ ...prev, maxDiscount: e.target.value }))} placeholder="Max Discount ₹ (optional)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              )}
              <input type="number" value={form.minPurchase} onChange={e => setForm(prev => ({ ...prev, minPurchase: e.target.value }))} placeholder="Min Order Value ₹" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input type="number" value={form.maxUses} onChange={e => setForm(prev => ({ ...prev, maxUses: e.target.value }))} placeholder="Max Uses (0 = unlimited)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={e => setForm(prev => ({ ...prev, expiryDate: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.oneUsePerUser} onChange={e => setForm(prev => ({ ...prev, oneUsePerUser: e.target.checked }))} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                One Use Per User
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">{editing ? 'Update' : 'Create'}</button>
                {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={() => setTypeFilter('')} className={`rounded-full px-3 py-1 text-xs font-semibold ${!typeFilter ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All ({coupons.length})</button>
            {['universal', 'grocery', 'combo'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`rounded-full px-3 py-1 text-xs font-semibold ${typeFilter === t ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {typeLabels[t]} ({coupons.filter(c => c.type === t).length})
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                <th className="p-3 font-medium">Code</th><th className="p-3 font-medium">Applies To</th><th className="p-3 font-medium">Discount</th><th className="p-3 font-medium">Min Order</th><th className="p-3 font-medium">Uses</th><th className="p-3 font-medium">Expires</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-sm font-bold text-brand-700">{c.code}</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeColors[c.type]}`}>{typeLabels[c.type]}</span></td>
                    <td className="p-3">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}{c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}</td>
                    <td className="p-3 text-slate-600">{c.minPurchase ? `₹${c.minPurchase}` : 'None'}</td>
                    <td className="p-3 text-slate-600">{c.usedCount}/{c.maxUses || '∞'}</td>
                    <td className="p-3 text-xs text-slate-500">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No expiry'}</td>
                    <td className="p-3"><button onClick={() => handleToggle(c._id)} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</button></td>
                    <td className="p-3"><div className="flex gap-2"><button onClick={() => handleEdit(c)} className="text-xs font-semibold text-brand-600">Edit</button><button onClick={() => handleDelete(c._id)} className="text-xs font-semibold text-red-600">Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-medium text-slate-400 mb-1">No coupons found</p>
                <p className="text-sm text-slate-400">{typeFilter ? 'Try a different filter' : 'Create your first coupon using the form'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
