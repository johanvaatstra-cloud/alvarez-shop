import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCatalogStore = defineStore('catalog', () => {
  const search = ref('')
  const selectedCategory = ref<string | undefined>()
  const selectedBrand = ref<string | undefined>()
  const selectedTags = ref<string[]>([])
  const minPrice = ref<number | undefined>()
  const maxPrice = ref<number | undefined>()
  const sortBy = ref<'name' | 'pricePerUnit' | 'createdAt'>('name')
  const sortDir = ref<'asc' | 'desc'>('asc')
  const page = ref(1)

  function reset() {
    search.value = ''
    selectedCategory.value = undefined
    selectedBrand.value = undefined
    selectedTags.value = []
    minPrice.value = undefined
    maxPrice.value = undefined
    sortBy.value = 'name'
    sortDir.value = 'asc'
    page.value = 1
  }

  function setPage(p: number) {
    page.value = p
  }

  return {
    search,
    selectedCategory,
    selectedBrand,
    selectedTags,
    minPrice,
    maxPrice,
    sortBy,
    sortDir,
    page,
    reset,
    setPage,
  }
})
