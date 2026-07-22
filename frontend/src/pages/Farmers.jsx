import { useState, useEffect } from 'react'
import { getFarmers } from '../lib/farmerService'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { getImageUrl } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import SeoHead from '../components/SeoHead'

export default function Farmers() {
  const { settings } = useSiteSettings()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFarmers()
        setFarmers(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" /></div>

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title="Our Farmers" description="Meet the dedicated tribal farmers who grow your food with love and care." />

      {/* Hero */}
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[35vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">Our Farmers</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight">Meet Our Farmers</h1>
            <p className="mt-3 text-white/60 max-w-xl mx-auto">The dedicated farmers who grow your food with love and care, using traditional methods passed down through generations.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-12">
        {farmers.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-ink">No farmer profiles available yet</p>
            <p className="mt-1 text-sm text-muted">Check back soon as we onboard more tribal farmers.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {farmers.map(farmer => (
              <div key={farmer.id} className="rounded-xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
                {farmer.image_url ? (
                  <img src={getImageUrl(farmer.image_url, settings?.placeholder_image)} alt={farmer.name} className="h-48 w-full object-cover"
                    onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.src = generatePlaceholder('farmer', farmer.name) } }} />
                ) : (
                  <img src={generatePlaceholder('farmer', farmer.name)} alt={farmer.name} className="h-48 w-full object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-ink">{farmer.name}</h3>
                  {farmer.location && <p className="mt-1 text-sm text-muted">{farmer.location}</p>}
                  {farmer.bio && <p className="mt-3 text-sm text-muted leading-relaxed">{farmer.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
