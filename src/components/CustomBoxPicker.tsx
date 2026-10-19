'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Props {
  product: Product
  onClose: () => void
}

export default function CustomBoxPicker({ product, onClose }: Props) {
  const { addCustomBox, totalItems } = useCartStore()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [bolenItems, setBolenItems] = useState<Product[]>([])
  const [selections, setSelections] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const maxItems = selectedVariant?.name === 'Isi 8' ? 8 : selectedVariant?.name === 'Isi 4' ? 4 : 0
  const totalSelected = Object.values(selections).reduce((s, n) => s + n, 0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_available', true)
      .then(({ data }) => {
        const bolen = (data || []).filter(p =>
          p.category?.name?.toLowerCase() === 'bolen' && !p.is_custom_box
        )
        setBolenItems(bolen)
        setLoading(false)
      })
  }, [])

  const adjust = (item: Product, delta: number) => {
    const cur = selections[item.id] || 0
    const next = cur + delta
    if (next < 0) return
    if (delta > 0 && totalSelected >= maxItems) return
    setSelections(prev => ({ ...prev, [item.id]: next }))
  }

  const handleAdd = () => {
    if (!selectedVariant || totalSelected === 0) return
    const selectedProducts = bolenItems.flatMap(item =>
      Array(selections[item.id] || 0).fill(item)
    )
    addCustomBox(product, selectedVariant, selectedProducts)
    onClose()
  }

  const variants = product.variants || []

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
      />
      <div className={`fixed ${totalItems() > 0 ? 'bottom-[72px]' : 'bottom-0'} left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto max-h-[80vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-3 flex-shrink-0">
          {product.image_url && (
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-400">Pilih kemasan & isian</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition flex-shrink-0">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Variant selector */}
        <div className="px-5 pb-3 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 mb-2">PILIH KEMASAN</p>
          <div className="flex gap-2">
            {variants.map(v => (
              <button
                key={v.name}
                onClick={() => { setSelectedVariant(v); setSelections({}) }}
                className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition ${
                  selectedVariant?.name === v.name
                    ? 'border-brand bg-brand-light text-brand'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {v.name}
                <span className="block text-xs font-normal mt-0.5">{formatPrice(v.price)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Item picker */}
        {selectedVariant && (
          <>
            <div className="px-5 pb-2 flex-shrink-0 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">PILIH ISIAN BOLEN</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                totalSelected >= maxItems ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {totalSelected}/{maxItems}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-3">
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Memuat...</div>
              ) : (
                <div className="space-y-2">
                  {bolenItems.map(item => {
                    const qty = selections[item.id] || 0
                    const atMax = totalSelected >= maxItems && qty === 0
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                          qty > 0 ? 'border-brand bg-brand-light/40' : 'border-gray-100 bg-gray-50'
                        } ${atMax ? 'opacity-40' : ''}`}
                      >
                        {item.image_url && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{formatPrice(item.price)}</p>
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => adjust(item, 1)}
                            disabled={atMax}
                            className="bg-brand text-white rounded-full p-1.5 hover:bg-brand-dark transition disabled:opacity-30"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-brand rounded-full px-1.5 py-1.5">
                            <button onClick={() => adjust(item, -1)} className="text-white hover:bg-white/20 rounded-full p-0.5 transition">
                              <Minus size={13} strokeWidth={2.5} />
                            </button>
                            <span className="text-white font-bold text-xs w-4 text-center">{qty}</span>
                            <button
                              onClick={() => adjust(item, 1)}
                              disabled={totalSelected >= maxItems}
                              className="text-white hover:bg-white/20 rounded-full p-0.5 transition disabled:opacity-30"
                            >
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-5 pt-3 flex-shrink-0 border-t border-gray-100">
          <button
            onClick={handleAdd}
            disabled={!selectedVariant || totalSelected === 0}
            className="w-full bg-brand text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-brand-dark transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            {selectedVariant && totalSelected > 0
              ? `Tambah ke Keranjang (${totalSelected}/${maxItems} item) — ${formatPrice(selectedVariant.price)}`
              : 'Pilih kemasan & isian dulu'}
          </button>
        </div>
      </div>
    </>
  )
}
