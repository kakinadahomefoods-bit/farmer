const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const demoProducts = [
  {
    id: 'dm-1', name: 'HaiFarmer Wild Honey', tagline: 'Forest-Collected Putta Honey',
    category_tag: 'Honey', category_name: 'Honey',
    image_url: '/demo/products/honey.svg',
    description: 'HaiFarmer Wild Honey | Forest-Collected Putta Honey Collected from forest regions. Pure, raw, and unfiltered.',
    variants: [
      { id: 'dm-1a', weight_label: '250g', price: 399, original_price: 499, stock: 50 },
      { id: 'dm-1b', weight_label: '500g', price: 699, original_price: 849, stock: 50 },
      { id: 'dm-1c', weight_label: '1kg', price: 1199, original_price: 1499, stock: 50 },
    ],
    isBestSeller: true, rating: 4.8, reviewCount: 124,
  },
  {
    id: 'dm-2', name: 'HaiFarmer Brown Sugar', tagline: 'Unrefined Natural Sweetener',
    category_tag: 'Sugar', category_name: 'Sugar',
    image_url: '/demo/products/jaggery.svg',
    description: 'HaiFarmer Traditional Brown Sugar | Unrefined Natural Sweetener. Less processed, rich in minerals.',
    variants: [
      { id: 'dm-2a', weight_label: '500g', price: 175, original_price: 199, stock: 50 },
    ],
    rating: 4.5, reviewCount: 48,
  },
  {
    id: 'dm-3', name: 'HaiFarmer Pink Salt', tagline: 'Natural Mineral Salt',
    category_tag: 'Salt', category_name: 'Salt',
    image_url: '/demo/products/rock-salt.svg',
    description: 'HaiFarmer Pink Rock Salt | Natural Mineral Salt. Naturally occurring rock salt rich in trace minerals.',
    variants: [
      { id: 'dm-3a', weight_label: '500g', price: 120, original_price: 149, stock: 50 },
    ],
    rating: 4.4, reviewCount: 36,
  },
  {
    id: 'dm-4', name: 'Miriyalu', tagline: 'HaiFarmer Forest Black Pepper',
    category_tag: 'Spices', category_name: 'Spices',
    image_url: '/demo/products/pepper.svg',
    description: 'HaiFarmer Forest Black Pepper | Tribal Miriyalu. Naturally grown black pepper from tribal forests.',
    variants: [
      { id: 'dm-4a', weight_label: '100g', price: 129, original_price: 169, stock: 50 },
      { id: 'dm-4b', weight_label: '200g', price: 249, original_price: 299, stock: 50 },
    ],
    isBestSeller: true, rating: 4.7, reviewCount: 89,
  },
  {
    id: 'dm-5', name: 'Natu Minapappu', tagline: 'Traditional Black Gram',
    category_tag: 'Pulses', category_name: 'Lentils & Beans',
    image_url: '/demo/products/black-gram.svg',
    description: 'HaiFarmer Traditional Minumulu | Black Gram. Naturally cultivated black gram used in traditional cooking.',
    variants: [
      { id: 'dm-5a', weight_label: '500g', price: 129, original_price: 169, stock: 50 },
      { id: 'dm-5b', weight_label: '1kg', price: 239, original_price: 299, stock: 50 },
    ],
    rating: 4.5, reviewCount: 62,
  },
  {
    id: 'dm-6', name: 'Konda Sajjalu', tagline: 'Pearl Millet',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/pearl-millet.svg',
    description: 'HaiFarmer Sajjalu | Pearl Millet. A traditional super grain consumed for generations.',
    variants: [
      { id: 'dm-6a', weight_label: '500g', price: 199, original_price: 249, stock: 50 },
      { id: 'dm-6b', weight_label: '1kg', price: 349, original_price: 429, stock: 50 },
    ],
    rating: 4.6, reviewCount: 55,
  },
  {
    id: 'dm-7', name: 'Erra Jonnalu', tagline: 'Red Sorghum',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/sorghum.svg',
    description: 'HaiFarmer Erra Jonnalu | Red Sorghum. Traditional red sorghum valued for its rich colour and nutrition.',
    variants: [
      { id: 'dm-7a', weight_label: '500g', price: 199, original_price: 249, stock: 50 },
      { id: 'dm-7b', weight_label: '1kg', price: 349, original_price: 429, stock: 50 },
    ],
    rating: 4.6, reviewCount: 47,
  },
  {
    id: 'dm-8', name: 'Tella Jonnalu', tagline: 'White Sorghum',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/sorghum.svg',
    description: 'HaiFarmer Tella Jonnalu | White Sorghum. Traditional sorghum grain cultivated using natural methods.',
    variants: [
      { id: 'dm-8a', weight_label: '500g', price: 199, original_price: 249, stock: 50 },
      { id: 'dm-8b', weight_label: '1kg', price: 349, original_price: 429, stock: 50 },
    ],
    rating: 4.5, reviewCount: 42,
  },
  {
    id: 'dm-9', name: 'Adavi Arikalu', tagline: 'Kodo Millet',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/kodo-millet.svg',
    description: 'HaiFarmer Arikalu | Ancient Kodo Millet. An ancient millet variety once widely grown by tribal farmers.',
    variants: [
      { id: 'dm-9a', weight_label: '500g', price: 199, original_price: 249, stock: 50 },
      { id: 'dm-9b', weight_label: '1kg', price: 349, original_price: 429, stock: 50 },
    ],
    rating: 4.5, reviewCount: 39,
  },
  {
    id: 'dm-10', name: 'Konda Korralu', tagline: 'Foxtail Millet',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/foxtail.svg',
    description: 'HaiFarmer Korralu | Foxtail Millet. Naturally cultivated millet known for its nutritional benefits.',
    variants: [
      { id: 'dm-10a', weight_label: '500g', price: 199, original_price: 249, stock: 50 },
      { id: 'dm-10b', weight_label: '1kg', price: 349, original_price: 429, stock: 50 },
    ],
    rating: 4.7, reviewCount: 68,
  },
  {
    id: 'dm-11', name: 'Konda Samalu', tagline: 'Little Millet',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/little-millet.svg',
    description: 'HaiFarmer Samalu | Little Millet. A traditional millet celebrated for its nutrition and easy digestibility.',
    variants: [
      { id: 'dm-11a', weight_label: '500g', price: 219, original_price: 269, stock: 50 },
      { id: 'dm-11b', weight_label: '1kg', price: 399, original_price: 499, stock: 50 },
    ],
    rating: 4.6, reviewCount: 54,
  },
  {
    id: 'dm-12', name: 'Sprouted Ragi Powder', tagline: 'Finger Millet',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/ragi.svg',
    description: 'HaiFarmer Traditional Ragi | Finger Millet. A nutrient-dense millet traditionally grown in tribal regions.',
    variants: [
      { id: 'dm-12a', weight_label: '500g', price: 279, original_price: 349, stock: 50 },
      { id: 'dm-12b', weight_label: '1kg', price: 499, original_price: 599, stock: 50 },
    ],
    isBestSeller: true, rating: 4.8, reviewCount: 86,
  },
]

