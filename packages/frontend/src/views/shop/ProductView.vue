<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { productsApi } from '../../api/products.api'
import { useCartStore } from '../../stores/cart'
import type { ProductDto } from '@alvarez/shared'
import AppBadge from '../../components/ui/AppBadge.vue'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const route = useRoute()
const cart = useCartStore()

const product = ref<ProductDto | null>(null)
const loading = ref(true)
const quantity = ref(1)
const added = ref(false)

const tagVariantMap: Record<string, 'fi' | 'sf' | 'fd' | 'sp'> = { FI: 'fi', SF: 'sf', FD: 'fd', SP: 'sp' }
const tagLabelMap = computed(() => ({
  FI: t('product.tags.FI'), SF: t('product.tags.SF'), FD: t('product.tags.FD'), SP: t('product.tags.SP'),
}))

onMounted(async () => {
  try {
    const { data } = await productsApi.get(route.params.id as string)
    product.value = data
    quantity.value = data.unitsPerBox ?? 1
  } finally {
    loading.value = false
  }
})

const displayPrice = computed(() => {
  if (!product.value) return null
  if (product.value.pricePerUnit) return { value: product.value.pricePerUnit.toFixed(2), label: t('catalog.per_unit') }
  if (product.value.pricePerKg) return { value: product.value.pricePerKg.toFixed(2), label: t('catalog.per_kg') }
  return null
})

const rationPrice = computed(() => {
  if (!product.value?.pricePerKg) return null
  return (product.value.pricePerKg * 0.1).toFixed(2)
})

function addToCart() {
  if (!product.value) return
  cart.addItem(product.value, quantity.value)
  added.value = true
  setTimeout(() => { added.value = false }, 2000)
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-16 text-muted">{{ t('common.loading') }}</div>

    <div v-else-if="!product" class="text-center py-16 text-muted">{{ t('product.not_found') }}</div>

    <div v-else>
      <!-- Breadcrumb -->
      <nav class="text-xs text-muted mb-8 flex items-center gap-2">
        <RouterLink to="/tienda/catalogo" class="hover:text-body">{{ t('product.breadcrumb_catalog') }}</RouterLink>
        <span>›</span>
        <span>{{ product.category.name }}</span>
        <span>›</span>
        <span class="text-body">{{ product.name }}</span>
      </nav>

      <div class="grid md:grid-cols-2 gap-12">
        <!-- Image -->
        <div class="bg-surface border border-border aspect-square flex items-center justify-center">
          <img v-if="product.images[0]" :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
          <div v-else class="text-muted text-center">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- Info -->
        <div>
          <!-- Tags -->
          <div v-if="product.tags.length" class="flex flex-wrap gap-2 mb-4">
            <AppBadge v-for="tag in product.tags" :key="tag" :variant="tagVariantMap[tag]">
              {{ tagLabelMap[tag] ?? tag }}
            </AppBadge>
          </div>

          <p v-if="product.brand" class="text-xs text-muted uppercase tracking-widest mb-2">{{ product.brand }}</p>
          <h1 class="font-display text-3xl font-light mb-2">{{ product.name }}</h1>
          <p class="text-xs text-muted mb-1">{{ t('product.sku') }}: {{ product.sku }}</p>
          <p class="text-xs text-muted mb-6">{{ product.category.name }}</p>

          <div class="w-8 h-0.5 bg-accent mb-6" />

          <!-- Price block -->
          <div class="bg-surface border border-border p-6 mb-6">
            <div v-if="displayPrice" class="flex items-baseline gap-2 mb-2">
              <span class="font-display text-4xl font-light">€{{ displayPrice.value }}</span>
              <span class="text-muted text-sm">{{ displayPrice.label }}</span>
            </div>
            <p v-if="rationPrice" class="text-sm text-muted">{{ t('product.ration', { price: rationPrice }) }}</p>
            <div class="mt-4 space-y-1 text-sm text-muted">
              <p><span class="font-semibold text-body">{{ t('product.package') }}:</span> {{ product.packageSize }}</p>
              <p v-if="product.unit"><span class="font-semibold text-body">{{ t('product.unit') }}:</span> {{ product.unit }}</p>
              <p v-if="product.unitsPerBox">
                <span class="font-semibold text-body">{{ t('product.units_per_box') }}:</span> {{ product.unitsPerBox }} {{ t('product.units_abbr') }}
              </p>
              <p v-if="product.unitsPerBox">
                <span class="font-semibold text-body">{{ t('product.min_order') }}:</span> 1 {{ t('product.box') }} ({{ product.unitsPerBox }} {{ t('product.units_abbr') }})
              </p>
            </div>
          </div>

          <!-- Quantity + Add to cart -->
          <div class="flex items-center gap-4">
            <div class="flex items-center border border-border">
              <button class="px-3 py-2 hover:bg-surface" @click="quantity = Math.max(product.unitsPerBox ?? 1, quantity - (product.unitsPerBox ?? 1))">−</button>
              <span class="px-4 py-2 text-sm font-semibold min-w-12 text-center">{{ quantity }}</span>
              <button class="px-3 py-2 hover:bg-surface" @click="quantity += (product.unitsPerBox ?? 1)">+</button>
            </div>
            <AppButton class="flex-1 justify-center" @click="addToCart">
              <span v-if="added">✓ {{ t('catalog.added') }}</span>
              <span v-else>{{ t('product.add_to_cart') }}</span>
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="product.description" class="mt-12 max-w-2xl">
        <h2 class="font-display text-xl font-light mb-4 pb-3 border-b-2 border-accent inline-block">{{ t('product.description') }}</h2>
        <p class="text-body leading-relaxed">{{ product.description }}</p>
      </div>
    </div>
  </div>
</template>
