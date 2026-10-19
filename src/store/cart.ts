import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, ProductVariant } from '@/lib/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant) => void
  addCustomBox: (product: Product, variant: ProductVariant, selections: Product[]) => void
  removeItem: (productId: string, variantName?: string) => void
  removeCartItem: (cartItemId: string) => void
  updateQuantity: (productId: string, variantName: string | undefined, quantity: number) => void
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

function matches(item: CartItem, productId: string, variantName?: string): boolean {
  return !item.cartItemId && item.product.id === productId && (item.variant?.name ?? undefined) === variantName
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

      addCustomBox: (product, variant, selections) => {
        const cartItemId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        set({ items: [...get().items, { product, variant, quantity: 1, customSelections: selections, cartItemId }] })
      },

      removeItem: (productId, variantName) => {
        set({ items: get().items.filter(i => !matches(i, productId, variantName)) })
      },

      removeCartItem: (cartItemId) => {
        set({ items: get().items.filter(i => i.cartItemId !== cartItemId) })
      },

      updateQuantity: (productId, variantName, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantName)
          return
        }
        set({ items: get().items.map(i => matches(i, productId, variantName) ? { ...i, quantity } : i) })
      },

      updateCartItemQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeCartItem(cartItemId)
          return
        }
        set({ items: get().items.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i) })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + (i.variant?.price ?? i.product.price) * i.quantity, 0),
    }),
    { name: 'katresna-cart' }
  )
)
