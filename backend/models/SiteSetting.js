import mongoose from 'mongoose'

const siteSettingSchema = new mongoose.Schema({
  // General
  storeName: { type: String, default: 'HAiFarmer' },
  tagline: { type: String, default: 'Fresh & Natural Products' },
  logo: String,
  favicon: String,
  logoPublicId: String,
  faviconPublicId: String,
  currency: { type: String, default: 'INR' },
  gst: String,
  tax: { type: Number, default: 0 },

  // Contact
  phone: { type: String, default: '9709704563' },
  email: String,
  whatsapp: { type: String, default: '9709704563' },
  address: String,
  googleMapsUrl: String,
  businessHours: String,

  // Delivery
  freeDeliveryMin: { type: Number, default: 1499 },
  deliveryCharge: { type: Number, default: 0 },
  deliveryMessage: { type: String, default: 'Free delivery on orders above ₹1,499' },
  expressDelivery: { type: Boolean, default: false },

  // Payment
  paymentMethod: { type: String, enum: ['razorpay', 'whatsapp', 'both'], default: 'both' },
  razorpayKeyId: { type: String, default: 'rzp_live_SeagFUXcQMCgdT' },
  razorpayKeySecret: String,

  // Header
  headerText1: { type: String, default: 'Free delivery over ₹1499' },
  headerText2: String,
  headerText3: String,

  // SEO
  seo: {
    metaTitle: { type: String, default: 'HAiFarmer - Fresh Natural Products from Local Farmers' },
    metaDescription: { type: String, default: 'Fresh, natural products directly from farmers. Rainwater-fed, minimal pollution, 100% natural.' },
    keywords: [String],
    canonicalUrl: { type: String, default: 'https://haifarmer.com' },
    googleSearchConsoleVerification: String,
    googleAnalyticsId: { type: String, default: 'G-7ZY04PD9S0' },
    googleTagManagerId: String,
    bingWebmasterVerification: String,
    facebookPixelId: { type: String, default: '1561926718988876' },
  },

  // Footer
  footer: {
    companyName: { type: String, default: 'HAiFarmer' },
    aboutText: String,
    privacyPolicyUrl: String,
    refundPolicyUrl: String,
    shippingPolicyUrl: String,
    termsUrl: String,
    faqUrl: String,
    contactUrl: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
  },

  // Theme
  theme: {
    primaryColor: { type: String, default: '#6ba819' },
    secondaryColor: { type: String, default: '#53860f' },
    accentColor: { type: String, default: '#3f650b' },
  },

  // Slider settings
  sliderSettings: {
    mode: { type: String, enum: ['manual', 'automatic', 'both'], default: 'both' },
    autoPlay: { type: Boolean, default: true },
    loop: { type: Boolean, default: true },
    pauseOnHover: { type: Boolean, default: true },
    transitionSpeed: { type: Number, default: 2100 },
    showArrows: { type: Boolean, default: true },
    showDots: { type: Boolean, default: true },
  },
}, { timestamps: true })

export default mongoose.model('SiteSetting', siteSettingSchema)
