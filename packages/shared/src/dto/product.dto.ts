export interface ProductDto {
  id: string
  sku: string
  name: string
  description?: string | null
  brand?: string | null
  category: CategoryDto
  categoryId: string
  pricePerKg?: number | null
  pricePerUnit?: number | null
  unit: string
  packageSize: string
  unitsPerBox?: number | null
  images: string[]
  tags: string[]
  isActive: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

export interface CategoryDto {
  id: string
  name: string
  slug: string
  icon?: string | null
}

export interface ProductListDto {
  items: ProductDto[]
  total: number
  page: number
  pageSize: number
}

export interface ProductFilterDto {
  category?: string
  brand?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'price' | 'createdAt'
  sortDir?: 'asc' | 'desc'
}
