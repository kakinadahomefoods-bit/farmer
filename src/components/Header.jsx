import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { fetchSiteSettings } from '../contexts/SiteSettingsContext'
import { CartIcon, AccountIcon, LogoutIcon, MenuIcon, CloseIcon } from './Icons'

export default function Header() {
  const { user, signOut } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const [logo, setLogo] = useState('')
  const [headerText, setHeaderText] = useState('Free delivery over ₹1499')
  const [menuOpen, setMenuOpen] = useState(false)

  const totalItems = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSiteSettings()
        setLogo(s?.logo_url || '')
        setHeaderText(s?.header_text_1 || 'Free delivery over ₹1499')
      } catch {
        setLogo('')
        setHeaderText('Free delivery over ₹1499')
      }
    })()
  }, [])

  const goToCheckout = () => navigate('/checkout')
  const closeMenu = () => setMenuOpen(false)

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-[0.08em] transition ` +
    (isActive ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-600 hover:bg-slate-100 hover:text-brand-700')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      {headerText && (
        <div className="overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 px-4 py-1.5 text-xs font-medium text-white sm:px-6 lg:px-8">
          <div className="header-marquee whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="mx-10 inline-block whitespace-pre">{headerText}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center text-xl font-semibold text-brand-700" onClick={closeMenu}>
          {logo ? (
            <img src={logo} alt="HAiFarmer logo" loading="eager" className="h-[58px] w-auto object-contain sm:h-[68px]" />
          ) : (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg text-white sm:h-14 sm:w-14 sm:text-xl">H</span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>HOME</NavLink>
          <NavLink to="/products" className={navLinkClass}>PRODUCTS</NavLink>
          <NavLink to="/combos" className={navLinkClass}>COMBOS</NavLink>
          <NavLink to="/about" className={navLinkClass}>ABOUT</NavLink>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={goToCheckout}
                aria-label="View cart"
                className="inline-flex relative items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 sm:h-11 sm:w-11"
              >
                <CartIcon className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">{totalItems}</span>
                )}
              </button>
              <Link to="/account" onClick={closeMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow sm:h-11 sm:w-11" aria-label="Account dashboard">
                <AccountIcon className="h-5 w-5" />
              </Link>
              <button onClick={signOut} className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow sm:inline-flex sm:px-4 sm:text-sm">
                <LogoutIcon className="h-4 w-4" />Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={goToCheckout}
                aria-label="View cart"
                className="inline-flex relative items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700 sm:h-10 sm:w-10"
              >
                <CartIcon className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">{totalItems}</span>
                )}
              </button>
              <a
                href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow sm:px-4 sm:py-2 sm:text-sm"
              >💬 WhatsApp</a>
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-inner">
          {[{ to: '/', label: 'HOME' }, { to: '/products', label: 'PRODUCTS' }, { to: '/combos', label: 'COMBOS' }, { to: '/about', label: 'ABOUT' }].map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={closeMenu} className={({ isActive }) =>
              `block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`
            }>{item.label}</NavLink>
          ))}
          {user ? (
            <button onClick={() => { signOut(); closeMenu() }} className="block w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition">Logout</button>
          ) : (
            <a href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-green-600 hover:bg-green-50 transition">💬 Chat on WhatsApp</a>
          )}
        </div>
      )}
    </header>
  )
}
