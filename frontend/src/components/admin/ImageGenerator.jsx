import { useState } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

export default function ImageGenerator({ entity, name, currentImage, currentPublicId, onImageChange, fileInputRef }) {
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!name && entity !== 'banner') return toast.error('Save a name first before generating')
    setGenerating(true)
    try {
      const result = await api.generateImage(entity, name || entity, currentPublicId)
      if (onImageChange) {
        onImageChange(result.url, result.publicId)
      }
      toast.success('Image generated')
    } catch (err) {
      toast.error(err.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef?.current) fileInputRef.current.click()
  }

  const handleDelete = () => {
    if (!currentImage) return
    api.deleteImage(currentImage).catch(() => {})
    if (onImageChange) onImageChange('', '')
    toast.success('Image removed')
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentImage && (
        <button type="button" onClick={handleDelete}
          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition">
          Delete
        </button>
      )}
      <button type="button" onClick={handleGenerate} disabled={generating}
        className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50">
        {generating ? 'Generating...' : currentImage ? 'Regenerate' : 'Generate'}
      </button>
      <button type="button" onClick={handleUploadClick}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
        Upload
      </button>
    </div>
  )
}
