'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useState, useEffect } from 'react'

export default function Header() {
  const totalItems = useCartStore(s => s.totalItems())
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const count = mounted ? totalItems : 0

  return (
    <header className="sticky top-0 z-50 bg-[#FFF8F0]/95 backdrop-blur-sm border-b border-[#f0e8dc]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="https://lh3.googleusercontent.com/d/1TpFd2rJxeYrmtmyjl6L-6cQrX9sQI1fi"
            alt="Bolen Katresna"
            width={120}
            height={64}
            className="h-10 w-auto object-contain"
            unoptimized
          />
        </Link>

        <Link
          href="/cart"
          className="relative flex items-center gap-1.5 bg-white hover:bg-brand-light/50 border border-[#f0e8dc] text-gray-700 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors shadow-soft active:scale-[0.97]"
        >
          <ShoppingCart size={16} className={count > 0 ? 'text-brand' : 'text-gray-500'} />
          <span>Keranjang</span>
          {count > 0 && (
            <span className="bg-brand text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-bold shadow-sm shadow-brand/30">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
