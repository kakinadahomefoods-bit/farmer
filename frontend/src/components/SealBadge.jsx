export default function SealBadge({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-10 w-10', md: 'h-14 w-14', lg: 'h-20 w-20' }
  const textSizes = { sm: 'text-[6px]', md: 'text-[7px]', lg: 'text-[9px]' }
  const numSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-base' }

  return (
    <div className={`${sizes[size]} relative ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow text-gold-500 drop-shadow-lg" fill="currentColor">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.4" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3" />
        <text x="50" y="44" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold" fill="currentColor">100%</text>
        <text x="50" y="60" textAnchor="middle" dominantBaseline="central" fontSize="6" fontWeight="600" fill="currentColor" opacity="0.8">NATURAL</text>
        <path d="M50 5 A45 45 0 1 1 49.9 5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" opacity="0.3" />
      </svg>
    </div>
  )
}
