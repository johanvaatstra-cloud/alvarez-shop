import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { verifyAdmin } from '../../middleware/auth'
import { importCustomers } from '../../services/customers/import'
import { resendActivationEmail, setTempPassword } from '../../services/customers/activation'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import type { CustomerImportRow } from '@alvarez/shared'

const ITEMS_PER_PAGE = 20

export default async function adminCustomerRoutes(app: FastifyInstance) {
  // GET /admin/customers
  app.get('/admin/customers', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { page = '1', search = '', status = '' } = request.query as Record<string, string>
    const pageNum = parseInt(page) || 1

    const where: Record<string, unknown> = {}
    if (search) {
      where['OR'] = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { vatNumber: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status === 'active') where['isActive'] = true
    if (status === 'inactive') where['isActive'] = false

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (pageNum - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        orderBy: { createdAt: 'desc' },
        include: { addresses: { where: { isDefault: true } } },
      }),
      prisma.customer.count({ where }),
    ])

    const safeCustomers = customers.map(({ passwordHash, activationToken, activationExpiry, ...c }) => c)
    return reply.send({ customers: safeCustomers, total, page: pageNum, pageSize: ITEMS_PER_PAGE })
  })

  // GET /admin/customers/:id
  app.get('/admin/customers/:id', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { addresses: true, orders: { orderBy: { createdAt: 'desc' }, take: 10 }, invoices: { orderBy: { createdAt: 'desc' }, take: 10 } },
    })
    if (!customer) return reply.status(404).send({ error: 'Cliente no encontrado' })
    const { passwordHash, activationToken, activationExpiry, ...safe } = customer
    return reply.send(safe)
  })

  // PATCH /admin/customers/:id
  app.patch('/admin/customers/:id', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z
      .object({
        isActive: z.boolean().optional(),
        contactName: z.string().optional(),
        phone: z.string().optional(),
        isAdmin: z.boolean().optional(),
        discountPct: z.number().min(0).max(100).optional(),
      })
      .safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const updated = await prisma.customer.update({ where: { id }, data: body.data })
    const { passwordHash, activationToken, activationExpiry, ...safe } = updated
    return reply.send(safe)
  })

  // POST /admin/customers/:id/resend-activation
  app.post('/admin/customers/:id/resend-activation', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const ok = await resendActivationEmail(id)
    if (!ok) return reply.status(400).send({ error: 'No se pudo reenviar — el cliente ya está activo o no existe' })
    return reply.send({ ok: true })
  })

  // POST /admin/customers/:id/set-temp-password
  app.post('/admin/customers/:id/set-temp-password', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { password } = request.body as { password?: string }
    if (!password || password.length < 8) return reply.status(400).send({ error: 'Contraseña mínimo 8 caracteres' })
    await setTempPassword(id, password)
    return reply.send({ ok: true })
  })

  // POST /admin/customers/import — CSV of XLSX upload
  app.post('/admin/customers/import', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const data = await request.file()
    if (!data) return reply.status(400).send({ error: 'Sin archivo' })

    const buffer = await data.toBuffer()
    const filename = data.filename

    let rows: CustomerImportRow[]
    try {
      if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        const wb = XLSX.read(buffer, { type: 'buffer' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        rows = XLSX.utils.sheet_to_json<CustomerImportRow>(ws, { raw: false, defval: '' })
      } else {
        rows = parse(buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }) as CustomerImportRow[]
      }
    } catch {
      return reply.status(400).send({ error: 'Archivo malformado — CSV o XLSX vereist' })
    }

    const result = await importCustomers(rows, request.user!.email, filename)
    return reply.send(result)
  })

  // GET /admin/customers/import/template
  app.get('/admin/customers/import/template', { preHandler: [verifyAdmin] }, async (_request, reply) => {
    const header =
      'externalId,companyName,vatNumber,contactName,email,phone,street,city,postalCode,province,paymentMethod,creditLimit,paymentTermDays,chamberOfCommerce,notes\n'
    const example =
      'EXT001,Restaurante Ejemplo SA,B12345678,Juan García,juan@ejemplo.com,+34600000000,Calle Mayor 1,Tarragona,43001,Tarragona,ON_ACCOUNT,5000,30,,\n'

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="clientes_plantilla.csv"')
      .send(header + example)
  })

  // GET /admin/import-batches
  app.get('/admin/import-batches', { preHandler: [verifyAdmin] }, async (_request, reply) => {
    const batches = await prisma.importBatch.findMany({ orderBy: { createdAt: 'desc' } })
    return reply.send(batches)
  })
}
