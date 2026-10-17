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
}: {
  products: Product[]
  categories: Category[]
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const { items, totalPrice, totalItems } = useCartStore()

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_id === activeCategory)

  const countForCategory = (catId: string) =>
    products.filter(p => p.category_id === catId).length

  return (
    <div className="mt-5">
      {/* Section title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900 text-base">Menu</h2>
        <span className="text-xs text-gray-400">{products.length} item tersedia</span>
      </div>

      {/* Category tabs - GrabMart style pill tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
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
        {categories.map(cat => (
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
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
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
