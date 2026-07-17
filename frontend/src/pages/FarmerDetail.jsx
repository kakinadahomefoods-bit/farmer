import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { cld } from '../lib/cloudinary'

export default function FarmerDetail() {
  const { code } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.getFarmerByQRCode(code)
        setData(result)
      } catch (err) {
        setError(err.message || 'Farmer not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [code])

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  if (error || !data?.farmer) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 text-5xl">👨‍🌾</div>
        <h2 className="heading-font text-2xl font-extrabold text-slate-900">Farmer Not Found</h2>
        <p className="mt-2 text-slate-500">{error || 'This QR code is no longer valid'}</p>
        <Link to="/" className="mt-6 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 transition">Go Home</Link>
      </div>
    )
  }

  const { farmer, qr } = data

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {farmer.images?.[0] && (
          <img src={cld(farmer.images[0], 'f_auto,q_auto,w_1200,h_400,c_fill')} alt={farmer.name} className="h-56 w-full object-cover sm:h-72" />
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="heading-font text-3xl font-extrabold text-slate-900">{farmer.name}</h1>
              {farmer.village && (
                <p className="mt-1 text-slate-500">
                  {[farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            {qr?.qrImage && (
              <div className="shrink-0 text-center">
                <img src={qr.qrImage} alt="Farmer QR" className="mx-auto w-24 h-24 rounded-lg border" />
                <p className="mt-1 text-[10px] text-slate-400">Scan to verify</p>
              </div>
            )}
          </div>

          {farmer.bio && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">About</h3>
              <p className="mt-2 text-slate-700 leading-relaxed">{farmer.bio}</p>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {farmer.products?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Products</h3>
                <p className="mt-1 text-slate-700">{Array.isArray(farmer.products) ? farmer.products.join(', ') : farmer.products}</p>
              </div>
            )}
            {farmer.quantity && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Quantity</h3>
                <p className="mt-1 text-slate-700">{farmer.quantity}</p>
              </div>
            )}
            {farmer.availability && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Availability</h3>
                <p className="mt-1 text-slate-700">{farmer.availability}</p>
              </div>
            )}
            {farmer.pickupDetails && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pickup Details</h3>
                <p className="mt-1 text-slate-700">{farmer.pickupDetails}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Link to="/products" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition">Browse Products</Link>
            <a href={`https://wa.me/91${farmer.phone}?text=Hello%20${farmer.name}%2C%20I%20saw%20your%20profile%20on%20HAiFarmer`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-green-200 bg-green-50 px-6 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100 transition">Contact on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )
}