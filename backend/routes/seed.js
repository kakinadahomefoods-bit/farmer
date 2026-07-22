import express from 'express'
import User from '../models/User.js'
import SiteSetting from '../models/SiteSetting.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import Bundle from '../models/Bundle.js'
import { ORGANIC_CATEGORIES, ORGANIC_PRODUCTS, ORGANIC_COMBOS } from '../data/organic-products.js'

const router = express.Router()

const CATEGORIES = [
  { name: 'Natural Sweeteners', slug: 'natural-sweeteners', description: 'Pure forest honey, jaggery & natural sweeteners直接从 tribal forests', order: 1 },
  { name: 'Lentils & Beans', slug: 'lentils-beans', description: 'Traditional protein-rich lentils and beans from tribal farms', order: 2 },
  { name: 'Spices & Seasonings', slug: 'spices-seasonings', description: 'Authentic tribal spices including karam, pasupu, and masalu', order: 3 },
  { name: 'Millets', slug: 'millets', description: 'Rainwater-fed traditional millets - chiru dhanyalu', order: 4 },
  { name: 'Salt & Essentials', slug: 'salt-essentials', description: 'Pure rock salt and daily kitchen essentials', order: 5 },
]

const PRODUCTS = [
  {
    name: 'Wild Honey',
    slug: 'wild-honey',
    tagline: 'Pure forest honey directly from tribal beekeepers',
    description: 'Pure, unprocessed wild honey sourced directly from tribal forest beekeepers. Rich in antioxidants, naturally sweet, and packed with the goodness of native flora. No added sugar, no adulteration — just pure nature.',
    nutrition: 'Rich in antioxidants, natural enzymes, vitamins B and C.天然的 antibacterial properties.',
    categoryName: 'Natural Sweeteners',
    basePrice: 1199,
    discountPercent: 0,
    isFeatured: true,
    isNewArrival: true,
    displayOrder: 1,
    variants: [
      { name: '1kg Jar', weightLabel: '1kg', price: 1199, stock: 50, unit: 'kg' },
      { name: '500g Jar', weightLabel: '500g', price: 699, stock: 50, unit: 'kg' },
      { name: '250g Jar', weightLabel: '250g', price: 399, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Brown Sugar',
    slug: 'brown-sugar',
    tagline: 'Unrefined cane sweetness from tribal groves',
    description: 'Traditional unrefined brown sugar made from sugarcane juice. Naturally rich in molasses, minerals, and trace elements. A healthier alternative to white sugar with a rich caramel flavor.',
    categoryName: 'Natural Sweeteners',
    basePrice: 175,
    discountPercent: 0,
    isNewArrival: true,
    displayOrder: 2,
    variants: [
      { name: '500g Pack', weightLabel: '500g', price: 175, stock: 50, unit: 'kg' },
      { name: '1kg Pack', weightLabel: '1kg', price: 299, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Pink Salt',
    slug: 'pink-salt',
    tagline: 'Pure rock salt from mineral-rich Himalayan ranges',
    description: 'Natural pink salt rich in essential minerals and trace elements. Unprocessed, pure, and free from additives. Perfect for daily cooking and seasoning.',
    categoryName: 'Salt & Essentials',
    basePrice: 120,
    discountPercent: 0,
    displayOrder: 3,
    variants: [
      { name: '500g Pack', weightLabel: '500g', price: 120, stock: 100, unit: 'kg' },
      { name: '1kg Pack', weightLabel: '1kg', price: 199, stock: 100, unit: 'kg' },
    ],
  },
  {
    name: 'Alasandhalu — Black Chickpeas',
    slug: 'alasandhalu-black-chickpeas',
    tagline: 'Protein-rich traditional black chickpeas',
    description: 'Naturally grown black chickpeas from tribal farms. Rich in protein, fiber, and essential minerals. Rainwater-fed, pesticide-free, and full of traditional goodness.',
    nutrition: 'High protein (19g/100g), high fiber, iron, folate',
    categoryName: 'Lentils & Beans',
    basePrice: 279,
    discountPercent: 0,
    isFeatured: true,
    displayOrder: 4,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 279, stock: 100, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 149, stock: 100, unit: 'kg' },
    ],
  },
  {
    name: 'Adavi Nalla Bobbarlu — Black Eyed Peas',
    slug: 'adavi-nalla-bobbarlu',
    tagline: 'Forest-grown black eyed peas',
    description: 'Traditional forest-grown black eyed peas, cultivated by tribal farmers using age-old methods. Rich in protein, fiber, and essential nutrients.',
    categoryName: 'Lentils & Beans',
    basePrice: 279,
    discountPercent: 0,
    displayOrder: 5,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 279, stock: 100, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 149, stock: 100, unit: 'kg' },
    ],
  },
  {
    name: 'Red Rajma — Red Kidney Beans',
    slug: 'red-rajma',
    tagline: 'Premium red kidney beans from tribal highlands',
    description: 'Naturally cultivated red kidney beans from tribal highlands. Grown in mineral-rich soil, rainwater-fed, and sun-dried traditionally. Perfect for hearty curries.',
    categoryName: 'Lentils & Beans',
    basePrice: 279,
    discountPercent: 0,
    displayOrder: 6,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 279, stock: 100, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 149, stock: 100, unit: 'kg' },
    ],
  },
  {
    name: 'White Rajma — White Kidney Beans',
    slug: 'white-rajma',
    tagline: 'Creamy white kidney beans, naturally grown',
    description: 'Premium white kidney beans from tribal farms. Naturally grown, pesticide-free, and full of traditional flavor. Perfect for light curries and salads.',
    categoryName: 'Lentils & Beans',
    basePrice: 279,
    discountPercent: 0,
    displayOrder: 7,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 279, stock: 100, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 149, stock: 100, unit: 'kg' },
    ],
  },
  {
    name: 'Nattu Pesalu — Green Gram',
    slug: 'nattu-pesalu-green-gram',
    tagline: 'Traditional green gram from indigenous farms',
    description: 'Native green gram cultivated by tribal farmers using traditional methods. Rich in protein, easy to digest, and perfect for daily cooking.',
    categoryName: 'Lentils & Beans',
    basePrice: 249,
    discountPercent: 0,
    displayOrder: 8,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 249, stock: 100, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 139, stock: 100, unit: 'kg' },
    ],
  },
  {
    name: 'Konda Kandhi Pappu — Pigeon Pea',
    slug: 'konda-kandhi-pappu',
    tagline: 'Forest-grown pigeon pea / tur dal',
    description: 'Premium pigeon pea (tur dal) sourced from tribal forest farms. Naturally grown, rich in protein, and a staple of traditional Andhra cuisine.',
    categoryName: 'Lentils & Beans',
    basePrice: 289,
    discountPercent: 0,
    displayOrder: 9,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 289, stock: 100, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 159, stock: 100, unit: 'kg' },
    ],
  },
  {
    name: 'Forest Tamarind — Chintapandu',
    slug: 'forest-tamarind',
    tagline: 'Wild tamarind from deep forests',
    description: 'Wild forest tamarind sourced directly from tribal gatherers. Naturally sun-dried, no preservatives, rich in tangy flavor. Perfect for traditional cooking.',
    categoryName: 'Spices & Seasonings',
    basePrice: 289,
    discountPercent: 0,
    displayOrder: 10,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 289, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 159, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Agency Karam — Red Chili Powder',
    slug: 'agency-karam',
    tagline: 'Authentic Agency red chili from tribal regions',
    description: 'Authentic Agency red chili powder, sourced directly from tribal farmers in the Agency areas. Known for its vibrant color, moderate heat, and distinct aroma. Naturally sun-dried and stone-ground.',
    categoryName: 'Spices & Seasonings',
    basePrice: 399,
    discountPercent: 0,
    isFeatured: true,
    isNewArrival: true,
    displayOrder: 11,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 399, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 219, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Tribal Pasupu — Turmeric Powder',
    slug: 'tribal-pasupu',
    tagline: 'Pure turmeric from tribal forest farms',
    description: 'Pure turmeric powder sourced from tribal farmers who cultivate it using traditional methods. Rich in curcumin, naturally vibrant color, and distinctive aroma. No artificial colors or additives.',
    nutrition: 'High curcumin content (3-5%), natural anti-inflammatory, rich in iron and manganese',
    categoryName: 'Spices & Seasonings',
    basePrice: 399,
    discountPercent: 0,
    isFeatured: true,
    isNewArrival: true,
    displayOrder: 12,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 399, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 219, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Avalu — Mustard Seeds',
    slug: 'avalu-mustard-seeds',
    tagline: 'Traditional mustard seeds from tribal farms',
    description: 'Naturally grown mustard seeds from tribal farms. Rich, pungent flavor essential for traditional Indian cooking. Pesticide-free and sun-dried.',
    categoryName: 'Spices & Seasonings',
    basePrice: 180,
    discountPercent: 0,
    displayOrder: 13,
    variants: [
      { name: '500g Pack', weightLabel: '500g', price: 180, stock: 50, unit: 'kg' },
      { name: '250g Pack', weightLabel: '250g', price: 99, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Miryalu — Black Pepper',
    slug: 'miryalu-black-pepper',
    tagline: 'Aromatic black pepper from tribal highlands',
    description: 'Premium black pepper sourced from tribal highlands. Known for its sharp aroma and intense heat. Naturally sun-dried and hand-sorted for quality.',
    categoryName: 'Spices & Seasonings',
    basePrice: 349,
    discountPercent: 0,
    displayOrder: 14,
    variants: [
      { name: '500g Pack', weightLabel: '500g', price: 349, stock: 30, unit: 'kg' },
      { name: '250g Pack', weightLabel: '250g', price: 189, stock: 30, unit: 'kg' },
    ],
  },
  {
    name: 'Nalla Minumulu — Black Gram (Urad Dal)',
    slug: 'nalla-minumulu-urad-dal',
    tagline: 'Traditional black gram from tribal farms',
    description: 'Naturally grown black gram (urad dal) from tribal farmers. Rich in protein and iron, essential for daily nutrition. Pesticide-free and traditionally processed.',
    categoryName: 'Lentils & Beans',
    basePrice: 279,
    discountPercent: 0,
    displayOrder: 15,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 279, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 149, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Tella Bobbarlu — White Peas',
    slug: 'tella-bobbarlu-white-peas',
    tagline: 'Traditional white peas from indigenous farms',
    description: 'Naturally grown white peas cultivated by tribal farmers. Rich in protein, fiber, and essential minerals. Perfect for curries and snacks.',
    categoryName: 'Lentils & Beans',
    basePrice: 259,
    discountPercent: 0,
    displayOrder: 16,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 259, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 139, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Arikalu — Ragi (Finger Millet)',
    slug: 'arikalu-ragi-finger-millet',
    tagline: 'Nutrient-rich finger millet from tribal hills',
    description: 'Traditional finger millet (ragi) grown by tribal farmers in hill regions. Rich in calcium, iron, and fiber. Naturally drought-resistant and pesticide-free.',
    nutrition: 'Highest calcium content among all grains (344mg/100g), rich in iron and fiber',
    categoryName: 'Millets',
    basePrice: 229,
    discountPercent: 0,
    isNewArrival: true,
    displayOrder: 17,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 229, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 129, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Samalu — Little Millet',
    slug: 'samalu-little-millet',
    tagline: 'Light and nutritious little millet',
    description: 'Traditional little millet (samalu) from tribal farms. Naturally light, easy to digest, and rich in fiber. A perfect rice alternative for daily meals.',
    categoryName: 'Millets',
    basePrice: 249,
    discountPercent: 0,
    displayOrder: 18,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 249, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 139, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Korralu — Foxtail Millet',
    slug: 'korralu-foxtail-millet',
    tagline: 'Traditional foxtail millet from tribal farms',
    description: 'Authentic foxtail millet (korralu) cultivated by tribal farmers. Rich in complex carbohydrates, fiber, and essential minerals. Low glycemic index, perfect for healthy diets.',
    categoryName: 'Millets',
    basePrice: 249,
    discountPercent: 0,
    displayOrder: 19,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 249, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 139, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Tella Jonnalu — White Sorghum (Jowar)',
    slug: 'tella-jonnalu-white-sorghum',
    tagline: 'Traditional white sorghum from rainfed farms',
    description: 'Premium white sorghum (jowar) grown by tribal farmers using traditional rainfed methods. Rich in protein, fiber, and gluten-free. Staple millet of tribal cuisine.',
    categoryName: 'Millets',
    basePrice: 219,
    discountPercent: 0,
    displayOrder: 20,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 219, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 119, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Erra Jonnalu — Red Sorghum',
    slug: 'erra-jonnalu-red-sorghum',
    tagline: 'Traditional red sorghum rich in antioxidants',
    description: 'Traditional red sorghum (erra jonnalu) from tribal farms. Rich in antioxidants and anthocyanins, giving it a distinctive red color. Gluten-free and nutrient-dense.',
    categoryName: 'Millets',
    basePrice: 239,
    discountPercent: 0,
    displayOrder: 21,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 239, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 129, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Sajjalu — Pearl Millet (Bajra)',
    slug: 'sajjalu-pearl-millet-bajra',
    tagline: 'Traditional pearl millet from tribal drylands',
    description: 'Authentic pearl millet (bajra/sajjalu) cultivated by tribal communities in dryland regions. Rich in iron, magnesium, and fiber. A traditional supergrain.',
    categoryName: 'Millets',
    basePrice: 219,
    discountPercent: 0,
    displayOrder: 22,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 219, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 119, stock: 50, unit: 'kg' },
    ],
  },
  {
    name: 'Sprouted Ragi — Mola Arikalu',
    slug: 'sprouted-ragi-mola-arikalu',
    tagline: 'Sprouted and natural — maximum nutrition',
    description: 'Traditionally sprouted and sun-dried ragi (finger millet). Sprouting enhances nutrient absorption and digestibility. Rich in calcium, iron, and natural enzymes.',
    categoryName: 'Millets',
    basePrice: 249,
    discountPercent: 0,
    isNewArrival: true,
    displayOrder: 23,
    variants: [
      { name: '1kg Pack', weightLabel: '1kg', price: 249, stock: 50, unit: 'kg' },
      { name: '500g Pack', weightLabel: '500g', price: 139, stock: 50, unit: 'kg' },
    ],
  },
]

