import api from './client'
import type { CreateOrderDto } from '@alvarez/shared'

export const ordersApi = {
  create: (data: CreateOrderDto) => api.post('/orders', data),
  list: () => api.get('/orders'),
  get: (id: string) => api.get(`/orders/${id}`),
}

export const invoicesApi = {
  list: () => api.get('/invoices'),
  get: (id: string) => api.get(`/invoices/${id}`),
}
