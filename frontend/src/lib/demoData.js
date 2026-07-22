const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const demoProducts = [
  {
    id: 'dm-1', name: 'HaiFarmer Wild Honey', tagline: 'Raw, unfiltered forest honey',
    category_tag: 'Honey', category_name: 'Honey',
    image_url: '/demo/products/honey.svg',
    description: 'Pure wild honey harvested from the forests of Araku Valley. Rich in antioxidants, naturally antibacterial.',
    variants: [
      { id: 'dm-1a', weight_label: '250g', price: 249, original_price: 299, stock: 50 },
      { id: 'dm-1b', weight_label: '500g', price: 449, original_price: 549, stock: 50 },
      { id: 'dm-1c', weight_label: '1kg', price: 799, original_price: 999, stock: 50 },
    ],
    isBestSeller: true, rating: 4.8, reviewCount: 124,
  },
  {
    id: 'dm-2', name: 'Miriyalu (Black Pepper)', tagline: 'Whole sun-dried black pepper',
    category_tag: 'Spices', category_name: 'Spices',
    image_url: '/demo/products/pepper.svg',
    description: 'Aromatic whole black pepper from tribal farms. Pungent, bold flavour.',
    variants: [
      { id: 'dm-2a', weight_label: '100g', price: 89, original_price: 109, stock: 50 },
      { id: 'dm-2b', weight_label: '250g', price: 189, original_price: 239, stock: 50 },
      { id: 'dm-2c', weight_label: '500g', price: 329, original_price: 419, stock: 50 },
    ],
    isBestSeller: true, rating: 4.7, reviewCount: 89,
  },
  {
    id: 'dm-3', name: 'Pasupu (Turmeric)', tagline: 'Pure finger turmeric, sun-dried',
    category_tag: 'Spices', category_name: 'Spices',
    image_url: '/demo/products/turmeric.svg',
    description: 'High-curcumin turmeric grown without chemicals. Vibrant orange colour, earthy aroma.',
    variants: [
      { id: 'dm-3a', weight_label: '100g', price: 69, original_price: 89, stock: 50 },
      { id: 'dm-3b', weight_label: '250g', price: 149, original_price: 199, stock: 50 },
      { id: 'dm-3c', weight_label: '500g', price: 259, original_price: 349, stock: 50 },
    ],
    rating: 4.6, reviewCount: 76,
  },
  {
    id: 'dm-4', name: 'Karam (Red Chilli)', tagline: 'Fiery Guntur red chillies',
    category_tag: 'Spices', category_name: 'Spices',
    image_url: '/demo/products/chilli.svg',
    description: 'Sun-dried red chillies from tribal farmers. Intense heat, deep red colour.',
    variants: [
      { id: 'dm-4a', weight_label: '100g', price: 59, original_price: 79, stock: 50 },
      { id: 'dm-4b', weight_label: '250g', price: 129, original_price: 169, stock: 50 },
    ],
    rating: 4.5, reviewCount: 63,
  },
  {
    id: 'dm-5', name: 'Jonnalu (Sorghum)', tagline: 'Traditional white sorghum',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/sorghum.svg',
    description: 'Premium jonna from tribal farms. Gluten-free, rich in fibre and protein.',
    variants: [
      { id: 'dm-5a', weight_label: '500g', price: 89, original_price: 109, stock: 50 },
      { id: 'dm-5b', weight_label: '1kg', price: 159, original_price: 199, stock: 50 },
      { id: 'dm-5c', weight_label: '2kg', price: 289, original_price: 369, stock: 50 },
    ],
    isBestSeller: true, rating: 4.8, reviewCount: 112,
  },
  {
    id: 'dm-6', name: 'Korralu (Foxtail Millet)', tagline: 'Protein-rich foxtail millet',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/foxtail.svg',
    description: 'Staple grain of tribal communities. Low glycemic index, perfect for daily meals.',
    variants: [
      { id: 'dm-6a', weight_label: '500g', price: 99, original_price: 129, stock: 50 },
      { id: 'dm-6b', weight_label: '1kg', price: 179, original_price: 229, stock: 50 },
    ],
    rating: 4.7, reviewCount: 95,
  },
  {
    id: 'dm-7', name: 'Samalu (Little Millet)', tagline: 'Tiny grain, big nutrition',
    category_tag: 'Millets', category_name: 'Millets',
    image_url: '/demo/products/little-millet.svg',
    description: 'High-fibre little millet, easy to digest. Perfect for upma, pongal, and porridge.',
    variants: [
      { id: 'dm-7a', weight_label: '500g', price: 89, original_price: 119, stock: 50 },
      { id: 'dm-7b', weight_label: '1kg', price: 159, original_price: 209, stock: 50 },
    ],
    rating: 4.6, reviewCount: 81,
  },
  {
    id: 'dm-8', name: 'Rajma (Kidney Beans)', tagline: 'Plump red kidney beans',
    category_tag: 'Pulses', category_name: 'Lentils & Beans',
    image_url: '/demo/products/rajma.svg',
    description: 'Large, creamy rajma from tribal farms. Perfect for curries and salads.',
    variants: [
      { id: 'dm-8a', weight_label: '500g', price: 109, original_price: 139, stock: 50 },
      { id: 'dm-8b', weight_label: '1kg', price: 199, original_price: 249, stock: 50 },
    ],
    isBestSeller: true, rating: 4.7, reviewCount: 88,
  },
  {
    id: 'dm-9', name: 'Senagalu (Bengal Gram)', tagline: 'Golden split chickpeas',
    category_tag: 'Pulses', category_name: 'Lentils & Beans',
    image_url: '/demo/products/chickpeas.svg',
    description: 'High-protein senagalu, sun-dried and cleaned. Essential for daily dal.',
    variants: [
      { id: 'dm-9a', weight_label: '500g', price: 79, original_price: 99, stock: 50 },
      { id: 'dm-9b', weight_label: '1kg', price: 139, original_price: 179, stock: 50 },
    ],
    rating: 4.5, reviewCount: 72,
  },
  {
    id: 'dm-10', name: 'Minumulu (Black Gram)', tagline: 'Polished black gram, whole',
    category_tag: 'Pulses', category_name: 'Lentils & Beans',
    image_url: '/demo/products/black-gram.svg',
    description: 'Premium minumulu for traditional South Indian cooking. Rich in protein.',
    variants: [
      { id: 'dm-10a', weight_label: '500g', price: 89, original_price: 109, stock: 50 },
      { id: 'dm-10b', weight_label: '1kg', price: 159, original_price: 199, stock: 50 },
    ],
    rating: 4.4, reviewCount: 58,
  },
  {
    id: 'dm-11', name: 'Kandulu (Red Gram / Pigeon Pea)', tagline: 'Protein-rich toor dal',
    category_tag: 'Pulses', category_name: 'Lentils & Beans',
    image_url: '/demo/products/pigeon-pea.svg',
    description: 'Polished red gram dal, a staple in every South Indian kitchen.',
    variants: [
      { id: 'dm-11a', weight_label: '500g', price: 89, original_price: 109, stock: 50 },
      { id: 'dm-11b', weight_label: '1kg', price: 159, original_price: 199, stock: 50 },
    ],
    rating: 4.5, reviewCount: 67,
  },
  {
    id: 'dm-12', name: 'Nuvvulu (Sesame Oil)', tagline: 'Cold-pressed gingelly oil',
    category_tag: 'Oils', category_name: 'Oils',
    image_url: '/demo/products/sesame-oil.svg',
    description: 'Wood-pressed sesame oil, extracted traditionally. Rich, nutty flavour.',
    variants: [
      { id: 'dm-12a', weight_label: '500ml', price: 199, original_price: 249, stock: 50 },
      { id: 'dm-12b', weight_label: '1L', price: 349, original_price: 449, stock: 50 },
    ],
    isBestSeller: true, rating: 4.8, reviewCount: 103,
  },
  {
    id: 'dm-13', name: 'Kobbari (Coconut Oil)', tagline: 'Pure virgin coconut oil',
    category_tag: 'Oils', category_name: 'Oils',
    image_url: '/demo/products/coconut-oil.svg',
    description: 'Cold-pressed virgin coconut oil from tribal cooperatives. Unrefined, aromatic.',
    variants: [
      { id: 'dm-13a', weight_label: '500ml', price: 229, original_price: 289, stock: 50 },
      { id: 'dm-13b', weight_label: '1L', price: 399, original_price: 499, stock: 50 },
    ],
    rating: 4.6, reviewCount: 94,
  },
  {
    id: 'dm-14', name: 'Verusenaga (Peanut Oil)', tagline: 'Cold-pressed groundnut oil',
    category_tag: 'Oils', category_name: 'Oils',
    image_url: '/demo/products/peanut-oil.svg',
    description: 'Wood-pressed peanut oil. High smoke point, perfect for deep frying.',
    variants: [
      { id: 'dm-14a', weight_label: '500ml', price: 149, original_price: 189, stock: 50 },
      { id: 'dm-14b', weight_label: '1L', price: 269, original_price: 339, stock: 50 },
    ],
    rating: 4.5, reviewCount: 78,
  },
  {
    id: 'dm-15', name: 'Avalu (Mustard)', tagline: 'Whole brown mustard seeds',
    category_tag: 'Spices', category_name: 'Spices',
    image_url: '/demo/products/mustard.svg',
    description: 'Pungent brown mustard seeds, sun-dried and cleaned. Essential for tadka.',
    variants: [
      { id: 'dm-15a', weight_label: '100g', price: 39, original_price: 49, stock: 50 },
      { id: 'dm-15b', weight_label: '250g', price: 79, original_price: 99, stock: 50 },
    ],
    rating: 4.4, reviewCount: 45,
  },
  {
    id: 'dm-16', name: 'Jeelakara (Cumin)', tagline: 'Aromatic whole cumin seeds',
    category_tag: 'Spices', category_name: 'Spices',
    image_url: '/demo/products/cumin.svg',
    description: 'Premium jeelakara from tribal farms. Earthy, warm flavour for every dish.',
    variants: [
      { id: 'dm-16a', weight_label: '100g', price: 49, original_price: 59, stock: 50 },
      { id: 'dm-16b', weight_label: '250g', price: 99, original_price: 129, stock: 50 },
    ],
    rating: 4.6, reviewCount: 82,
  },
  {
    id: 'dm-17', name: 'Saina (Rock Salt)', tagline: 'Himalayan rock salt, hand-mined',
    category_tag: 'Salt', category_name: 'Salt',
    image_url: '/demo/products/rock-salt.svg',
    description: 'Mineral-rich sendha namak. Unrefined, full of natural trace minerals.',
    variants: [
      { id: 'dm-17a', weight_label: '500g', price: 49, original_price: 69, stock: 50 },
      { id: 'dm-17b', weight_label: '1kg', price: 89, original_price: 119, stock: 50 },
    ],
    rating: 4.3, reviewCount: 38,
  },
  {
    id: 'dm-18', name: 'Bellam (Jaggery)', tagline: 'Traditional palm jaggery',
    category_tag: 'Sugar', category_name: 'Sugar',
    image_url: '/demo/products/jaggery.svg',
    description: 'Handcrafted palm jaggery from tribal communities. Rich, caramel sweetness.',
    variants: [
      { id: 'dm-18a', weight_label: '500g', price: 99, original_price: 129, stock: 50 },
      { id: 'dm-18b', weight_label: '1kg', price: 179, original_price: 229, stock: 50 },
    ],
    isBestSeller: true, rating: 4.7, reviewCount: 91,
  },
]

