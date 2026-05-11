<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCatalogStore } from '../../stores/catalog'
import { useCartStore } from '../../stores/cart'
import { productsApi } from '../../api/products.api'
import type { ProductDto, ProductListDto } from '@alvarez/shared'
import ProductCard from '../../components/catalog/ProductCard.vue'
import CatalogFilters from '../../components/catalog/CatalogFilters.vue'
import AppButton from '../../components/ui/AppButton.vue'

const { t } = useI18n()
const catalog = useCatalogStore()
const route = useRoute()
const cart = useCartStore()

const result = ref<ProductListDto>({ items: [], total: 0, page: 1, pageSize: 24 })
const loading = ref(false)
const quickSku = ref('')
const quickError = ref('')

// Apply category from URL query
onMounted(() => {
  if (route.query.category) catalog.selectedCategory = route.query.category as string
  fetchProducts()
})

async function fetchProducts() {
  loading.value = true
  try {
    const { data } = await productsApi.list({
      category: catalog.selectedCategory,
      brand: catalog.selectedBrand,
      search: catalog.search || undefined,
      tags: catalog.selectedTags.length ? catalog.selectedTags.join(',') : undefined,
      page: catalog.page,
      pageSize: 24,
      sortBy: catalog.sortBy as 'name' | 'pricePerUnit' | 'createdAt',
      sortDir: catalog.sortDir,
    } as Record<string, unknown>)
    result.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

watch(
  [
    () => catalog.selectedCategory,
    () => catalog.selectedBrand,
    () => catalog.search,
    () => catalog.selectedTags,
    () => catalog.page,
    () => catalog.sortBy,
    () => catalog.sortDir,
  ],
  fetchProducts,
  { deep: true },
)

const totalPages = computed(() => Math.ceil(result.value.total / result.value.pageSize))

async function quickOrder() {
  quickError.value = ''
  if (!quickSku.value.trim()) return
  try {
    const { data } = await productsApi.quickSearch(quickSku.value.trim())
    cart.addItem(data as ProductDto, data.unitsPerBox ?? 1)
    quickSku.value = ''
  } catch {
    quickError.value = t('catalog.sku_not_found')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-3xl font-light">{{ t('catalog.title') }}</h1>
      <span class="text-sm text-muted">{{ t('catalog.products_count', { n: result.total }, result.total) }}</span>
    </div>

    <!-- Quick order -->
    <div class="bg-black text-white p-4 mb-6 flex items-center gap-4">
      <span class="text-sm font-semibold whitespace-nowrap">{{ t('catalog.quick_order') }}:</span>
      <input
        v-model="quickSku"
        :placeholder="t('catalog.quick_order_placeholder')"
        class="flex-1 bg-white/10 text-white placeholder-white/40 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-accent"
        @keyup.enter="quickOrder"
      />
      <AppButton variant="secondary" class="border-white text-white hover:bg-white hover:text-black whitespace-nowrap" @click="quickOrder">
        + {{ t('catalog.add') }}
      </AppButton>
      <p v-if="quickError" class="text-red-400 text-sm">{{ quickError }}</p>
    </div>

    <div class="flex gap-8">
      <!-- Filters sidebar -->
      <CatalogFilters />

      <!-- Product grid -->
      <div class="flex-1">
        <!-- Sort + search -->
        <div class="flex flex-wrap gap-4 mb-6">
          <input
            v-model="catalog.search"
            :placeholder="t('catalog.search_placeholder')"
            class="input-field flex-1 min-w-48"
            @input="catalog.setPage(1)"
          />
          <select v-model="catalog.sortBy" class="input-field w-40" @change="catalog.setPage(1)">
            <option value="name">{{ t('catalog.sort_name') }}</option>
            <option value="pricePerUnit">{{ t('catalog.sort_price') }}</option>
            <option value="createdAt">{{ t('catalog.sort_newest') }}</option>
          </select>
          <select v-model="catalog.sortDir" class="input-field w-32">
            <option value="asc">{{ t('catalog.asc') }}</option>
            <option value="desc">{{ t('catalog.desc') }}</option>
          </select>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-16 text-muted">{{ t('catalog.loading') }}</div>

        <!-- Empty -->
        <div v-else-if="result.items.length === 0" class="text-center py-16 text-muted">
          <p>{{ t('catalog.no_results') }}</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ProductCard v-for="product in result.items" :key="product.id" :product="product" />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
          <button
            :disabled="catalog.page === 1"
            class="btn-secondary disabled:opacity-40"
            @click="catalog.setPage(catalog.page - 1)"
          >←</button>
          <span class="text-sm text-muted">{{ t('common.page') }} {{ catalog.page }} {{ t('common.of') }} {{ totalPages }}</span>
          <button
            :disabled="catalog.page === totalPages"
            class="btn-secondary disabled:opacity-40"
            @click="catalog.setPage(catalog.page + 1)"
          >→</button>
        </div>
      </div>
    </div>
  </div>
</template>
