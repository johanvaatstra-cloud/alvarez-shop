import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { verifyAuth } from '../middleware/auth'

export default async function invoiceRoutes(app: FastifyInstance) {
  // GET /invoices — customer's invoices
  app.get('/invoices', { preHandler: [verifyAuth] }, async (request, reply) => {
    const invoices = await prisma.invoice.findMany({
      where: { customerId: request.user!.sub },
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(invoices)
  })

  // GET /invoices/:id
  app.get('/invoices/:id', { preHandler: [verifyAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const invoice = await prisma.invoice.findFirst({
      where: { id, customerId: request.user!.sub },
      include: { order: true },
    })
    if (!invoice) return reply.status(404).send({ error: 'Factura no encontrada' })
    return reply.send(invoice)
  })
}
