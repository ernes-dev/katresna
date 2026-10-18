'use client'
import Image from 'next/image'
import { Plus, Minus, X } from 'lucide-react'
import { useState } from 'react'
import { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQuantity } = useCartStore()
  const [pickerOpen, setPickerOpen] = useState(false)

  const hasVariants = !!(product.variants && product.variants.length > 0)

  const totalQty = items.filter(i => i.product.id === product.id).reduce((sum, i) => sum + i.quantity, 0)
  const cartItem = items.find(i => i.product.id === product.id && !i.variant)
  const qty = cartItem?.quantity || 0
  const variantQty = (v: ProductVariant) =>
    items.find(i => i.product.id === product.id && i.variant?.name === v.name)?.quantity || 0

  const displayPrice = hasVariants
    ? Math.min(...product.variants!.map(v => v.price))
    : product.price

  if (!product.is_available) return null

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
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

        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-end justify-between mt-auto pt-2">
            <div>
              {hasVariants && <span className="text-[11px] text-gray-400 block leading-tight">Mulai</span>}
              <span className="font-bold text-brand text-sm">{formatPrice(displayPrice)}</span>
            </div>

            {hasVariants ? (
              <button
                onClick={() => setPickerOpen(true)}
                className="relative bg-brand text-white rounded-full p-1.5 hover:bg-brand-dark active:scale-90 transition-all duration-150 shadow-sm shadow-brand/30"
                aria-label={`Pilih kemasan ${product.name}`}
              >
                <Plus size={16} strokeWidth={2.5} />
                {totalQty > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {totalQty}
                  </span>
                )}
              </button>
            ) : qty === 0 ? (
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
                  onClick={() => updateQuantity(product.id, undefined, qty - 1)}
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

      {pickerOpen && hasVariants && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setPickerOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 shadow-2xl max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
              {product.image_url && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                <p className="text-xs text-gray-400">Pilih kemasan</p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {product.variants!.map(variant => {
                const vQty = variantQty(variant)
                return (
                  <div
                    key={variant.name}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{variant.name}</p>
                      <p className="text-brand font-bold text-sm mt-0.5">{formatPrice(variant.price)}</p>
                    </div>
                    {vQty === 0 ? (
                      <button
                        onClick={() => addItem(product, variant)}
                        className="bg-brand text-white rounded-full p-2 hover:bg-brand-dark active:scale-90 transition-all shadow-sm shadow-brand/30"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-brand rounded-full px-1.5 py-1.5">
                        <button
                          onClick={() => updateQuantity(product.id, variant.name, vQty - 1)}
                          className="text-white rounded-full hover:bg-white/20 p-0.5 transition"
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="text-white font-bold text-xs w-5 text-center">{vQty}</span>
                        <button
                          onClick={() => addItem(product, variant)}
                          className="text-white rounded-full hover:bg-white/20 p-0.5 transition"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {totalQty > 0 && (
              <button
                onClick={() => setPickerOpen(false)}
                className="w-full bg-brand text-white py-3.5 rounded-2xl font-bold hover:bg-brand-dark transition text-sm"
              >
                Lihat Keranjang ({totalQty} item)
              </button>
            )}
          </div>
        </>
      )}
    </>
  )
}
