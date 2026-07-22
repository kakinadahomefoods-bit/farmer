const COLORS = {
  brand: '#D97745',
  brandDark: '#C05E2E',
  brandDarker: '#A74B1F',
  ink: '#8B5E3C',
  sand: '#F8F4EE',
  sandDark: '#EADBC8',
  white: '#FFFDF9',
  gold: '#C9A24C',
  green: '#2D6A4F',
}

export function productPlaceholder(name = 'Product') {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${COLORS.white}"/><stop offset="100%" stop-color="${COLORS.sand}"/></linearGradient></defs>
    <rect fill="url(#bg)" width="600" height="600"/>
    <rect x="150" y="120" width="300" height="300" rx="24" fill="${COLORS.sandDark}" opacity="0.5"/>
    <circle cx="300" cy="270" r="60" fill="${COLORS.brand}" opacity="0.15"/>
    <path d="M240 270 l30-30 30 30" stroke="${COLORS.brand}" stroke-width="3" fill="none" opacity="0.4"/>
    <path d="M270 240 v60 h60" stroke="${COLORS.brand}" stroke-width="3" fill="none" opacity="0.4"/>
    <text x="300" y="500" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="16" font-weight="600" fill="${COLORS.ink}">${name.slice(0, 30)}</text>
    <text x="300" y="530" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="12" fill="${COLORS.ink}" opacity="0.6">Premium quality</text>
  </svg>`)}`
}

export function farmerPlaceholder(name = 'Farmer') {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><radialGradient id="fg" cx="0.5" cy="0.4" r="0.6"><stop offset="0%" stop-color="${COLORS.sand}"/><stop offset="100%" stop-color="${COLORS.sandDark}"/></radialGradient></defs>
    <rect width="400" height="400" fill="url(#fg)"/>
    <circle cx="200" cy="160" r="60" fill="${COLORS.ink}" opacity="0.15"/>
    <path d="M200 220 Q160 260 140 320 Q180 340 200 340 Q220 340 260 320 Q240 260 200 220Z" fill="${COLORS.ink}" opacity="0.12"/>
    <circle cx="200" cy="155" r="30" fill="${COLORS.brand}" opacity="0.15"/>
    <text x="200" y="370" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="14" font-weight="600" fill="${COLORS.ink}">${name.slice(0, 25)}</text>
  </svg>`)}`
}

export function categoryPlaceholder(name = 'Category') {
  const icons = {
    groceries: '🥬', millets: '🌾', 'lentils & beans': '🫘', honey: '🍯',
    spices: '🌶️', 'dry fruits': '🥜', oils: '🫒', pickles: '🥒', combos: '📦',
  }
  const icon = Object.entries(icons).find(([k]) => name.toLowerCase().includes(k))?.[1] || '🌿'
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${COLORS.white}"/><stop offset="100%" stop-color="${COLORS.sand}"/></linearGradient></defs>
    <rect fill="url(#cbg)" width="400" height="400"/>
    <circle cx="200" cy="180" r="80" fill="${COLORS.sandDark}" opacity="0.4"/>
    <text x="200" y="200" text-anchor="middle" font-size="48">${icon}</text>
    <text x="200" y="330" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="18" font-weight="700" fill="${COLORS.ink}">${name.slice(0, 28)}</text>
    <text x="200" y="355" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="11" fill="${COLORS.ink}" opacity="0.5">Shop Now →</text>
  </svg>`)}`
}

export function farmerCardPlaceholder() {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs><linearGradient id="fcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${COLORS.sand}"/><stop offset="100%" stop-color="${COLORS.sandDark}"/></linearGradient></defs>
    <rect fill="url(#fcg)" width="400" height="400"/>
    <circle cx="200" cy="160" r="50" fill="${COLORS.white}" opacity="0.6"/>
    <circle cx="200" cy="150" r="22" fill="${COLORS.brand}" opacity="0.2"/>
    <path d="M200 205 Q170 235 155 275 Q180 290 200 290 Q220 290 245 275 Q230 235 200 205Z" fill="${COLORS.brand}" opacity="0.15"/>
    <path d="M200 160 l-12 10 4 14 8-6 8 6 4-14z" fill="${COLORS.brand}" opacity="0.35"/>
    <text x="200" y="350" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="14" font-weight="600" fill="${COLORS.ink}">Our Farmer</text>
    <text x="200" y="372" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="11" fill="${COLORS.ink}" opacity="0.5">Traditional farming</text>
  </svg>`)}`
}

