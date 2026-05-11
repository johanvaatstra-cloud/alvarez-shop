import api from './client'

export const customersApi = {
  me: () => api.get('/customers/me'),
  update: (data: { contactName?: string; phone?: string }) => api.patch('/customers/me', data),
  addAddress: (data: object) => api.post('/customers/me/addresses', data),
  updateAddress: (id: string, data: object) => api.patch(`/customers/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/customers/me/addresses/${id}`),
}

export const adminApi = {
  // Dashboard
  dashboard: () => api.get('/admin/dashboard'),

  // Customers
  customers: (params: object) => api.get('/admin/customers', { params }),
  customer: (id: string) => api.get(`/admin/customers/${id}`),
  updateCustomer: (id: string, data: object) => api.patch(`/admin/customers/${id}`, data),
  resendActivation: (id: string) => api.post(`/admin/customers/${id}/resend-activation`),
  setTempPassword: (id: string, password: string) => api.post(`/admin/customers/${id}/set-temp-password`, { password }),
  importCustomers: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/admin/customers/import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  downloadTemplate: () => api.get('/admin/customers/import/template', { responseType: 'blob' }),

  // Products
  adminProducts: (params: object) => api.get('/admin/products', { params }),
  createProduct: (data: object) => api.post('/admin/products', data),
  updateProduct: (id: string, data: object) => api.patch(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  adminCategories: () => api.get('/admin/products/categories'),
  createCategory: (data: object) => api.post('/admin/products/categories', data),
  bulkImportProducts: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/admin/products/bulk-import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  downloadProductTemplate: () => api.get('/admin/products/bulk-import/template', { responseType: 'blob' }),

  // Orders
  adminOrders: (params: object) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),

  // Invoices
  adminInvoices: (params: object) => api.get('/admin/invoices', { params }),
  markInvoicePaid: (id: string) => api.patch(`/admin/invoices/${id}/paid`),
  importBatches: () => api.get('/admin/import-batches'),
}
