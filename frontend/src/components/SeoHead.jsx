import { useEffect } from 'react'

export default function SeoHead({ title, description, keywords, ogImage, canonical, schema }) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title ? `${title} | HAiFarmer` : 'HAiFarmer - Fresh Natural Products from Local Farmers'
    let metaTags = []
    let linkTags = []
    let scriptTags = []

    const setMeta = (name, content, property) => {
      if (!content) return
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (property) el.setAttribute('property', property)
        else el.setAttribute('name', name)
        document.head.appendChild(el)
        metaTags.push(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description || 'Fresh, natural products directly from farmers. Rainwater-fed, minimal pollution, 100% natural.')
    if (keywords) setMeta('keywords', keywords)
    setMeta('og:title', title || 'HAiFarmer', true)
    setMeta('og:description', description || 'Fresh, natural products directly from farmers.', true)
    setMeta('og:image', ogImage || 'https://haifarmer.com/og-image.jpg', true)
    setMeta('og:type', 'website', true)
    setMeta('og:url', window.location.href, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title || 'HAiFarmer', true)
    setMeta('twitter:description', description || 'Fresh, natural products directly from farmers.', true)
    setMeta('twitter:image', ogImage || 'https://haifarmer.com/og-image.jpg', true)

    if (canonical) {
      const selector = 'link[rel="canonical"]'
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', 'canonical')
        document.head.appendChild(el)
        linkTags.push(el)
      }
      el.setAttribute('href', canonical)
    }

    if (schema) {
      const oldScript = document.getElementById('json-ld-schema')
      if (oldScript) oldScript.remove()
      const script = document.createElement('script')
      script.id = 'json-ld-schema'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
      scriptTags.push(script)
    }

    return () => {
      document.title = prevTitle
      metaTags.forEach(el => el.remove())
      linkTags.forEach(el => el.remove())
      scriptTags.forEach(el => el.remove())
    }
  }, [title, description, keywords, ogImage, canonical, schema])

  return null
}