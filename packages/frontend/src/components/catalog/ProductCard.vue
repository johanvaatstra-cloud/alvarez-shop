<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProductDto } from '@alvarez/shared'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import AppBadge from '../ui/AppBadge.vue'
import AppButton from '../ui/AppButton.vue'

const props = defineProps<{ product: ProductDto }>()
const { t } = useI18n()
const cart = useCartStore()
const auth = useAuthStore()

const discountPct = computed(() => auth.user?.discountPct ?? 0)

const displayPrice = computed(() => {
  const base = props.product.pricePerUnit ?? props.product.pricePerKg ?? null
  const label = props.product.pricePerUnit ? t('catalog.per_unit') : t('catalog.per_kg')
  if (!base) return null
  const discounted = discountPct.value > 0 ? base * (1 - discountPct.value / 100) : null
  return { base: base.toFixed(2), discounted: discounted?.toFixed(2) ?? null, label }
})

const rationPrice = computed(() => {
  if (!props.product.pricePerKg) return null
  const base = props.product.pricePerKg * 0.1
  if (discountPct.value > 0) return (base * (1 - discountPct.value / 100)).toFixed(2)
  return base.toFixed(2)
})

const tagVariantMap: Record<string, 'fi' | 'sf' | 'fd' | 'sp'> = {
  FI: 'fi', SF: 'sf', FD: 'fd', SP: 'sp',
}

function addToCart() {
  const qty = props.product.unitsPerBox ?? 1
  cart.addItem(props.product, qty)
}
</script>

<template>
  <div class="bg-white border border-border flex flex-col group hover:border-body transition-colors">
    <!-- Image area -->
    <RouterLink :to="`/tienda/producto/${product.id}`" class="block aspect-square bg-surface overflow-hidden">
      <img
        v-if="product.images[0]"
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-muted">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </RouterLink>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1">
      <!-- Tags -->
      <div v-if="product.tags.length" class="flex flex-wrap gap-1 mb-2">
        <AppBadge v-for="tag in product.tags" :key="tag" :variant="tagVariantMap[tag] ?? 'surface'">
          {{ tag }}
        </AppBadge>
      </div>

      <!-- Brand -->
      <p v-if="product.brand" class="text-xs text-muted uppercase tracking-wider mb-1">{{ product.brand }}</p>

      <!-- Name -->
      <RouterLink :to="`/tienda/producto/${product.id}`" class="font-sans font-semibold text-sm leading-snug mb-1 hover:text-accent">
        {{ product.name }}
      </RouterLink>

      <!-- Package -->
      <p class="text-xs text-muted mb-3">{{ product.packageSize }}</p>

      <!-- Price -->
      <div class="mt-auto">
        <div v-if="displayPrice" class="mb-1">
          <!-- With discount -->
          <div v-if="displayPrice.discounted" class="flex items-baseline gap-2">
            <span class="text-lg font-semibold text-accent">€{{ displayPrice.discounted }}</span>
            <span class="text-xs text-muted">{{ displayPrice.label }}</span>
            <span class="text-xs text-muted line-through">€{{ displayPrice.base }}</span>
          </div>
          <!-- Without discount -->
          <div v-else class="flex items-baseline gap-1">
            <span class="text-lg font-semibold text-body">€{{ displayPrice.base }}</span>
            <span class="text-xs text-muted">{{ displayPrice.label }}</span>
          </div>
          <!-- Discount badge -->
          <span v-if="discountPct > 0" class="inline-block text-xs bg-accent/10 text-accent font-semibold px-1.5 py-0.5 mt-1">
            -{{ discountPct }}%
          </span>
        </div>
        <p v-if="rationPrice" class="text-xs text-muted mb-3">
          {{ t('catalog.ration') }} 100gr. = €{{ rationPrice }}
        </p>

        <AppButton class="w-full" @click="addToCart">
          {{ t('catalog.add_to_cart') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
