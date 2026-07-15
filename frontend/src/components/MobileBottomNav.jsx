import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HomeIcon, ProductsIcon, CombosIcon, AboutIcon } from './Icons'

export default function MobileBottomNav() {
  const { user } = useAuth()

  const iconBtn = 'mb-1 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-white text-current shadow-sm ring-1 ring-slate-200/80'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
        <NavLink to="/" end className={({ isActive }) => `flex-1 rounded-xl py-2 text-center text-[10px] font-semibold tracking-[0.08em] transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
          <span className={iconBtn}><HomeIcon className="h-4.5 w-4.5" /></span>
          <span className="block">HOME</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `flex-1 rounded-xl py-2 text-center text-[10px] font-semibold tracking-[0.08em] transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
          <span className={iconBtn}><ProductsIcon className="h-4.5 w-4.5" /></span>
          <span className="block">PRODUCTS</span>
        </NavLink>
        <NavLink to="/combos" className={({ isActive }) => `flex-1 rounded-xl py-2 text-center text-[10px] font-semibold tracking-[0.08em] transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
          <span className={iconBtn}><CombosIcon className="h-4.5 w-4.5" /></span>
          <span className="block">COMBOS</span>
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `flex-1 rounded-xl py-2 text-center text-[10px] font-semibold tracking-[0.08em] transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
          <span className={iconBtn}><AboutIcon className="h-4.5 w-4.5" /></span>
          <span className="block">ABOUT</span>
        </NavLink>
        {user && (
          <NavLink to="/account" className={({ isActive }) => `flex-1 rounded-xl py-2 text-center text-[10px] font-semibold tracking-[0.08em] transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className={iconBtn}><AboutIcon className="h-4.5 w-4.5" /></span>
            <span className="block">ACCOUNT</span>
          </NavLink>
        )}
      </div>
    </nav>
  )
}
