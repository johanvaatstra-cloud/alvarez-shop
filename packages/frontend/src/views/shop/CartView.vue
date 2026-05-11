<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../../stores/cart'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const cart = useCartStore()
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-light mb-8">{{ t('cart.title') }}</h1>

    <div v-if="cart.items.length === 0" class="text-center py-20">
      <svg class="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-muted mb-2">{{ t('cart.empty') }}</p>
      <p class="text-sm text-muted mb-6">{{ t('cart.empty_sub') }}</p>
      <RouterLink to="/tienda/catalogo">
        <AppButton variant="secondary">{{ t('cart.browse') }}</AppButton>
      </RouterLink>
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-8">
      <!-- Items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cart.items"
          :key="item.product.id"
          class="bg-white border border-border p-4 flex gap-4"
        >
          <!-- Image -->
          <div class="w-20 h-20 bg-surface border border-border flex-shrink-0 flex items-center justify-center">
            <img v-if="item.product.images[0]" :src="item.product.images[0]" :alt="item.product.name" class="w-full h-full object-cover" />
            <svg v-else class="w-8 h-8 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16M14 14l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p v-if="item.product.brand" class="text-xs text-muted uppercase tracking-wider">{{ item.product.brand }}</p>
            <p class="font-semibold text-sm leading-tight">{{ item.product.name }}</p>
            <p class="text-xs text-muted mt-0.5">{{ item.product.packageSize }}</p>
            <!-- Quantity controls -->
            <div class="flex items-center gap-2 mt-3">
              <button class="w-7 h-7 border border-border flex items-center justify-center text-sm hover:bg-surface" @click="cart.updateQuantity(item.product.id, item.quantity - (item.product.unitsPerBox ?? 1))">−</button>
              <span class="text-sm font-semibold min-w-8 text-center">{{ item.quantity }}</span>
              <button class="w-7 h-7 border border-border flex items-center justify-center text-sm hover:bg-surface" @click="cart.updateQuantity(item.product.id, item.quantity + (item.product.unitsPerBox ?? 1))">+</button>
              <button class="ml-4 text-xs text-muted hover:text-accent" @click="cart.removeItem(item.product.id)">{{ t('cart.remove') }}</button>
            </div>
          </div>
          <!-- Price -->
          <div class="text-right flex-shrink-0">
            <p class="font-semibold">€{{ ((item.product.pricePerUnit ?? item.product.pricePerKg ?? 0) * item.quantity).toFixed(2) }}</p>
            <p class="text-xs text-muted">{{ t('cart.per_unit', { price: (item.product.pricePerUnit ?? item.product.pricePerKg ?? 0).toFixed(2) }) }}</p>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white border border-border p-6 sticky top-24">
          <h2 class="font-semibold mb-4">{{ t('cart.order_summary') }}</h2>
          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-muted">{{ t('cart.subtotal') }}</span>
              <span>€{{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="cart.discountPct > 0" class="flex justify-between text-accent font-medium">
              <span>{{ t('cart.discount', { pct: cart.discountPct }) }}</span>
              <span>-€{{ cart.discountAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">{{ t('cart.vat') }}</span>
              <span>€{{ cart.vatAmount.toFixed(2) }}</span>
            </div>
          </div>
          <div class="border-t border-border pt-4 flex justify-between font-semibold mb-6">
            <span>{{ t('cart.total') }}</span>
            <span class="text-lg">€{{ cart.total.toFixed(2) }}</span>
          </div>
          <RouterLink to="/tienda/checkout">
            <AppButton class="w-full justify-center">{{ t('cart.checkout') }}</AppButton>
          </RouterLink>
          <RouterLink to="/tienda/catalogo" class="block text-center text-xs text-muted mt-4 hover:text-body">
            {{ t('cart.continue_shopping') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
