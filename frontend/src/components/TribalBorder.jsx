export default function TribalBorder({ className = '' }) {
  return (
    <div className={`flex justify-center gap-1 text-gold-500/40 ${className}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="text-sm" style={{ transform: `rotate(${i % 2 === 0 ? 0 : 180}deg)` }}>◆</span>
      ))}
    </div>
  )
}
