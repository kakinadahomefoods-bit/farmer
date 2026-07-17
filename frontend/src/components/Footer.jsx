import { Link } from 'react-router-dom'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function Footer() {
  const { settings } = useSiteSettings()
  const year = new Date().getFullYear()
  const whatsapp = settings?.whatsapp || settings?.whatsapp_number || '9709704563'
  const phone = settings?.phone || settings?.contact_phone || '9709704563'
  const email = settings?.email || settings?.contact_email || ''

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold">H</span>
              HAiFarmer
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Natural & organic groceries directly from tribal villages. Rainwater-fed crops, pesticide-free produce, sustainable farming.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/products" className="text-sm hover:text-brand-400 transition">Products</Link></li>
              <li><Link to="/combos" className="text-sm hover:text-brand-400 transition">Combo Packs</Link></li>
              <li><Link to="/about" className="text-sm hover:text-brand-400 transition">About Us</Link></li>

            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Delivery Info</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>📍 Pick Up in Mysore — FREE</li>
              <li>🚚 Home Delivery in Mysore</li>
              <li>🇮🇳 Pan-India Shipping via India Post</li>
              <li>🎁 Free shipping on orders over ₹399</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`https://wa.me/91${whatsapp}?text=Hello%20HAiFarmer`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition">
                  💬 WhatsApp: {whatsapp}
                </a>
              </li>
              {phone && <li>📞 <a href={`tel:+91${phone}`} className="hover:text-brand-400 transition">{phone}</a></li>}
              {email && <li>✉️ <a href={`mailto:${email}`} className="hover:text-brand-400 transition">{email}</a></li>}
              <li className="text-slate-500 text-xs mt-3">#30, Sri Nivasa, RCE Layout,<br />Vijayanagar 4th Stage, Mysore – 570032</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">© {year} HAiFarmer. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/about" className="hover:text-slate-300 transition">About</Link>
            <span>·</span>

            <Link to="/products" className="hover:text-slate-300 transition">Products</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
