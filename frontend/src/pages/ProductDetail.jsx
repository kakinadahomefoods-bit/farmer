import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const { getProductBySlug } = await import('../lib/productService')
        const data = await getProductBySlug(slug)
        setProduct(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
  if (!product) return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Product not found</div>

  const imgSrc = getImageUrl(product.images?.[0] || product.image_url, settings?.placeholder_image)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">← Back to Products</Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-slate-50">
          <img src={imgSrc} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div>
          {product.category && <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">{product.category}</p>}
          <h1 className="heading-font text-3xl font-extrabold text-slate-900">{product.name}</h1>
          {product.tagline && <p className="mt-2 italic text-emerald-700 font-medium">"{product.tagline}"</p>}
          <div className="mt-4 flex items-end gap-3">
            <span className="heading-font text-3xl font-extrabold text-brand-700">{formatPrice(product.base_price || product.price)}</span>
            {product.original_price > product.price && <span className="heading-font text-lg text-slate-400 line-through">{formatPrice(product.original_price)}</span>}
          </div>
          {product.description && <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>}
          <p className="mt-4 text-sm text-slate-500">+ shipping cost</p>
        </div>
      </div>
    </div>
  )
}
