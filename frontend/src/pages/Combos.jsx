import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { DEMO_MODE } from '../lib/withDemoFallback'
import { demoCombos } from '../lib/demoData'
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
        if (!data || data.length === 0) data = await getSupabaseComboBundles().catch(() => [])
        setBundles(DEMO_MODE && (!data || data.length === 0) ? demoCombos : (data || []))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title="Combos & Bundles" description="Save big with curated product bundles from HAiFarmer. Organic vegetable combos, fruit bundles, spice packs and more at special discount prices." />

      {/* Hero */}
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[40vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">Curated Bundles</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">Value Combos</h1>
            <p className="mt-3 text-white/60 max-w-lg mx-auto">Save big with our thoughtfully curated product bundles from tribal farms. Best value, pure quality.</p>
          </div>
        </div>
      </section>

      <div className="section-container py-10">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" />
          </div>
        ) : bundles.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="font-heading text-2xl font-semibold text-ink italic">No combos available</p>
            <p className="mt-1 text-sm text-muted">Check back soon for exciting bundles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map(bundle => <BundleCard key={bundle._id} bundle={bundle} compact />)}
          </div>
        )}
      </div>
    </div>
  )
}
