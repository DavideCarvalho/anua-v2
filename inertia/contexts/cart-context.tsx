import { createContext, useContext, useState, type PropsWithChildren } from 'react'

export interface CartItem {
  storeItemId: string
  storeId: string
  storeName: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (storeItemId: string) => void
  updateQuantity: (storeItemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  /** All items must belong to the same store */
  storeId: string | null
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems((prev) => {
      // If cart has items from a different store, clear it first
      if (prev.length > 0 && prev[0].storeId !== item.storeId) {
        return [{ ...item, quantity: 1 }]
      }

      const existing = prev.find((i) => i.storeItemId === item.storeItemId)
      if (existing) {
        return prev.map((i) =>
          i.storeItemId === item.storeItemId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeItem(storeItemId: string) {
    setItems((prev) => prev.filter((i) => i.storeItemId !== storeItemId))
  }

  function updateQuantity(storeItemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(storeItemId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.storeItemId === storeItemId ? { ...i, quantity } : i))
    )
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const storeId = items.length > 0 ? items[0].storeId : null

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        storeId,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
