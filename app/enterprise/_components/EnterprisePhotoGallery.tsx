'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface Photo {
  id: number | string
  photo_url: string
}

interface EnterprisePhotoGalleryProps {
  photos: Photo[]
  restaurantName: string
  perPage?: number
}

function resolveUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function EnterprisePhotoGallery({
  photos,
  restaurantName,
  perPage = 12,
}: EnterprisePhotoGalleryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const totalPages = Math.ceil(photos.length / perPage)
  const start = (currentPage - 1) * perPage
  const visible = photos.slice(start, start + perPage)

  const openLightbox = (localIndex: number) => {
    setLightboxIndex(start + localIndex)
  }

  const closeLightbox = () => setLightboxIndex(null)

  const prevPhoto = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
  }

  const nextPhoto = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % photos.length)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* ── Masonry-style grid ── */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {visible.map((photo, idx) => {
          const url = resolveUrl(photo.photo_url)
          if (!url) return null

          // Vary heights for masonry feel
          const heights = ['aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-[4/3]']
          const heightClass = heights[(start + idx) % heights.length]

          return (
            <div
              key={photo.id}
              className={`relative ${heightClass} w-full rounded-2xl overflow-hidden group cursor-pointer break-inside-avoid mb-3`}
              onClick={() => openLightbox(idx)}
            >
              <Image
                src={url}
                alt={`${restaurantName} - Photo ${start + idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <ZoomIn size={20} className="text-white" />
                </div>
              </div>
              {/* Photo number */}
              <div className="absolute top-2 right-2 bg-secondary/50 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                {start + idx + 1} / {photos.length}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Count ── */}
      <p className="text-center text-sm text-secondary mt-6">
        Showing {start + 1}–{Math.min(start + perPage, photos.length)} of {photos.length} photos
      </p>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                page === currentPage
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-secondary/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition z-10"
            onClick={closeLightbox}
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-4 py-1.5 rounded-full">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Prev */}
          <button
            className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition z-10"
            onClick={(e) => { e.stopPropagation(); prevPhoto() }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <div
            className="relative w-[90vw] h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={resolveUrl(photos[lightboxIndex].photo_url)}
              alt={`${restaurantName} - Photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Next */}
          <button
            className="absolute right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition z-10"
            onClick={(e) => { e.stopPropagation(); nextPhoto() }}
          >
            <ChevronRight size={24} />
          </button>

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
            {photos.slice(
              Math.max(0, lightboxIndex - 3),
              Math.min(photos.length, lightboxIndex + 4)
            ).map((p, i) => {
              const realIdx = Math.max(0, lightboxIndex - 3) + i
              return (
                <div
                  key={p.id}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(realIdx) }}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer transition-all ${
                    realIdx === lightboxIndex
                      ? 'ring-2 ring-orange-500 scale-110'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={resolveUrl(p.photo_url)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}