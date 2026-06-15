'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Loader2, Plus, CheckCircle2, AlertCircle, Images } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('access_token') ?? ''
}

function getRestaurantId(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('restaurant_id') ?? ''
}

interface SliderPhoto {
  id: number
  photo_url: string
  alt: string
}

function resolveUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function HeroSliderPage() {
  const [photos, setPhotos] = useState<SliderPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  function showError(msg: string) {
    setErrorMsg(msg)
    setSuccessMsg('')
    setTimeout(() => setErrorMsg(''), 5000)
  }

  async function loadPhotos() {
    const rid = getRestaurantId()
    if (!rid) { setLoading(false); return }
    try {
        const res = await fetch(
  `${API}/api/v1/photo/?type=restaurant&purpose=slider&object_id=${rid}&page_size=20`,
  { headers: { Authorization: `Bearer ${getToken()}` } }
)
     
      if (res.ok) {
        const data = await res.json()
        const list: SliderPhoto[] = (data.results ?? data ?? []).map((p: any) => ({
          id: p.id,
          photo_url: p.photo_url ?? '',
          alt: p.alt ?? '',
        }))
        setPhotos(list)
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { loadPhotos() }, [])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const rid = getRestaurantId()
    if (!rid) { showError('Restaurant ID not found. Please login again.'); return }

    setUploading(true)
    let successCount = 0

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('type', 'restaurant')      
formData.append('object_id', rid)            
formData.append('purpose', 'slider')


      formData.append('alt', file.name.replace(/\.[^.]+$/, ''))
      formData.append('photo', file)





      try {
        const res = await fetch(`${API}/api/v1/photo/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        })
        if (res.ok) successCount++
      } catch {}
    }

    if (successCount > 0) {
      showSuccess(`✅ ${successCount} photo${successCount > 1 ? 's' : ''} uploaded!`)
      await loadPhotos()
    } else {
      showError('Upload failed. Check file format and try again.')
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this slide photo?')) return
    setDeleting(id)
    try {
      const res = await fetch(`${API}/api/v1/photo/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok || res.status === 204) {
        setPhotos(prev => prev.filter(p => p.id !== id))
        showSuccess('Photo removed')
      } else {
        showError('Failed to remove photo')
      }
    } catch {
      showError('Network error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Images size={22} className="text-orange-500" />
          Hero Slider Photos
        </h1>
        <p className="text-secondary text-sm mt-1">
          Upload photos for your enterprise website hero slider. These appear as a slideshow at the top of your site.
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border bg-green-50 border-green-100 text-green-700">
          <CheckCircle2 size={15} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border bg-red-50 border-red-100 text-red-700">
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-orange-200 rounded-2xl p-10 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleUpload(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-orange-400" />
            <p className="text-sm text-secondary">Uploading photos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Plus size={24} className="text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Click to upload or drag & drop</p>
              <p className="text-sm text-secondary mt-1">PNG, JPG, WEBP · Multiple files allowed</p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium">
              <Upload size={13} /> Choose Photos
            </span>
          </div>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-secondary">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} in slider
          {photos.length === 0 && ' — upload at least 1 to show slider'}
        </p>
        {photos.length > 0 && (
          <p className="text-xs text-secondary">Recommended: 2–5 photos · Landscape · Min 1200×600px</p>
        )}
      </div>

      {/* Photos grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-orange-400" />
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
          <Images size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-secondary">No slider photos yet</p>
          <p className="text-gray-300 text-xs mt-1">Upload photos above to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50"
              style={{ aspectRatio: '16/9' }}
            >
              <Image
                src={resolveUrl(photo.photo_url)}
                alt={photo.alt || `Slide ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/50 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleting === photo.id}
                  className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                  {deleting === photo.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />}
                  Remove
                </button>
              </div>
              {/* Slide badge */}
              <div className="absolute top-2 left-2 bg-secondary/50 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
                Slide {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-2xl border border-primary p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">Tips for best results</p>
        <ul className="text-xs text-primary space-y-1.5">
          <li>• Use <strong>landscape photos</strong> (wider than tall) for best display</li>
          <li>• Recommended size: <strong>1920×1080px</strong> or larger</li>
          <li>• Upload <strong>2–5 photos</strong> for an engaging slideshow</li>
          <li>• Food photos, interior shots, and ambiance photos work best</li>
          <li>• Slides auto-rotate every <strong>5 seconds</strong></li>
        </ul>
      </div>
    </div>
  )
}