const COMBOS = [
  {
    name: 'Healthy Family Box',
    description: 'The complete tribal nutrition box for your entire family. 21 essential products covering everything from natural sweeteners to protein-rich lentils and traditional millets. Nothing artificial, everything pure.',
    isCombo: true,
    discountPercent: 6,
    itemSlugs: [
      { slug: 'wild-honey', variantName: '500g Jar', quantity: 1 },
      { slug: 'brown-sugar', variantName: '500g Pack', quantity: 1 },
      { slug: 'alasandhalu-black-chickpeas', variantName: '500g Pack', quantity: 1 },
      { slug: 'adavi-nalla-bobbarlu', variantName: '500g Pack', quantity: 1 },
      { slug: 'red-rajma', variantName: '500g Pack', quantity: 1 },
      { slug: 'white-rajma', variantName: '500g Pack', quantity: 1 },
      { slug: 'nattu-pesalu-green-gram', variantName: '500g Pack', quantity: 1 },
      { slug: 'konda-kandhi-pappu', variantName: '500g Pack', quantity: 1 },
      { slug: 'forest-tamarind', variantName: '500g Pack', quantity: 1 },
      { slug: 'agency-karam', variantName: '500g Pack', quantity: 1 },
      { slug: 'tribal-pasupu', variantName: '500g Pack', quantity: 1 },
      { slug: 'avalu-mustard-seeds', variantName: '250g Pack', quantity: 1 },
      { slug: 'miryalu-black-pepper', variantName: '250g Pack', quantity: 1 },
      { slug: 'nalla-minumulu-urad-dal', variantName: '500g Pack', quantity: 1 },
      { slug: 'tella-bobbarlu-white-peas', variantName: '500g Pack', quantity: 1 },
      { slug: 'arikalu-ragi-finger-millet', variantName: '500g Pack', quantity: 1 },
      { slug: 'samalu-little-millet', variantName: '500g Pack', quantity: 1 },
      { slug: 'korralu-foxtail-millet', variantName: '500g Pack', quantity: 1 },
      { slug: 'tella-jonnalu-white-sorghum', variantName: '500g Pack', quantity: 1 },
      { slug: 'erra-jonnalu-red-sorghum', variantName: '500g Pack', quantity: 1 },
      { slug: 'sprouted-ragi-mola-arikalu', variantName: '500g Pack', quantity: 1 },
    ],
  },
  {
    name: 'Kitchen Essentials',
    description: '7 essential spices and seasonings every kitchen needs. From tribal turmeric to agency red chili, forest tamarind to pure pink salt. The foundation of authentic tribal cuisine.',
    isCombo: true,
    discountPercent: 5,
    itemSlugs: [
      { slug: 'agency-karam', variantName: '500g Pack', quantity: 1 },
      { slug: 'tribal-pasupu', variantName: '500g Pack', quantity: 1 },
      { slug: 'forest-tamarind', variantName: '500g Pack', quantity: 1 },
      { slug: 'pink-salt', variantName: '500g Pack', quantity: 1 },
      { slug: 'brown-sugar', variantName: '500g Pack', quantity: 1 },
      { slug: 'avalu-mustard-seeds', variantName: '250g Pack', quantity: 1 },
      { slug: 'miryalu-black-pepper', variantName: '250g Pack', quantity: 1 },
    ],
  },
  {
    name: 'Natural Protein Box',
    description: '7 protein-rich lentils and beans for your daily nutrition. Perfect for vegetarians and health-conscious families. All naturally grown and pesticide-free.',
    isCombo: true,
    discountPercent: 5,
    itemSlugs: [
      { slug: 'alasandhalu-black-chickpeas', variantName: '1kg Pack', quantity: 1 },
      { slug: 'adavi-nalla-bobbarlu', variantName: '1kg Pack', quantity: 1 },
      { slug: 'red-rajma', variantName: '1kg Pack', quantity: 1 },
      { slug: 'white-rajma', variantName: '1kg Pack', quantity: 1 },
      { slug: 'nattu-pesalu-green-gram', variantName: '1kg Pack', quantity: 1 },
      { slug: 'konda-kandhi-pappu', variantName: '1kg Pack', quantity: 1 },
      { slug: 'sprouted-ragi-mola-arikalu', variantName: '1kg Pack', quantity: 1 },
    ],
  },
  {
    name: 'Tribal Millet Box',
    description: '7 traditional millets for a wholesome, gluten-free diet. A complete millet collection straight from tribal farms. Rainwater-fed, chemical-free, and full of traditional wisdom.',
    isCombo: true,
    discountPercent: 5,
    itemSlugs: [
      { slug: 'arikalu-ragi-finger-millet', variantName: '1kg Pack', quantity: 1 },
      { slug: 'samalu-little-millet', variantName: '1kg Pack', quantity: 1 },
      { slug: 'korralu-foxtail-millet', variantName: '1kg Pack', quantity: 1 },
      { slug: 'tella-jonnalu-white-sorghum', variantName: '1kg Pack', quantity: 1 },
      { slug: 'erra-jonnalu-red-sorghum', variantName: '1kg Pack', quantity: 1 },
      { slug: 'sajjalu-pearl-millet-bajra', variantName: '1kg Pack', quantity: 1 },
      { slug: 'nattu-pesalu-green-gram', variantName: '1kg Pack', quantity: 1 },
    ],
  },
]