export const demoCombos = [
  {
    _id: 'dm-c1', name: 'Millet Variety Pack', slug: 'millet-variety-pack',
    image: '/demo/products/combo-2.svg',
    description: 'Four traditional millets in one box. [CONTAINS] Pearl Millet 500g, Red Sorghum 500g, White Sorghum 500g, Foxtail Millet 500g',
    discountPercent: 15, price: 649,
    items: [
      { price: 199, quantity: 1, variant: { price: 199 } },
      { price: 199, quantity: 1, variant: { price: 199 } },
      { price: 199, quantity: 1, variant: { price: 199 } },
      { price: 199, quantity: 1, variant: { price: 199 } },
    ],
  },
  {
    _id: 'dm-c2', name: 'Spice Essentials', slug: 'spice-essentials',
    image: '/demo/products/combo-3.svg',
    description: 'Essential spices for every kitchen. [CONTAINS] Black Pepper 100g, Pink Salt 500g, Brown Sugar 500g',
    discountPercent: 12, price: 349,
    items: [
      { price: 129, quantity: 1, variant: { price: 129 } },
      { price: 120, quantity: 1, variant: { price: 120 } },
      { price: 175, quantity: 1, variant: { price: 175 } },
    ],
  },
  {
    _id: 'dm-c3', name: 'Honey & Grains Duo', slug: 'honey-grains-duo',
    image: '/demo/products/combo-1.svg',
    description: 'Best of both worlds. [CONTAINS] Wild Honey 500g, Little Millet 1kg',
    discountPercent: 10, price: 979,
    items: [
      { price: 699, quantity: 1, variant: { price: 699 } },
      { price: 399, quantity: 1, variant: { price: 399 } },
    ],
  },
  {
    _id: 'dm-c4', name: 'Protein Pack', slug: 'protein-pack',
    image: '/demo/products/combo-2.svg',
    description: 'Protein-rich grains for a healthy diet. [CONTAINS] Black Gram 500g, Ragi Powder 500g, Foxtail Millet 500g',
    discountPercent: 15, price: 499,
    items: [
      { price: 129, quantity: 1, variant: { price: 129 } },
      { price: 279, quantity: 1, variant: { price: 279 } },
      { price: 199, quantity: 1, variant: { price: 199 } },
    ],
  },
]

