<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCatalogStore } from '../../stores/catalog'
import { productsApi } from '../../api/products.api'
import type { CategoryDto } from '@alvarez/shared'

const { t } = useI18n()
const catalog = useCatalogStore()
const categories = ref<CategoryDto[]>([])
const brands = ref<string[]>([])

onMounted(async () => {
  const [catRes, brandRes] = await Promise.all([productsApi.categories(), productsApi.brands()])
  categories.value = catRes.data
  brands.value = brandRes.data
})

const tags = [
  { key: 'FI', label: 'Frigorífico' },
  { key: 'SF', label: 'Surgelado' },
  { key: 'FD', label: 'Fresco Diario' },
  { key: 'SP', label: 'Especial' },
]

function toggleTag(tag: string) {
  const idx = catalog.selectedTags.indexOf(tag)
  if (idx >= 0) catalog.selectedTags.splice(idx, 1)
  else catalog.selectedTags.push(tag)
  catalog.setPage(1)
}
</script>

<template>
  <aside class="w-56 flex-shrink-0">
    <div class="sticky top-24 space-y-6">
      <!-- Reset -->
      <button class="text-xs text-accent hover:underline" @click="catalog.reset()">{{ t('catalog.clear_filters') }}</button>

      <!-- Categories -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{{ t('catalog.filter_category') }}</h3>
        <ul class="space-y-1">
          <li>
            <button
              class="text-sm w-full text-left py-1 transition-colors"
              :class="!catalog.selectedCategory ? 'text-accent font-semibold' : 'text-body hover:text-accent'"
              @click="catalog.selectedCategory = undefined; catalog.setPage(1)"
            >
              {{ t('catalog.all_categories') }}
            </button>
          </li>
          <li v-for="cat in categories" :key="cat.id">
            <button
              class="text-sm w-full text-left py-1 transition-colors"
              :class="catalog.selectedCategory === cat.slug ? 'text-accent font-semibold' : 'text-body hover:text-accent'"
              @click="catalog.selectedCategory = cat.slug; catalog.setPage(1)"
            >
              <span v-if="cat.icon" class="mr-1">{{ cat.icon }}</span>{{ t('categories.' + cat.slug, cat.name) }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Brands -->
      <div v-if="brands.length">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{{ t('catalog.filter_brand') }}</h3>
        <ul class="space-y-1">
          <li>
            <button
              class="text-sm w-full text-left py-1 transition-colors"
              :class="!catalog.selectedBrand ? 'text-accent font-semibold' : 'text-body hover:text-accent'"
              @click="catalog.selectedBrand = undefined; catalog.setPage(1)"
            >
              {{ t('catalog.all_brands') }}
            </button>
          </li>
          <li v-for="brand in brands" :key="brand">
            <button
              class="text-sm w-full text-left py-1 transition-colors truncate"
              :class="catalog.selectedBrand === brand ? 'text-accent font-semibold' : 'text-body hover:text-accent'"
              @click="catalog.selectedBrand = brand; catalog.setPage(1)"
            >
              {{ brand }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Tags -->
      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{{ t('catalog.filter_tags') }}</h3>
        <div class="space-y-1">
          <label v-for="tag in tags" :key="tag.key" class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="catalog.selectedTags.includes(tag.key)"
              class="accent-accent"
              @change="toggleTag(tag.key)"
            />
            <span class="text-sm text-body">{{ t('product.tags.' + tag.key) }}</span>
          </label>
        </div>
      </div>
    </div>
  </aside>
</template>
