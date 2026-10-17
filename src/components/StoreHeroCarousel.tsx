'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { StoreSettings } from '@/lib/types'

export default function StoreHeroCarousel({ store, productCount }: {
  store: StoreSettings | null
  productCount: number
}) {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!ref.current) return
    setActive(Math.round(ref.current.scrollLeft / ref.current.offsetWidth))
  }

  const goTo = (i: number) => {
    ref.current?.scrollTo({ left: i * (ref.current.offsetWidth), behavior: 'smooth' })
  }

  return (
    <div className="mt-4">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl"
        style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Slide 1: Brand Hero */}
        <div className="min-w-full snap-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8B1A1A] to-[#C0392B]">
          {/* Decorative circle */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-10 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative p-5">
            <div className="flex items-start justify-between mb-4">
              <Image
                src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
                alt="Bolen Katresna"
                width={130}
                height={65}
                className="h-14 w-auto object-contain brightness-0 invert"
                unoptimized
              />
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${
                store?.is_open
                  ? 'bg-green-400/90 text-green-900'
                  : 'bg-red-300/90 text-red-900'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${store?.is_open ? 'bg-green-700' : 'bg-red-700'}`} />
                {store?.is_open ? 'Buka' : 'Tutup'}
              </div>
            </div>

            <p className="text-white font-semibold text-base mb-1">
              {store?.store_name || 'Bolen Katresna'}
            </p>
            <p className="text-white/75 text-xs mb-3">Bolen Pisang Khas Bandung</p>

            <div className="flex items-center gap-1.5 text-white/70 text-xs">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{store?.address || 'Bandung'}</span>
            </div>
          </div>
        </div>

        {/* Slide 2: Stats */}
        <div className="min-w-full snap-center bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="h-1.5 bg-gradient-to-r from-[#8B1A1A] to-[#C0392B]" />
          <div className="p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Info Toko</p>
            <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100">
              <div className="text-center pr-2">
                <p className="text-[#C0392B] font-bold text-2xl">{productCount}</p>
                <p className="text-gray-400 text-xs mt-0.5">Menu</p>
              </div>
              <div className="text-center px-2">
                <p className="text-gray-900 font-bold text-base">Tersedia</p>
                <p className="text-gray-400 text-xs mt-0.5">Pengiriman</p>
              </div>
              <div className="text-center pl-2">
                <p className="text-gray-900 font-bold text-base">{store?.pickup_enabled ? 'Gratis' : '—'}</p>
                <p className="text-gray-400 text-xs mt-0.5">Ambil Sendiri</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2.5">
        {[0, 1].map(i => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-200 ${
              active === i ? 'w-5 h-1.5 bg-[#C0392B]' : 'w-1.5 h-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
