import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'
import BundleCard from '../components/BundleCard'
import { getComboBundles as getSupabaseComboBundles } from '../lib/productService'

export default function Combos() {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let data = await api.getBundles({ combo: 'true' })
        if (!data || data.length === 0) {
          data = await getSupabaseComboBundles().catch(() => [])
        }
        setBundles(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-cream-50">
      <section className="relative bg-forest-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-gold-500">Curated Bundles</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-cream-50 sm:text-5xl tracking-tight">Combos & Bundles</h1>
          <p className="mt-3 text-cream-50/60 max-w-lg mx-auto">Save big with our thoughtfully curated product bundles from tribal farms.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SeoHead title="Combos & Bundles" description="Save big with curated product bundles from HAiFarmer. Organic vegetable combos, fruit bundles, spice packs and more at special discount prices." />

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-heading text-xl font-semibold text-text-dark">No combos available</p>
            <p className="mt-1 text-sm text-forest-900/50">Check back soon for exciting bundles!</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {bundles.map(bundle => <BundleCard key={bundle._id} bundle={bundle} />)}
          </div>
        )}
      </div>
    </div>
  )
}
