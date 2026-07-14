import { useState, useEffect } from 'react'
import { getFarmers } from '../lib/farmerService'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { getImageUrl } from '../lib/utils'

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

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="heading-font text-center text-4xl font-extrabold text-slate-900">Our Farmers</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">Meet the dedicated farmers who grow your food with love and care.</p>

      {farmers.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">No farmer profiles available yet.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {farmers.map(farmer => (
            <div key={farmer.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              {farmer.image_url && <img src={getImageUrl(farmer.image_url, settings?.placeholder_image)} alt={farmer.name} className="h-48 w-full object-cover" />}
              <div className="p-5">
                <h3 className="heading-font text-lg font-bold text-slate-900">{farmer.name}</h3>
                {farmer.location && <p className="mt-1 text-sm text-slate-500">{farmer.location}</p>}
                {farmer.bio && <p className="mt-3 text-sm text-slate-600">{farmer.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
