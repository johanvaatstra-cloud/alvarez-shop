import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { verifyAdmin } from '../../middleware/auth'

export default async function adminInvoiceRoutes(app: FastifyInstance) {
  // GET /admin/invoices
  app.get('/admin/invoices', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { page = '1', status = '' } = request.query as Record<string, string>
    const pageNum = parseInt(page) || 1
    const pageSize = 20

    const where: Record<string, unknown> = {}
    if (status) where['status'] = status

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { companyName: true, email: true } },
          order: { select: { orderNumber: true } },
        },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ])

    return reply.send({ invoices, total, page: pageNum, pageSize })
  })

  // PATCH /admin/invoices/:id/paid
  app.patch('/admin/invoices/:id/paid', { preHandler: [verifyAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return reply.status(404).send({ error: 'Factura no encontrada' })

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    })

    // Reduce customer balance
    await prisma.customer.update({
      where: { id: invoice.customerId },
      data: { currentBalance: { decrement: invoice.amount } },
    })

    return reply.send(updated)
  })

  // GET /admin/dashboard — summary stats
  app.get('/admin/dashboard', { preHandler: [verifyAdmin] }, async (_request, reply) => {
    const [
      pendingOrders,
      todayRevenue,
      openInvoices,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.count({ where: { status: { in: ['OPEN', 'OVERDUE'] } } }),
      prisma.product.count({ where: { stock: { lte: 5 }, isActive: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { companyName: true } } },
      }),
    ])

    return reply.send({
      pendingOrders,
      todayRevenue: todayRevenue._sum.totalAmount ?? 0,
      openInvoices,
      lowStockProducts,
      recentOrders,
    })
  })
}
