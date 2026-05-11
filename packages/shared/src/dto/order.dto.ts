import type { PaymentMethod } from './customer.dto'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type InvoiceStatus = 'OPEN' | 'PAID' | 'OVERDUE' | 'DISPUTED' | 'CANCELLED'

export interface OrderItemDto {
  id: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
}

export interface OrderDto {
  id: string
  orderNumber: string
  customerId: string
  companyName: string
  deliveryAddress?: {
    street: string
    city: string
    postalCode: string
    province: string
    country: string
  } | null
  items: OrderItemDto[]
  status: OrderStatus
  paymentMethod: PaymentMethod
  totalAmount: number
  vatAmount: number
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateOrderDto {
  addressId?: string
  items: Array<{ productId: string; quantity: number }>
  notes?: string
}

export interface InvoiceDto {
  id: string
  invoiceNumber: string
  customerId: string
  companyName: string
  orderId: string
  orderNumber: string
  amount: number
  vatAmount: number
  dueDate: string
  status: InvoiceStatus
  paidAt?: string | null
  pdfUrl?: string | null
  createdAt: string
}
