const BASE = '/assets'

export const HOME_ASSETS = {
  hero: [
    {
      desktop: `${BASE}/hero-1.svg`,
      mobile: `${BASE}/hero-1.svg`,
      alt: 'Tribal farmers harvesting millets in a lush green field',
    },
    {
      desktop: `${BASE}/hero-2.svg`,
      mobile: `${BASE}/hero-2.svg`,
      alt: 'Forest honey being collected from traditional beehives',
    },
    {
      desktop: `${BASE}/hero-3.svg`,
      mobile: `${BASE}/hero-3.svg`,
      alt: 'Freshly harvested organic spices and grains',
    },
  ],

  adBanner: {
    desktop: `${BASE}/ad-banner.svg`,
    mobile: `${BASE}/ad-banner.svg`,
    alt: 'Free delivery on all orders over ₹999 — special offer banner',
  },

  videoSection: {
    poster: `${BASE}/video-poster.svg`,
    alt: 'HaiFarmer brand film — from forest to your home',
    src: '',
    type: 'video/mp4',
  },

  youtube: {
    videoId: 'dQw4w9WgXcQ',
    poster: `${BASE}/youtube-poster.svg`,
    alt: 'HaiFarmer farm to table journey — YouTube video',
  },

  leftBanner: {
    desktop: `${BASE}/left-banner.svg`,
    mobile: `${BASE}/left-banner.svg`,
    alt: 'Pure Forest Honey collection — raw, unfiltered, straight from tribal beekeepers',
  },

  newsletter: {
    bg: `${BASE}/newsletter-bg.svg`,
    alt: '',
  },
}

export function getHeroAsset(index) {
  return HOME_ASSETS.hero[index] || HOME_ASSETS.hero[0]
}