export function heroPlaceholder(index = 0) {
  const themes = [
    { bg: [COLORS.brandDarker, COLORS.brandDark], label: 'Organic Groceries' },
    { bg: [COLORS.brandDark, COLORS.ink], label: 'Forest Honey' },
    { bg: [COLORS.ink, COLORS.brandDarker], label: 'Tribal Farmers' },
  ]
  const t = themes[index % 3]
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="900" viewBox="0 0 1920 900">
    <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.bg[0]}"/><stop offset="100%" stop-color="${t.bg[1]}"/></linearGradient></defs>
    <rect fill="url(#hg)" width="1920" height="900"/>
    <circle cx="1600" cy="300" r="280" fill="${COLORS.sandDark}" opacity="0.12"/>
    <circle cx="1400" cy="650" r="200" fill="${COLORS.sand}" opacity="0.08"/>
    <circle cx="1700" cy="500" r="150" fill="${COLORS.brand}" opacity="0.15"/>
    <path d="M0 600 Q480 500 960 600 T1920 580" stroke="${COLORS.sandDark}" stroke-width="2" fill="none" opacity="0.15"/>
    <path d="M0 650 Q480 570 960 650 T1920 630" stroke="${COLORS.sand}" stroke-width="1.5" fill="none" opacity="0.1"/>
    <rect x="0" y="0" width="700" height="900" fill="url(#hg)" opacity="0.3"/>
  </svg>`)}`
}

export function bannerPlaceholder() {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="500" viewBox="0 0 1920 500">
    <defs><linearGradient id="bbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${COLORS.brandDarker}"/><stop offset="50%" stop-color="${COLORS.brandDark}"/><stop offset="100%" stop-color="${COLORS.ink}"/></linearGradient></defs>
    <rect fill="url(#bbg)" width="1920" height="500"/>
    <circle cx="1600" cy="100" r="180" fill="${COLORS.sand}" opacity="0.05"/>
    <circle cx="300" cy="400" r="150" fill="${COLORS.sandDark}" opacity="0.06"/>
    <circle cx="1800" cy="350" r="120" fill="${COLORS.brand}" opacity="0.08"/>
    <path d="M0 250 Q240 200 480 250 T960 240 T1440 260 T1920 240" stroke="${COLORS.sandDark}" stroke-width="1.5" fill="none" opacity="0.12"/>
  </svg>`)}`
}

export function videoPlaceholder() {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs><linearGradient id="vbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${COLORS.brandDark}"/><stop offset="100%" stop-color="${COLORS.ink}"/></linearGradient></defs>
    <rect fill="url(#vbg)" width="1280" height="720"/>
    <circle cx="1000" cy="200" r="160" fill="${COLORS.sand}" opacity="0.05"/>
    <circle cx="300" cy="500" r="120" fill="${COLORS.sandDark}" opacity="0.06"/>
    <circle cx="1100" cy="550" r="100" fill="${COLORS.brand}" opacity="0.08"/>
    <path d="M0 400 Q320 340 640 400 T1280 380" stroke="${COLORS.sandDark}" stroke-width="1.5" fill="none" opacity="0.1"/>
    <path d="M640 340 l50 30-50 30z" fill="${COLORS.sand}" opacity="0.25"/>
  </svg>`)}`
}

export function emptyStatePlaceholder(message = 'No items available', icon = '📭') {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs><linearGradient id="ebg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${COLORS.sand}"/><stop offset="100%" stop-color="${COLORS.white}"/></linearGradient></defs>
    <rect fill="url(#ebg)" rx="16" width="200" height="200"/>
    <text x="100" y="80" text-anchor="middle" font-size="36">${icon}</text>
    <text x="100" y="130" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="11" font-weight="600" fill="${COLORS.ink}">${message.slice(0, 40)}</text>
  </svg>`)}`
}

export function storyPlaceholder(title = 'Our Story') {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs><linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${COLORS.brandDark}"/><stop offset="100%" stop-color="${COLORS.brandDarker}"/></linearGradient></defs>
    <rect fill="url(#sbg)" width="400" height="300" rx="8"/>
    <circle cx="200" cy="120" r="40" fill="${COLORS.sand}" opacity="0.1"/>
    <path d="M200 100 l-15 20 15-10 15 10z" fill="${COLORS.sand}" opacity="0.3"/>
    <text x="200" y="220" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="16" font-weight="700" fill="${COLORS.sand}">${title.slice(0, 40)}</text>
  </svg>`)}`
}

export function generatePlaceholder(entity, name) {
  switch (entity) {
    case 'product': return productPlaceholder(name)
    case 'farmer': return farmerPlaceholder(name)
    case 'farmer-card': return farmerCardPlaceholder()
    case 'category': return categoryPlaceholder(name)
    case 'hero': return heroPlaceholder(Number(name) || 0)
    case 'banner': return bannerPlaceholder()
    case 'video': return videoPlaceholder()
    case 'story': return storyPlaceholder(name)
    case 'empty': return emptyStatePlaceholder(name)
    default: return productPlaceholder(name)
  }
}

export function getImageWithFallback(url, entity = 'product', name = '') {
  if (url && url.startsWith('http') && !url.includes('placeholder')) return url
  return generatePlaceholder(entity, name)
}
