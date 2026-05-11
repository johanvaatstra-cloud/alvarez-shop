import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { verifyAdmin } from '../../middleware/auth'
import * as XLSX from 'xlsx'

const ProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string(),
  pricePerKg: z.number().optional(),
  pricePerUnit: z.number().optional(),
  unit: z.string().min(1),
  packageSize: z.string().min(1),
  unitsPerBox: z.number().int().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  stock: z.number().int().default(0),
})

export default async function adminProductRoutes(app: FastifyInstance) {
  // GET /admin/products
  app.get('/admin/products', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { page = '1', search = '', categoryId = '' } = request.query as Record<string, string>
    const pageNum = parseInt(page) || 1
    const pageSize = 25

    const where: Record<string, unknown> = {}
    if (search) {
      where['OR'] = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId) where['categoryId'] = categoryId

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return reply.send({ products, total, page: pageNum, pageSize })
  })

  // POST /admin/products
  app.post('/admin/products', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const body = ProductSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos', details: body.error.issues })

    const product = await prisma.product.create({ data: body.data, include: { category: true } })
    return reply.status(201).send(product)
  })

  // PATCH /admin/products/:id
  app.patch('/admin/products/:id', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = ProductSchema.partial().safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const product = await prisma.product.update({
      where: { id },
      data: body.data,
      include: { category: true },
    })
    return reply.send(product)
  })

  // DELETE /admin/products/:id (soft delete)
  app.delete('/admin/products/:id', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.product.update({ where: { id }, data: { isActive: false } })
    return reply.send({ ok: true })
  })

  // GET /admin/products/categories
  app.get('/admin/products/categories', { preHandler: [verifyAdmin] }, async (_request, reply) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return reply.send(categories)
  })

  // POST /admin/products/categories
  app.post('/admin/products/categories', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const body = z
      .object({ name: z.string().min(1), slug: z.string().min(1), icon: z.string().optional() })
      .safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })
    const cat = await prisma.category.create({ data: body.data })
    return reply.status(201).send(cat)
  })

  // POST /admin/products/bulk-import — xlsx upsert op SKU
  app.post('/admin/products/bulk-import', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.status(400).send({ error: 'Sin archivo' })

    const buffer = await file.toBuffer()
    let rows: Record<string, unknown>[]
    try {
      const wb = XLSX.read(buffer, { type: 'buffer' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' })
    } catch {
      return reply.status(400).send({ error: 'Archivo XLSX inválido' })
    }

    const results = { created: 0, updated: 0, errors: [] as { row: number; sku: string; error: string }[] }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const sku = String(row['sku'] ?? '').trim()
      if (!sku) {
        results.errors.push({ row: i + 2, sku: '', error: 'SKU verplicht' })
        continue
      }

      try {
        // Opzoeken van categorie via slug
        let categoryId: string | undefined
        if (row['categorySlug']) {
          const cat = await prisma.category.findUnique({ where: { slug: String(row['categorySlug']) } })
          if (cat) categoryId = cat.id
        }

        const existing = await prisma.product.findUnique({ where: { sku } })

        if (existing) {
          // Update — alleen aangeleverde velden aanpassen
          const upd: Record<string, unknown> = {}
          if (row['name']) upd['name'] = String(row['name']).trim()
          if (row['description'] !== undefined) upd['description'] = String(row['description']).trim() || null
          if (row['brand'] !== undefined) upd['brand'] = String(row['brand']).trim() || null
          if (categoryId) upd['categoryId'] = categoryId
          if (row['unit']) upd['unit'] = String(row['unit']).trim()
          if (row['packageSize']) upd['packageSize'] = String(row['packageSize']).trim()
          if (row['pricePerKg'] && String(row['pricePerKg']).trim()) upd['pricePerKg'] = parseFloat(String(row['pricePerKg']))
          if (row['pricePerUnit'] && String(row['pricePerUnit']).trim()) upd['pricePerUnit'] = parseFloat(String(row['pricePerUnit']))
          if (row['unitsPerBox'] && String(row['unitsPerBox']).trim()) upd['unitsPerBox'] = parseInt(String(row['unitsPerBox']))
          if (row['stock'] !== undefined && String(row['stock']).trim()) upd['stock'] = parseInt(String(row['stock']))
          if (row['tags'] !== undefined) upd['tags'] = String(row['tags']).split(',').map((t: string) => t.trim()).filter(Boolean)
          if (row['isActive'] !== undefined) upd['isActive'] = row['isActive'] !== 'false' && row['isActive'] !== '0'

          await prisma.product.update({ where: { sku }, data: upd })
          results.updated++
        } else {
          // Nieuw product aanmaken
          const name = String(row['name'] ?? '').trim()
          if (!name) { results.errors.push({ row: i + 2, sku, error: 'Naam verplicht voor nieuw product' }); continue }
          if (!categoryId) { results.errors.push({ row: i + 2, sku, error: 'Ongeldige categorySlug' }); continue }

          await prisma.product.create({
            data: {
              sku,
              name,
              description: String(row['description'] ?? '').trim() || undefined,
              brand: String(row['brand'] ?? '').trim() || undefined,
              categoryId,
              unit: String(row['unit'] || 'Ud.').trim(),
              packageSize: String(row['packageSize'] || '').trim(),
              pricePerKg: row['pricePerKg'] && String(row['pricePerKg']).trim() ? parseFloat(String(row['pricePerKg'])) : undefined,
              pricePerUnit: row['pricePerUnit'] && String(row['pricePerUnit']).trim() ? parseFloat(String(row['pricePerUnit'])) : undefined,
              unitsPerBox: row['unitsPerBox'] && String(row['unitsPerBox']).trim() ? parseInt(String(row['unitsPerBox'])) : undefined,
              tags: row['tags'] ? String(row['tags']).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              stock: row['stock'] ? parseInt(String(row['stock'])) : 0,
              isActive: row['isActive'] !== 'false' && row['isActive'] !== '0',
            },
          })
          results.created++
        }
      } catch (err) {
        results.errors.push({ row: i + 2, sku, error: err instanceof Error ? err.message : 'Onbekende fout' })
      }
    }

    return reply.send(results)
  })

  // GET /admin/products/bulk-import/template — download voorbeeld xlsx
  app.get('/admin/products/bulk-import/template', { preHandler: [verifyAdmin] }, async (_request, reply) => {
    const sample = [
      { sku: 'NIEUW001', name: 'Voorbeeldproduct', description: 'Omschrijving van het product', brand: 'Merk', categorySlug: 'conservas', pricePerKg: '', pricePerUnit: 9.99, unit: 'Ud.', packageSize: 'Caja 12 uds.', unitsPerBox: 12, tags: 'FI,SF', stock: 50, isActive: 'true' },
      { sku: 'UPDT002', name: 'Bestaand product (stock-update)', description: '', brand: '', categorySlug: 'quesos', pricePerKg: 14.50, pricePerUnit: '', unit: 'Kg', packageSize: 'Pieza ~3 Kg', unitsPerBox: 1, tags: 'FI', stock: 30, isActive: 'true' },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sample), 'Producten')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

    reply
      .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .header('Content-Disposition', 'attachment; filename="producten_plantilla.xlsx"')
      .send(buf)
  })
}
