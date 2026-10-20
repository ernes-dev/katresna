'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Truck } from 'lucide-react'
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
      <div className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-8 shadow-float">
        {/* Decorative layers */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-sm" />
        <div className="pointer-events-none absolute right-10 top-16 h-24 w-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -left-8 -bottom-10 h-36 w-36 rounded-full bg-black/10 blur-sm" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Sparkles size={12} /> Dipanggang segar tiap hari
          </span>
          <h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-white">
            Bolen Katresna
          </h1>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/80">
            Bolen premium khas Bandung — lembut, renyah, isian melimpah. Pesan sekarang, kami antar.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Truck size={13} /> Siap diantar
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              🎁 Bisa PO partai besar
            </span>
          </div>
        </div>
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
          <div key={banner.id} className="min-w-full snap-center relative h-44 rounded-2xl overflow-hidden bg-gray-100">
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
