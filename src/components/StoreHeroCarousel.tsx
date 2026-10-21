'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, Truck } from 'lucide-react'
import { Banner } from '@/lib/types'

export default function StoreHeroCarousel({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0)

  const goTo = (i: number) => setActive(i)

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(id)
  }, [banners.length])

  return (
    <>
      {/* Branded hero — always on top */}
      <div className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-8 shadow-float">
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

      {/* Flyer carousel — below the hero, only when flyers exist */}
      {banners.length > 0 && (
        <div className="mt-3">
          <div className="relative overflow-hidden rounded-2xl border border-[#f0e8dc] bg-brand-light">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="relative min-w-full aspect-[5/2]">
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
          </div>

          {banners.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Flyer ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    active === i ? 'w-5 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
