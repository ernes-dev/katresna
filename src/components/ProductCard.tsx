'use client'
import Image from 'next/image'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { Product } from '@/lib/types'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find(i => i.product.id === product.id)
  const qty = cartItem?.quantity || 0

  if (!product.is_available) return null

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍱</div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-end justify-between mt-auto pt-2">
          <span className="font-bold text-brand text-sm">{formatPrice(product.price)}</span>

          {qty === 0 ? (
            <button
              onClick={() => addItem(product)}
              aria-label={`Tambah ${product.name}`}
              className="bg-brand text-white rounded-full p-1.5 hover:bg-brand-dark active:scale-90 transition-all duration-150 shadow-sm shadow-brand/30"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-brand rounded-full px-1 py-1">
              <button
                onClick={() => updateQuantity(product.id, qty - 1)}
                aria-label="Kurangi"
                className="text-white rounded-full hover:bg-white/20 p-0.5 transition"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="text-white font-bold text-xs w-4 text-center">{qty}</span>
              <button
                onClick={() => addItem(product)}
                aria-label="Tambah"
                className="text-white rounded-full hover:bg-white/20 p-0.5 transition"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
