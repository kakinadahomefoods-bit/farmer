import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-7ZY04PD9S0', { page_path: pathname })
    }
  }, [pathname])
  return null
}
