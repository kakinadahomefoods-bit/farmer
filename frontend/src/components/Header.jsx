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
  const [headerText, setHeaderText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const totalItems = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSiteSettings()
        setLogo(s?.logo || s?.logo_url || '')
        setHeaderText(s?.headerText1 || s?.header_text_1 || '')
      } catch {
        setLogo('')
        setHeaderText('')
      }
    })()
  }, [])

  const goToCheckout = () => navigate('/checkout')
  const closeMenu = () => setMenuOpen(false)

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-[0.05em] uppercase transition ` +
    (isActive
      ? scrolled ? 'bg-cream-50/20 text-gold-500' : 'bg-white/15 text-cream-50'
      : scrolled ? 'text-cream-50/80 hover:text-gold-500 hover:bg-cream-50/10' : 'text-cream-50/70 hover:text-cream-50 hover:bg-white/10')

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-forest-900/98 shadow-[0_4px_30px_rgba(0,0,0,0.3)]' : 'bg-transparent'}`}>
      {headerText && (
        <div className={`overflow-hidden px-4 py-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-cream-50/70 transition-all duration-500 ${scrolled ? 'bg-forest-950/60' : 'bg-forest-900/40'}`}>
          <div className="header-marquee whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="mx-10 inline-block whitespace-pre">{headerText}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          {logo ? (
            <img src={logo} alt="HAiFarmer logo" loading="eager" className="h-[52px] w-auto object-contain sm:h-[60px]" />
          ) : (
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-500 text-lg font-bold text-cream-50 sm:h-13 sm:w-13 sm:text-xl">H</span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          <NavLink to="/combos" className={navLinkClass}>Combos</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={goToCheckout}
            aria-label="View cart"
            className={`inline-flex relative items-center justify-center rounded-full transition ${scrolled ? 'text-cream-50/80 hover:text-gold-500 hover:bg-cream-50/10' : 'text-cream-50/80 hover:text-cream-50 hover:bg-white/10'} sm:h-10 sm:w-10`}
          >
            <CartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-terracotta-500 px-1.5 text-[10px] font-semibold text-cream-50">{totalItems}</span>
            )}
          </button>

          {user ? (
            <>
              <Link to="/account" onClick={closeMenu} className={`rounded-full transition sm:h-10 sm:w-10 inline-flex items-center justify-center ${scrolled ? 'text-cream-50/80 hover:text-gold-500 hover:bg-cream-50/10' : 'text-cream-50/80 hover:text-cream-50 hover:bg-white/10'}`} aria-label="Account dashboard">
                <AccountIcon className="h-5 w-5" />
              </Link>
              <button onClick={signOut} className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.05em] uppercase transition text-cream-50/80 hover:text-cream-50 ${scrolled ? 'hover:bg-cream-50/10' : 'hover:bg-white/10'}`}>
                <LogoutIcon className="h-4 w-4" />Logout
              </button>
            </>
          ) : (
            <a
              href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-terracotta-500 px-4 py-2 text-xs font-semibold tracking-[0.05em] uppercase text-cream-50 transition hover:bg-terracotta-600"
            >WhatsApp</a>
          )}

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition md:hidden ${scrolled ? 'text-cream-50/80 hover:text-gold-500' : 'text-cream-50/70 hover:text-cream-50'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-cream-50/10 bg-forest-900/98 px-4 py-3 space-y-1 backdrop-blur-xl">
          {[{ to: '/', label: 'Home' }, { to: '/products', label: 'Products' }, { to: '/combos', label: 'Combos' }, { to: '/about', label: 'About' }].map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={closeMenu} className={({ isActive }) =>
              `block rounded-xl px-3 py-2.5 text-sm font-semibold tracking-[0.05em] transition ${isActive ? 'bg-cream-50/10 text-gold-500' : 'text-cream-50/70 hover:text-cream-50 hover:bg-cream-50/5'}`
            }>{item.label}</NavLink>
          ))}
          {user ? (
            <button onClick={() => { signOut(); closeMenu() }} className="block w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold text-terracotta-500 hover:bg-cream-50/10 transition">Logout</button>
          ) : (
            <a href="https://wa.me/9709704563?text=Hello%20HAiFarmer%2C%20I%20would%20like%20to%20place%20an%20order" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gold-500 hover:bg-cream-50/10 transition">WhatsApp</a>
          )}
        </div>
      )}
    </header>
  )
}