router.post('/seed', async (req, res) => {
  try {
    const { secret } = req.body
    if (secret !== 'haifarmer-seed-2026') return res.status(401).json({ error: 'Invalid secret' })

    const results = []

    const adminExists = await User.findOne({ role: 'admin' })
    if (adminExists) {
      adminExists.email = 'kakinadahomefoods@gmail.com'
      adminExists.password = 'admin123'
      adminExists.fullName = 'HAiFarmer Admin'
      await adminExists.save()
      results.push('Admin credentials updated: kakinadahomefoods@gmail.com / admin123')
    } else {
      await User.create({ email: 'kakinadahomefoods@gmail.com', password: 'admin123', fullName: 'HAiFarmer Admin', role: 'admin' })
      results.push('Admin user created: kakinadahomefoods@gmail.com / admin123')
    }

    const settingsExists = await SiteSetting.findOne()
    if (!settingsExists) {
      await SiteSetting.create({})
      results.push('Default settings created')
    } else {
      results.push('Settings already exist')
    }

    for (const cat of CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $setOnInsert: cat },
        { upsert: true, new: true }
      )
    }
    results.push(`${CATEGORIES.length} categories ready`)

    const allProducts = []
    for (const prod of PRODUCTS) {
      const cat = await Category.findOne({ slug: prod.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
      const existing = await Product.findOne({ slug: prod.slug })
      if (existing) {
        await Product.findOneAndUpdate({ slug: prod.slug }, {
          ...prod,
          category: cat ? cat._id : undefined,
          categoryName: cat ? undefined : prod.categoryName,
        })
        allProducts.push(existing)
      } else {
        const created = await Product.create({
          ...prod,
          category: cat ? cat._id : undefined,
          categoryName: cat ? undefined : prod.categoryName,
        })
        allProducts.push(created)
      }
    }
    results.push(`${PRODUCTS.length} products ready`)

    for (const combo of COMBOS) {
      await Bundle.deleteMany({ name: combo.name })

      const items = []
      for (const item of combo.itemSlugs) {
        const product = await Product.findOne({ slug: item.slug })
        if (product) {
          const variant = product.variants.find(v => v.name === item.variantName)
          items.push({
            product: product._id,
            variantId: variant ? variant._id : undefined,
            variantName: item.variantName,
            variantWeight: variant ? variant.weightLabel : '',
            quantity: item.quantity,
            price: variant ? variant.price : product.basePrice,
          })
        }
      }

      if (items.length > 0) {
        await Bundle.create({
          name: combo.name,
          description: combo.description,
          isCombo: combo.isCombo,
          discountPercent: combo.discountPercent,
          items,
        })
      }
    }
    results.push(`${COMBOS.length} combo bundles ready`)

    // ===== Organic India-style Products =====
    for (const cat of ORGANIC_CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $setOnInsert: cat },
        { upsert: true, new: true }
      )
    }
    results.push(`${ORGANIC_CATEGORIES.length} organic categories ready`)

    for (const prod of ORGANIC_PRODUCTS) {
      const catSlug = prod.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const cat = await Category.findOne({ slug: catSlug })
      const existing = await Product.findOne({ slug: prod.slug })
      if (existing) {
        await Product.findOneAndUpdate({ slug: prod.slug }, {
          ...prod,
          category: cat ? cat._id : undefined,
          categoryName: cat ? undefined : prod.categoryName,
        })
      } else {
        await Product.create({
          ...prod,
          category: cat ? cat._id : undefined,
          categoryName: cat ? undefined : prod.categoryName,
        })
      }
    }
    results.push(`${ORGANIC_PRODUCTS.length} organic products ready`)

    for (const combo of ORGANIC_COMBOS) {
      await Bundle.deleteMany({ name: combo.name })

      const items = []
      for (const item of combo.itemSlugs) {
        const product = await Product.findOne({ slug: item.slug })
        if (product) {
          const variant = product.variants.find(v => v.name === item.variantName)
          items.push({
            product: product._id,
            variantId: variant ? variant._id : undefined,
            variantName: item.variantName,
            variantWeight: variant ? variant.weightLabel : '',
            quantity: item.quantity,
            price: variant ? variant.price : product.basePrice,
          })
        }
      }

      if (items.length > 0) {
        await Bundle.create({
          name: combo.name,
          description: combo.description,
          isCombo: combo.isCombo,
          discountPercent: combo.discountPercent,
          items,
        })
      }
    }
    results.push(`${ORGANIC_COMBOS.length} organic combos ready`)

    res.json({ message: results.join(' | ') })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
