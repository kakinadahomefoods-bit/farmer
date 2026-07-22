import { Link } from 'react-router-dom'
import { generatePlaceholder } from '../lib/placeholders'

const IMPACT_STATS = [
  { number: '500+', label: 'Tribal Farmers Supported' },
  { number: '10,000+', label: 'Happy Families' },
  { number: '50+', label: 'Villages Reached' },
  { number: '100%', label: 'Chemical Free' },
]

const STORIES = [
  { name: 'Lakshmi Devi', village: 'Paderu', product: 'Millets', quote: 'Through HaiFarmer, our millets now reach homes across India. The income has helped us send our children to school.' },
  { name: 'Ramulu Naik', village: 'Araku', product: 'Honey', quote: 'Traditional honey harvesting is our heritage. Now it sustains our entire community.' },
  { name: 'Savitri Bai', village: 'Chintapalli', product: 'Spices', quote: 'Our forest spices are finally getting the recognition they deserve. Fair prices changed our lives.' },
]

export default function Impact() {
  return (
    <div className="bg-white">
      <section className="relative bg-green-800 overflow-hidden">
        <div className="relative min-h-[40vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-green-800/40" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/80">Our Impact</span>
            <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight">Making a Difference</h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">Every purchase creates ripples of positive change across tribal communities.</p>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-18 bg-off-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {IMPACT_STATS.map(s => (
              <div key={s.label} className="text-center bg-white rounded-xl border border-border p-6">
                <p className="font-heading text-3xl font-bold text-green-600">{s.number}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-18 bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink text-center">Stories from the Heart</h2>
          <p className="text-sm text-muted text-center mt-1 max-w-md mx-auto">Real stories of change from the farmers and communities we work with.</p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {STORIES.map(s => (
              <div key={s.name} className="bg-off-white rounded-xl border border-border p-6">
                <img src={generatePlaceholder('farmer', s.name)} alt={s.name} className="w-12 h-12 rounded-full object-cover mb-4" />
                <h3 className="font-semibold text-ink">{s.name}</h3>
                <p className="text-[11px] text-muted">{s.village} — {s.product}</p>
                <p className="mt-3 text-sm text-muted leading-relaxed italic">"{s.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-18 bg-sand">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">Be Part of the Change</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">Your support helps us reach more tribal communities and preserve traditional farming.</p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">Shop Now →</Link>
        </div>
      </section>
    </div>
  )
}
