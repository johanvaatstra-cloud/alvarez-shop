export type PaymentMethod = 'ONLINE' | 'ON_ACCOUNT'

export interface CustomerDto {
  id: string
  companyName: string
  vatNumber: string
  chamberOfCommerce?: string | null
  contactName: string
  email: string
  phone?: string | null
  isActive: boolean
  paymentMethod: PaymentMethod
  creditLimit?: number | null
  paymentTermDays?: number | null
  currentBalance: number
  mustChangePassword: boolean
  activatedAt?: string | null
  lastLoginAt?: string | null
  importedAt?: string | null
  externalId?: string | null
  addresses: AddressDto[]
  createdAt: string
}

export interface AddressDto {
  id: string
  label?: string | null
  street: string
  city: string
  postalCode: string
  province: string
  country: string
  isDefault: boolean
}

export interface CustomerImportRow {
  externalId?: string
  companyName: string
  vatNumber: string
  contactName: string
  email: string
  phone?: string
  street: string
  city: string
  postalCode: string
  province: string
  paymentMethod: PaymentMethod
  creditLimit?: number
  paymentTermDays?: number
  chamberOfCommerce?: string
  notes?: string
}

export interface ImportResult {
  batchId: string
  rowsTotal: number
  rowsSuccess: number
  rowsSkipped: number
  rowsError: number
  errors: Array<{ row: number; email?: string; vatNumber?: string; reason: string }>
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponseDto {
  customer: CustomerDto
}
