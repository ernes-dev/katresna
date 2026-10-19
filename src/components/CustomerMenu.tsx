'use client'
import { useState } from 'react'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Product, Category } from '@/lib/types'
import ProductCard from './ProductCard'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function CustomerMenu({
  products,
  categories,
  storeWhatsapp,
}: {
  products: Product[]
  categories: Category[]
  storeWhatsapp?: string
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { items, totalPrice, totalItems } = useCartStore()

  const CATEGORY_ORDER = ['box', 'bolen', 'promo', 'beverages']
  const sortedCategories = [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.name.toLowerCase())
    const bi = CATEGORY_ORDER.indexOf(b.name.toLowerCase())
    const av = ai === -1 ? 99 : ai
    const bv = bi === -1 ? 99 : bi
    return av - bv
  })

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_id === activeCategory)

  const countForCategory = (catId: string) =>
    products.filter(p => p.category_id === catId).length

  const groupedProducts = activeCategory === 'all'
    ? sortedCategories
        .map(cat => ({
          cat,
          items: products.filter(p => p.category_id === cat.id),
        }))
        .filter(g => g.items.length > 0)
    : null

  const poBulkWA = storeWhatsapp
    ? `https://wa.me/${storeWhatsapp}?text=${encodeURIComponent('Halo Bolen Katresna, saya ingin memesan partai besar / PO reseller. Mohon info lebih lanjut.')}`
    : undefined

  return (
    <div className="mt-5">
      {/* PO Bulk Order Banner */}
      {poBulkWA && (
        <a
          href={poBulkWA}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-[#25D366] text-white rounded-2xl px-4 py-3 mb-4 shadow-sm hover:opacity-90 transition"
        >
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-8 h-8 flex-shrink-0 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div>
              <p className="font-bold text-sm">PO Untuk Acara / Partai Besar</p>
              <p className="text-xs text-white/80 mt-0.5">Hubungi admin</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap">
            Chat WA →
          </div>
        </a>
      )}

      {/* Section title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900 text-base">Menu</h2>
        <span className="text-xs text-gray-400">{products.length} item tersedia</span>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {sortedCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 border ${
              activeCategory === cat.id
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40'
            }`}
          >
            {cat.name} ({countForCategory(cat.id)})
          </button>
        ))}
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 border ${
            activeCategory === 'all'
              ? 'bg-brand text-white border-brand shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand/40'
          }`}
        >
          Semua ({products.length})
        </button>
      </div>

      {/* Products — grouped when Semua, flat when category selected */}
      {activeCategory === 'all' && groupedProducts ? (
        groupedProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🍱</p>
            <p className="font-medium text-gray-500">Belum ada produk</p>
          </div>
        ) : (
          <div className="mt-4 pb-4 space-y-6">
            {groupedProducts.map(({ cat, items }) => (
              <div key={cat.id}>
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-2 mb-3 group"
                >
                  <h3 className="font-bold text-gray-800 text-sm">{cat.name}</h3>
                  <span className="text-xs text-gray-400">({items.length})</span>
                  <span className="text-xs text-brand font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Lihat semua</span>
                </button>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🍱</p>
          <p className="font-medium text-gray-500">Belum ada produk di kategori ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 pb-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Floating cart bar - GrabMart style */}
      {totalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
          <div className="max-w-5xl mx-auto pointer-events-auto">
            <Link
              href="/cart"
              className="flex items-center justify-between bg-brand text-white rounded-2xl px-5 py-4 shadow-2xl shadow-brand/40 hover:bg-brand-dark transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">{totalItems()} item di keranjang</p>
                  <p className="text-white/80 text-xs">{formatPrice(totalPrice())}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 font-semibold text-sm">
                <span>Lihat</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
