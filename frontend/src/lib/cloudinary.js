export function cloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) return url

  const { width, height, quality = 'auto', format = 'auto', crop = 'limit' } = options
  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  const transforms = []
  if (format) transforms.push(`f_${format}`)
  if (quality) transforms.push(`q_${quality}`)
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (crop) transforms.push(`c_${crop}`)

  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`
}
