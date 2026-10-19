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
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700 p-1">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Keranjang Belanja</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Keranjang kosong</p>
            <p className="text-gray-400 text-sm mt-1">Yuk tambah produk Bolen Katresna!</p>
            <Link
              href="/"
              className="mt-5 inline-block bg-brand text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-dark transition"
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
                <div key={itemKey} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
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
                      <p className="text-brand font-bold text-sm mt-0.5">{formatPrice(itemPrice)}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => isCustom
                          ? updateCartItemQuantity(item.cartItemId!, item.quantity - 1)
                          : updateQuantity(item.product.id, item.variant?.name, item.quantity - 1)}
                        className="border-2 border-brand text-brand rounded-full p-1.5 hover:bg-brand-light transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => isCustom
                          ? updateCartItemQuantity(item.cartItemId!, item.quantity + 1)
                          : updateQuantity(item.product.id, item.variant?.name, item.quantity + 1)}
                        className="bg-brand text-white rounded-full p-1.5 hover:bg-brand-dark transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => isCustom ? removeCartItem(item.cartItemId!) : removeItem(item.product.id, item.variant?.name)}
                      className="text-red-400 hover:text-red-600 ml-1 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.customSelections && item.customSelections.length > 0 && (
                    <div className="mt-2 ml-[76px]">
                      <p className="text-[11px] text-gray-400">
                        {item.customSelections.map(s => s.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="bg-white rounded-2xl p-4 shadow-sm mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-lg font-bold text-brand">{formatPrice(totalPrice())}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Belum termasuk ongkir</p>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-brand text-white text-center py-4 rounded-2xl font-bold text-base hover:bg-brand-dark transition mt-2"
            >
              Lanjut ke Checkout →
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
