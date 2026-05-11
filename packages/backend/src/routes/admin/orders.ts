import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { verifyAdmin } from '../../middleware/auth'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

export default async function adminOrderRoutes(app: FastifyInstance) {
  // GET /admin/orders
  app.get('/admin/orders', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { page = '1', status = '', search = '' } = request.query as Record<string, string>
    const pageNum = parseInt(page) || 1
    const pageSize = 20

    const where: Record<string, unknown> = {}
    if (status && ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      where['status'] = status
    }
    if (search) {
      where['OR'] = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { companyName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { companyName: true, email: true } },
          items: { include: { product: { select: { name: true, sku: true } } } },
          deliveryAddress: true,
        },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ])

    return reply.send({ orders, total, page: pageNum, pageSize })
  })

  // PATCH /admin/orders/:id/status
  app.patch('/admin/orders/:id/status', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({ status: z.enum(ORDER_STATUSES) }).safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Estado inválido' })

    const order = await prisma.order.update({
      where: { id },
      data: { status: body.data.status },
    })
    return reply.send(order)
  })
}
