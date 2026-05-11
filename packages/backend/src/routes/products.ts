import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyAuth } from '../middleware/auth'

const FilterSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(), // comma-separated
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(24),
  sortBy: z.enum(['name', 'pricePerUnit', 'createdAt']).default('name'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
})

export default async function productRoutes(app: FastifyInstance) {
  // GET /products — public listing (filtered, paginated)
  app.get('/products', async (request, reply) => {
    const q = FilterSchema.safeParse(request.query)
    if (!q.success) return reply.status(400).send({ error: 'Parámetros inválidos' })

    const { category, brand, search, minPrice, maxPrice, tags, page, pageSize, sortBy, sortDir } = q.data

    const where: Record<string, unknown> = { isActive: true }

    if (category) where['category'] = { slug: category }
    if (brand) where['brand'] = { equals: brand, mode: 'insensitive' }
    if (search) {
      where['OR'] = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim())
      where['tags'] = { hasSome: tagList }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where['OR'] = [
        ...(Array.isArray(where['OR']) ? where['OR'] : []),
      ]
      // Price filter on pricePerUnit or pricePerKg
      const priceFilter: Record<string, unknown> = {}
      if (minPrice !== undefined) priceFilter['gte'] = minPrice
      if (maxPrice !== undefined) priceFilter['lte'] = maxPrice
      where['OR'] = [
        { pricePerUnit: priceFilter },
        { pricePerKg: priceFilter },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortDir },
      }),
      prisma.product.count({ where }),
    ])

    return reply.send({ items, total, page, pageSize })
  })

  // GET /products/categories
  app.get('/products/categories', async (_request, reply) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return reply.send(categories)
  })

  // GET /products/brands
  app.get('/products/brands', async (_request, reply) => {
    const brands = await prisma.product.findMany({
      where: { isActive: true, brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    })
    return reply.send(brands.map((b) => b.brand).filter(Boolean))
  })

  // GET /products/:id
  app.get('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }], isActive: true },
      include: { category: true },
    })
    if (!product) return reply.status(404).send({ error: 'Producto no encontrado' })
    return reply.send(product)
  })

  // POST /products/quick-add (auth required) — SKU quick-order
  app.post('/products/quick-search', { preHandler: [verifyAuth] }, async (request, reply) => {
    const { sku } = request.body as { sku: string }
    if (!sku) return reply.status(400).send({ error: 'SKU obligatorio' })

    const product = await prisma.product.findFirst({
      where: { sku: { equals: sku.trim(), mode: 'insensitive' }, isActive: true },
      include: { category: true },
    })
    if (!product) return reply.status(404).send({ error: 'Producto no encontrado' })
    return reply.send(product)
  })
}
