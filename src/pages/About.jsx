import { Link } from 'react-router-dom'

const WHATSAPP_NUMBER = '9709704563'

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="heading-font text-4xl font-extrabold text-slate-900">About HAiFarmer</h1>
        <p className="mt-4 text-lg text-slate-600">We connect tribal farmers directly with customers, ensuring fresh, 100% natural products reach your doorstep.</p>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          { icon: '🌿', title: '100% Natural', desc: 'All our products are naturally grown without any chemicals or pesticides.' },
          { icon: '💧', title: 'Rainwater Fed', desc: 'Our farms are irrigated purely through rainwater, preserving natural taste and nutrition.' },
          { icon: '👨‍🌾', title: 'Direct from Farmers', desc: 'No middlemen. Fair prices for farmers, fresh products for you.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">{item.icon}</div>
            <h3 className="heading-font text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 rounded-3xl bg-gradient-to-r from-brand-600 to-emerald-600 px-8 py-12 text-center text-white">
        <h2 className="heading-font text-2xl font-extrabold">Want to sell your farm products?</h2>
        <p className="mx-auto mt-3 max-w-lg opacity-90">Join our growing community of farmers and reach thousands of customers directly.</p>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello HAiFarmer, I am a farmer and want to sell my products on your platform.')}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition">💬 Contact on WhatsApp</a>
      </section>
    </div>
  )
}
