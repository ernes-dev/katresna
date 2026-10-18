import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductVariant } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant) => void
  removeItem: (productId: string, variantName?: string) => void
  updateQuantity: (productId: string, variantName: string | undefined, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

function matches(item: CartItem, productId: string, variantName?: string): boolean {
  return item.product.id === productId && (item.variant?.name ?? undefined) === variantName
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant) => {
        const items = get().items
        const existing = items.find(i => matches(i, product.id, variant?.name))
        if (existing) {
          set({ items: items.map(i => matches(i, product.id, variant?.name) ? { ...i, quantity: i.quantity + 1 } : i) })
        } else {
          set({ items: [...items, { product, variant, quantity: 1 }] })
        }
      },

      removeItem: (productId, variantName) => {
        set({ items: get().items.filter(i => !matches(i, productId, variantName)) })
      },

      updateQuantity: (productId, variantName, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantName)
          return
        }
        set({ items: get().items.map(i => matches(i, productId, variantName) ? { ...i, quantity } : i) })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity, 0),
    }),
    { name: 'katresna-cart' }
  )
)
