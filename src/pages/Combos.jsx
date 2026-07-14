import { useState, useEffect } from 'react'
import { getComboBundles } from '../lib/productService'
import BundleCard from '../components/BundleCard'

export default function Combos() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const result = await getComboBundles()
        setBundles(result || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-font text-3xl font-extrabold text-slate-900">Combos & Bundles</h1>
      <p className="mt-2 text-slate-600">Save big with our curated product bundles.</p>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
      ) : bundles.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-bold text-slate-900">No combos available</p>
          <p className="mt-1 text-sm text-slate-500">Check back soon for exciting bundles!</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6">
          {bundles.map(bundle => <BundleCard key={bundle.id} bundle={bundle} />)}
        </div>
      )}
    </div>
  )
}