export const demoFarmers = [
  {
    _id: 'dm-f1', name: 'Rama Devi', village: 'Araku Valley', district: 'Visakhapatnam',
    image_url: '/demo/farmers/farmer-1.svg',
    bio: 'Growing organic millets and spices for over 20 years using traditional methods passed down from her grandmother.',
    qrCode: 'demo-farmer-1', code: 'demo-farmer-1',
    products: ['Millets', 'Spices'], location: 'Araku Valley, Visakhapatnam',
  },
  {
    _id: 'dm-f2', name: 'Lakshmi Naidu', village: 'Paderu', district: 'Visakhapatnam',
    image_url: '/demo/farmers/farmer-2.svg',
    bio: 'Third-generation tribal farmer specializing in wild honey harvesting and organic pulses.',
    qrCode: 'demo-farmer-2', code: 'demo-farmer-2',
    products: ['Honey', 'Pulses'], location: 'Paderu, Visakhapatnam',
  },
  {
    _id: 'dm-f3', name: 'Sanya Bai', village: 'Chintapalli', district: 'Visakhapatnam',
    image_url: '/demo/farmers/farmer-3.svg',
    bio: 'Leads a women\'s farming collective producing cold-pressed oils and traditional grains.',
    qrCode: 'demo-farmer-3', code: 'demo-farmer-3',
    products: ['Oils', 'Grains'], location: 'Chintapalli, Visakhapatnam',
  },
  {
    _id: 'dm-f4', name: 'Mohan Rao', village: 'Maredumilli', district: 'East Godavari',
    image_url: '/demo/farmers/farmer-4.svg',
    bio: 'Forest-dwelling farmer cultivating rare varieties of millets and forest spices.',
    qrCode: 'demo-farmer-4', code: 'demo-farmer-4',
    products: ['Millets', 'Spices', 'Honey'], location: 'Maredumilli, East Godavari',
  },
]

const demoCategories = [
  {
    id: 'dm-cat-millets', name: 'Millets', slug: 'millets', _id: 'dm-cat-millets',
    description: 'Traditional grains, gluten-free', image_url: '/demo/products/sorghum.svg',
    order: 1, isActive: true,
  },
  {
    id: 'dm-cat-pulses', name: 'Lentils & Beans', slug: 'lentils-beans', _id: 'dm-cat-pulses',
    description: 'Protein-rich legumes', image_url: '/demo/products/black-gram.svg',
    order: 2, isActive: true,
  },
  {
    id: 'dm-cat-spices', name: 'Spices', slug: 'spices', _id: 'dm-cat-spices',
    description: 'Aromatic forest spices', image_url: '/demo/products/pepper.svg',
    order: 3, isActive: true,
  },
  {
    id: 'dm-cat-honey', name: 'Honey', slug: 'honey', _id: 'dm-cat-honey',
    description: 'Raw forest honey', image_url: '/demo/products/honey.svg',
    order: 4, isActive: true,
  },
  {
    id: 'dm-cat-sugar', name: 'Sugar', slug: 'sugar', _id: 'dm-cat-sugar',
    description: 'Natural sweeteners', image_url: '/demo/products/jaggery.svg',
    order: 5, isActive: true,
  },
  {
    id: 'dm-cat-salt', name: 'Salt', slug: 'salt', _id: 'dm-cat-salt',
    description: 'Mineral-rich salts', image_url: '/demo/products/rock-salt.svg',
    order: 6, isActive: true,
  },
]

export const demoStories = [
  {
    poster: '/demo/stories/story-1.svg',
    title: 'Harvesting Millets the Traditional Way',
    duration: '2:34',
    alt: 'Tribal farmers harvesting millets in a lush green field',
  },
  {
    poster: '/demo/stories/story-2.svg',
    title: 'Forest Honey Collection Journey',
    duration: '3:12',
    alt: 'Traditional honey harvesting from forest beehives',
  },
  {
    poster: '/demo/stories/story-3.svg',
    title: 'Life of a Tribal Farmer',
    duration: '4:05',
    alt: 'Daily life and farming practices of tribal communities',
  },
  {
    poster: '/demo/stories/story-4.svg',
    title: 'From Forest to Your Table',
    duration: '2:58',
    alt: 'The journey of organic food from tribal forests to consumers',
  },
]

export function demoCategoriesBySlug(slug) {
  const cat = demoCategories.find(c => c.slug === slug || c.name?.toLowerCase() === slug)
  if (!cat) return []
  return demoProducts.filter(p => {
    const pCat = p.category_name?.toLowerCase() || p.category_tag?.toLowerCase()
    return pCat === slug || pCat === cat.name?.toLowerCase()
  })
}

export function getDemoCategoryId(name) {
  const cat = demoCategories.find(c => c.name?.toLowerCase() === name?.toLowerCase() || c.slug === name?.toLowerCase())
  return cat?._id || cat?.id || null
}

export function demoProductsByCategory(categoryName) {
  const name = categoryName?.toLowerCase()
  return demoProducts.filter(p => {
    const pCat = p.category_name?.toLowerCase() || p.category_tag?.toLowerCase()
    if (name === 'millets') return pCat === 'millets'
    if (name === 'lentils-beans' || name === 'pulses') return pCat === 'lentils & beans' || pCat === 'pulses'
    if (name === 'groceries' || name === 'grocery') return true
    return pCat === name
  })
}

export const demoBanners = [
  {
    _id: 'dm-banner-1',
    title: '',
    subtitle: '',
    buttonText: '',
    redirectLink: '/products',
    image: '/assets/main-banner.png',
    desktopImage: '/assets/main-banner.png',
    tabletImage: '/assets/main-banner.png',
    mobileImage: '/assets/main-banner.png',
    order: 0,
    isActive: true,
    position: 'hero',
  },
]

export { DEMO_MODE, demoCategories }
