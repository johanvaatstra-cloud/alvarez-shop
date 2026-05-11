import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductDto } from '@alvarez/shared'
import { useAuthStore } from './auth'

export interface CartItem {
  product: ProductDto
  quantity: number
}

const VAT_RATE = 0.21

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref<CartItem[]>([])

    const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

    const subtotal = computed(() =>
      items.value.reduce((sum, i) => {
        const price = i.product.pricePerUnit ?? i.product.pricePerKg ?? 0
        return sum + price * i.quantity
      }, 0),
    )

    const discountPct = computed(() => useAuthStore().user?.discountPct ?? 0)
    const discountAmount = computed(() => subtotal.value * (discountPct.value / 100))
    const discountedSubtotal = computed(() => subtotal.value - discountAmount.value)
    const vatAmount = computed(() => discountedSubtotal.value * VAT_RATE)
    const total = computed(() => discountedSubtotal.value + vatAmount.value)

    function addItem(product: ProductDto, quantity: number = 1) {
      const existing = items.value.find((i) => i.product.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        items.value.push({ product, quantity })
      }
    }

    function updateQuantity(productId: string, quantity: number) {
      const item = items.value.find((i) => i.product.id === productId)
      if (!item) return
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }

    function removeItem(productId: string) {
      items.value = items.value.filter((i) => i.product.id !== productId)
    }

    function clear() {
      items.value = []
    }

    return { items, itemCount, subtotal, discountPct, discountAmount, discountedSubtotal, vatAmount, total, addItem, updateQuantity, removeItem, clear }
  },
  {
    persist: {
      key: 'alvarez-cart',
      storage: localStorage,
    },
  },
)
