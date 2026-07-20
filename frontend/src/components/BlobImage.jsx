export default function BlobImage({ src, alt, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="blobClip">
            <path d="M60,10 C90,5 115,25 120,55 C125,85 110,115 80,125 C50,135 15,130 5,100 C-5,70 5,30 30,15 Z" />
          </clipPath>
        </defs>
        <foreignObject x="0" y="0" width="200" height="200" clipPath="url(#blobClip)">
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        </foreignObject>
      </svg>
      <div className="invisible"> {/* maintain space */} </div>
    </div>
  )
}
