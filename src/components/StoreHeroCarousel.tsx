'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { Banner } from '@/lib/types'

export default function StoreHeroCarousel({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!ref.current) return
    setActive(Math.round(ref.current.scrollLeft / ref.current.offsetWidth))
  }

  const goTo = (i: number) => {
    ref.current?.scrollTo({ left: i * (ref.current.offsetWidth ?? 0), behavior: 'smooth' })
  }

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % banners.length
        ref.current?.scrollTo({ left: next * (ref.current.offsetWidth ?? 0), behavior: 'smooth' })
        return next
      })
    }, 3500)
    return () => clearInterval(id)
  }, [banners.length])

  if (banners.length === 0) {
    return (
      <div className="mt-4 aspect-video rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400">
        <ImageIcon size={32} />
        <p className="text-sm font-medium">Belum ada flyer</p>
        <p className="text-xs">Upload di Admin → Flyer</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl"
        style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full snap-center relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={banner.image_url}
              alt="Flyer"
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                active === i ? 'w-5 h-1.5 bg-[#C0392B]' : 'w-1.5 h-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
