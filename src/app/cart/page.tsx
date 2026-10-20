'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'
import Header from '@/components/Header'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, updateCartItemQuantity, removeItem, removeCartItem, totalPrice } = useCartStore()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-brand/30 hover:text-brand active:scale-[0.97]"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-display text-xl font-semibold text-gray-900">Keranjang Belanja</h1>
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-[#f0e8dc] bg-white px-6 py-16 text-center shadow-soft">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-brand-light">
                <ShoppingBag size={44} className="text-brand" />
              </div>
              <p className="font-display text-lg font-semibold text-gray-900">Keranjang kosong</p>
              <p className="mt-1 text-sm text-gray-400">Yuk tambah produk Bolen Katresna!</p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-brand px-8 py-3 font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97]"
              >
                Lihat Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const itemPrice = item.customPrice ?? item.variant?.price ?? item.product.price
                const itemKey = item.cartItemId ?? `${item.product.id}::${item.variant?.name ?? ''}::${idx}`
                const isCustom = !!item.cartItemId
                return (
                  <div key={itemKey} className="rounded-2xl border border-[#f0e8dc] bg-white p-4 shadow-soft transition hover:shadow-float">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-[#f0e8dc]">
                        {item.product.image_url ? (
                          <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.variant.name}</p>
                        )}
                        <p className="text-brand font-bold text-sm mt-1">{formatPrice(itemPrice)}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => isCustom
                            ? updateCartItemQuantity(item.cartItemId!, item.quantity - 1)
                            : updateQuantity(item.product.id, item.variant?.name, item.quantity - 1)}
                          className="border-2 border-brand text-brand rounded-full p-1.5 transition hover:bg-brand-light active:scale-[0.97]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => isCustom
                            ? updateCartItemQuantity(item.cartItemId!, item.quantity + 1)
                            : updateQuantity(item.product.id, item.variant?.name, item.quantity + 1)}
                          className="bg-brand text-white rounded-full p-1.5 shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => isCustom ? removeCartItem(item.cartItemId!) : removeItem(item.product.id, item.variant?.name)}
                        className="text-red-400 hover:text-red-600 ml-1 flex-shrink-0 rounded-lg p-1.5 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.customSelections && item.customSelections.length > 0 && (
                      <div className="mt-3 ml-[76px]">
                        <p className="rounded-lg bg-brand-light/60 px-2.5 py-1.5 text-[11px] text-brand/80">
                          {item.customSelections.map(s => s.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="rounded-2xl border border-[#f0e8dc] bg-white p-4 shadow-soft mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="font-display text-lg font-semibold text-brand">{formatPrice(totalPrice())}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Belum termasuk ongkir</p>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-brand text-white text-center py-4 rounded-2xl font-bold text-base shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.97] mt-2"
              >
                Lanjut ke Checkout →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