export const demoCombos = [
  {
    _id: 'dm-c1', name: 'Daily Essentials Pack', slug: 'daily-essentials-pack',
    image: '/demo/products/combo-1.svg',
    description: 'Everything you need for a healthy kitchen. [CONTAINS] Wild Honey 250g, Sesame Oil 500ml, Rajma 500g, Turmeric 100g',
    discountPercent: 15, price: 599,
    items: [
      { price: 249, quantity: 1, variant: { price: 249 } },
      { price: 199, quantity: 1, variant: { price: 199 } },
      { price: 109, quantity: 1, variant: { price: 109 } },
      { price: 69, quantity: 1, variant: { price: 69 } },
    ],
  },
  {
    _id: 'dm-c2', name: 'Millet Lover\'s Pack', slug: 'millet-lovers-pack',
    image: '/demo/products/combo-2.svg',
    description: 'Four traditional millets in one box. [CONTAINS] Sorghum 1kg, Foxtail Millet 1kg, Little Millet 1kg, Bengal Gram 500g',
    discountPercent: 20, price: 499,
    items: [
      { price: 159, quantity: 1, variant: { price: 159 } },
      { price: 179, quantity: 1, variant: { price: 179 } },
      { price: 159, quantity: 1, variant: { price: 159 } },
      { price: 79, quantity: 1, variant: { price: 79 } },
    ],
  },
  {
    _id: 'dm-c3', name: 'Spice Box (6 Jars)', slug: 'spice-box-6-jars',
    image: '/demo/products/combo-3.svg',
    description: 'Complete spice set for every dish. [CONTAINS] Black Pepper 100g, Turmeric 100g, Red Chilli 100g, Cumin 100g, Mustard 100g, Rock Salt 500g',
    discountPercent: 18, price: 349,
    items: [
      { price: 89, quantity: 1, variant: { price: 89 } },
      { price: 69, quantity: 1, variant: { price: 69 } },
      { price: 59, quantity: 1, variant: { price: 59 } },
      { price: 49, quantity: 1, variant: { price: 49 } },
      { price: 39, quantity: 1, variant: { price: 39 } },
      { price: 49, quantity: 1, variant: { price: 49 } },
    ],
  },
  {
    _id: 'dm-c4', name: 'Oil & Honey Duo', slug: 'oil-honey-duo',
    image: '/demo/products/combo-2.svg',
    description: 'Two kitchen essentials at a great price. [CONTAINS] Wild Honey 500g, Coconut Oil 500ml',
    discountPercent: 12, price: 599,
    items: [
      { price: 449, quantity: 1, variant: { price: 449 } },
      { price: 229, quantity: 1, variant: { price: 229 } },
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
    description: 'Protein-rich legumes', image_url: '/demo/products/rajma.svg',
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
    id: 'dm-cat-oils', name: 'Oils', slug: 'oils', _id: 'dm-cat-oils',
    description: 'Cold-pressed goodness', image_url: '/demo/products/sesame-oil.svg',
    order: 5, isActive: true,
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

export { DEMO_MODE, demoCategories }
