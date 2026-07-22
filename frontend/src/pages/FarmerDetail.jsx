import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { cld } from '../lib/cloudinary'
import { generatePlaceholder } from '../lib/placeholders'
import SeoHead from '../components/SeoHead'

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

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" /></div>

  if (error || !data?.farmer) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center bg-white">
        <img src={generatePlaceholder('farmer', 'Farmer')} alt="" className="w-24 h-24 rounded-full mb-4" />
        <h2 className="font-heading text-2xl font-bold text-ink">Farmer Not Found</h2>
        <p className="mt-2 text-sm text-muted">{error || 'This QR code is no longer valid'}</p>
        <Link to="/" className="mt-6 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition">Go Home</Link>
      </div>
    )
  }

  const { farmer, qr } = data

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title={farmer.name} description={`Meet ${farmer.name} — a tribal farmer partnered with HaiFarmer.`} />

      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[25vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">Our Farmers</span>
            <h1 className="mt-4 font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">{farmer.name}</h1>
            {farmer.village && (
              <p className="mt-2 text-white/60">{[farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ')}</p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-10 py-10">
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {farmer.images?.[0] ? (
            <img src={cld(farmer.images[0], 'f_auto,q_auto,w_1200,h_400,c_fill')} alt={farmer.name} className="h-56 w-full object-cover sm:h-72"
              onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.src = generatePlaceholder('farmer', farmer.name) } }} />
          ) : (
            <img src={generatePlaceholder('farmer', farmer.name)} alt={farmer.name} className="h-56 w-full object-cover sm:h-72" />
          )}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl font-bold text-ink">{farmer.name}</h1>
                {farmer.village && (
                  <p className="mt-1 text-sm text-muted">
                    {[farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              {qr?.qrImage && (
                <div className="shrink-0 text-center">
                  <img src={qr.qrImage} alt="Farmer QR" className="mx-auto w-20 h-20 rounded-lg border border-border" />
                  <p className="mt-1 text-[10px] text-muted">Scan to verify</p>
                </div>
              )}
            </div>

            {farmer.bio && (
              <div className="mt-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">About</h3>
                <p className="mt-2 text-sm text-ink leading-relaxed">{farmer.bio}</p>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {farmer.products?.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Products</h3>
                  <p className="mt-1 text-sm text-ink">{Array.isArray(farmer.products) ? farmer.products.join(', ') : farmer.products}</p>
                </div>
              )}
              {farmer.quantity && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Quantity</h3>
                  <p className="mt-1 text-sm text-ink">{farmer.quantity}</p>
                </div>
              )}
              {farmer.availability && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Availability</h3>
                  <p className="mt-1 text-sm text-ink">{farmer.availability}</p>
                </div>
              )}
              {farmer.pickupDetails && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Pickup Details</h3>
                  <p className="mt-1 text-sm text-ink">{farmer.pickupDetails}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <Link to="/products" className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition">Browse Products</Link>
              <a href={`https://wa.me/91${farmer.phone}?text=Hello%20${farmer.name}%2C%20I%20saw%20your%20profile%20on%20HAiFarmer`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-green-600 bg-white px-6 py-2.5 text-sm font-semibold text-green-600 hover:bg-green-50 transition">Contact on WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
