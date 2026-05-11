import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyAuth } from '../middleware/auth'

const AddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  province: z.string().min(1),
  country: z.string().default('ES'),
  isDefault: z.boolean().default(false),
})

export default async function customerRoutes(app: FastifyInstance) {
  // GET /customers/me
  app.get('/customers/me', { preHandler: [verifyAuth] }, async (request, reply) => {
    const customer = await prisma.customer.findUnique({
      where: { id: request.user!.sub },
      include: { addresses: true },
    })
    if (!customer) return reply.status(404).send({ error: 'No encontrado' })
    const { passwordHash, activationToken, activationExpiry, ...safe } = customer
    return reply.send(safe)
  })

  // PATCH /customers/me — update contact info only
  app.patch('/customers/me', { preHandler: [verifyAuth] }, async (request, reply) => {
    const body = z
      .object({ contactName: z.string().optional(), phone: z.string().optional() })
      .safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const updated = await prisma.customer.update({
      where: { id: request.user!.sub },
      data: body.data,
      include: { addresses: true },
    })
    const { passwordHash, activationToken, activationExpiry, ...safe } = updated
    return reply.send(safe)
  })

  // POST /customers/me/addresses
  app.post('/customers/me/addresses', { preHandler: [verifyAuth] }, async (request, reply) => {
    const body = AddressSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    if (body.data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: request.user!.sub },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: { ...body.data, customerId: request.user!.sub },
    })
    return reply.status(201).send(address)
  })

  // PATCH /customers/me/addresses/:id
  app.patch('/customers/me/addresses/:id', { preHandler: [verifyAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = AddressSchema.partial().safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const existing = await prisma.address.findFirst({ where: { id, customerId: request.user!.sub } })
    if (!existing) return reply.status(404).send({ error: 'Dirección no encontrada' })

    if (body.data.isDefault) {
      await prisma.address.updateMany({ where: { customerId: request.user!.sub }, data: { isDefault: false } })
    }

    const updated = await prisma.address.update({ where: { id }, data: body.data })
    return reply.send(updated)
  })

  // DELETE /customers/me/addresses/:id
  app.delete('/customers/me/addresses/:id', { preHandler: [verifyAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await prisma.address.findFirst({ where: { id, customerId: request.user!.sub } })
    if (!existing) return reply.status(404).send({ error: 'Dirección no encontrada' })
    await prisma.address.delete({ where: { id } })
    return reply.send({ ok: true })
  })
}
