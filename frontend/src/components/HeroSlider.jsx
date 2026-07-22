import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../lib/utils'
import { cld } from '../lib/cloudinary'

function isExternal(url) {
  return /^https?:\/\//i.test(url)
}

function BannerImage({ banner, priority }) {
  const desktop = banner.desktopImage || banner.image
  const tablet = banner.tabletImage || banner.desktopImage || banner.image
  const mobile = banner.mobileImage || banner.tabletImage || banner.desktopImage || banner.image

  const desktopUrl = desktop ? cld(getImageUrl(desktop), 'f_auto,q_auto,w_1920,h_700,c_fill') : ''
  const tabletUrl = tablet ? cld(getImageUrl(tablet), 'f_auto,q_auto,w_1200,h_600,c_fill') : ''
  const mobileUrl = mobile ? cld(getImageUrl(mobile), 'f_auto,q_auto,w_1080,h_1350,c_fill') : ''

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopUrl} />
      <source media="(min-width: 640px)" srcSet={tabletUrl} />
      <img
        src={mobileUrl}
        alt={banner.title || 'Banner'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </picture>
  )
}

export default function HeroSlider({ banners = [], interval = 5000 }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goTo = useCallback((i, dir = 1) => {
    setDirection(dir)
    setIndex((prev) => {
      let next = i
      if (next < 0) next = banners.length - 1
      if (next >= banners.length) next = 0
      return next
    })
  }, [banners.length])

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index])

  useEffect(() => {
    if (banners.length <= 1 || paused) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [banners.length, interval, next, paused])

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
  }

  if (!banners.length) return null

  const current = banners[index]
  const hasText = current.title || current.subtitle || current.buttonText

  const LinkWrapper = ({ children, className }) => {
    if (!current.redirectLink) return <div className={className}>{children}</div>
    const external = isExternal(current.redirectLink)
    if (external) {
      return (
        <a
          href={current.redirectLink}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      )
    }
    return <Link to={current.redirectLink} className={className}>{children}</Link>
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-off-white aspect-[4/5] sm:aspect-[2/1] lg:aspect-[1920/700]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {banners.map((banner, i) => {
        const active = i === index
        return (
          <div
            key={banner._id || i}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              active ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 z-0'
            } ${direction > 0 ? 'translate-x-full' : '-translate-x-full'}`}
            style={{ transform: active ? 'translateX(0)' : undefined }}
          >
            <LinkWrapper className="block h-full w-full">
              <BannerImage banner={banner} priority={i === 0} />
              {hasText && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
              )}
              {hasText && (
                <div className="absolute inset-0 flex items-center">
                  <div className="section-container">
                    <div className="max-w-xl animate-fade-up">
                      {banner.subtitle && (
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.title && (
                        <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                          {banner.title}
                        </h2>
                      )}
                      {banner.buttonText && (
                        <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
                          {banner.buttonText}
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </LinkWrapper>
          </div>
        )
      })}

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2.5 text-ink shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-600 sm:flex"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
