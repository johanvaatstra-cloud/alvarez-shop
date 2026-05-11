import api from './client'
import type { ProductFilterDto } from '@alvarez/shared'

export const productsApi = {
  list: (filters: ProductFilterDto) =>
    api.get('/products', { params: filters }),

  get: (id: string) => api.get(`/products/${id}`),

  categories: () => api.get('/products/categories'),

  brands: () => api.get('/products/brands'),

  quickSearch: (sku: string) => api.post('/products/quick-search', { sku }),
}
