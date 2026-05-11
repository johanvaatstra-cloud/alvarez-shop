import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyAuth } from '../middleware/auth'
import { sendOrderConfirmationEmail, sendInvoiceEmail } from '../services/email'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-04-10' })

const VAT_RATE = 0.21

const CreateOrderSchema = z.object({
  addressId: z.string().optional(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
  notes: z.string().optional(),
})

function generateOrderNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `AC-${year}-${rand}`
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `FAC-${year}-${rand}`
}

export default async function orderRoutes(app: FastifyInstance) {
  // POST /orders — place order
  app.post('/orders', { preHandler: [verifyAuth] }, async (request, reply) => {
    const body = CreateOrderSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const customer = await prisma.customer.findUnique({
      where: { id: request.user!.sub },
      include: { addresses: true },
    })
    if (!customer || !customer.isActive) return reply.status(403).send({ error: 'Cuenta inactiva' })

    // Resolve products & calculate total
    const productIds = body.data.items.map((i) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } })

    let subtotal = 0
    const orderItems: Array<{ productId: string; quantity: number; unitPrice: number }> = []

    for (const item of body.data.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return reply.status(400).send({ error: `Producto ${item.productId} no encontrado` })
      const price = product.pricePerUnit ?? product.pricePerKg ?? 0
      subtotal += price * item.quantity
      orderItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: price })
    }

    const discountPct = customer.discountPct ?? 0
    const discountAmount = subtotal * (discountPct / 100)
    const discountedSubtotal = subtotal - discountAmount
    const vatAmount = discountedSubtotal * VAT_RATE
    const totalAmount = discountedSubtotal + vatAmount

    // Credit limit check for ON_ACCOUNT
    if (customer.paymentMethod === 'ON_ACCOUNT' && customer.creditLimit !== null) {
      const newBalance = customer.currentBalance + totalAmount
      if (newBalance > (customer.creditLimit ?? Infinity)) {
        return reply.status(400).send({
          error: `Límite de crédito superado. Saldo actual: €${customer.currentBalance.toFixed(2)}, límite: €${customer.creditLimit?.toFixed(2)}. Contacte con Alvarez Catalunya.`,
        })
      }
    }

    // Resolve delivery address
    let resolvedAddressId: string | undefined = body.data.addressId
    if (!resolvedAddressId) {
      const defaultAddr = customer.addresses.find((a) => a.isDefault) ?? customer.addresses[0]
      resolvedAddressId = defaultAddr?.id
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        addressId: resolvedAddressId,
        paymentMethod: customer.paymentMethod,
        totalAmount,
        vatAmount,
        discountPct,
        discountAmount,
        notes: body.data.notes,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } }, deliveryAddress: true },
    })

    // For ON_ACCOUNT: create invoice + update balance
    if (customer.paymentMethod === 'ON_ACCOUNT') {
      const daysToAdd = customer.paymentTermDays ?? 30
      const dueDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(),
          customerId: customer.id,
          orderId: order.id,
          amount: totalAmount,
          vatAmount,
          dueDate,
        },
      })

      await prisma.customer.update({
        where: { id: customer.id },
        data: { currentBalance: { increment: totalAmount } },
      })

      await sendInvoiceEmail(customer.email, customer.companyName, invoice.invoiceNumber, totalAmount, dueDate)
    }

    await sendOrderConfirmationEmail(customer.email, customer.companyName, order.orderNumber, totalAmount)

    // For ONLINE: create Stripe PaymentIntent
    let paymentIntent: string | undefined
    if (customer.paymentMethod === 'ONLINE') {
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'eur',
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      })
      await prisma.order.update({ where: { id: order.id }, data: { stripePaymentIntentId: pi.id } })
      paymentIntent = pi.client_secret ?? undefined
    }

    return reply.status(201).send({ order, paymentIntent })
  })

  // GET /orders — customer's orders
  app.get('/orders', { preHandler: [verifyAuth] }, async (request, reply) => {
    const orders = await prisma.order.findMany({
      where: { customerId: request.user!.sub },
      include: { items: { include: { product: { select: { name: true, sku: true } } } }, deliveryAddress: true },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(orders)
  })

  // GET /orders/:id
  app.get('/orders/:id', { preHandler: [verifyAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const order = await prisma.order.findFirst({
      where: { id, customerId: request.user!.sub },
      include: { items: { include: { product: true } }, deliveryAddress: true, invoice: true },
    })
    if (!order) return reply.status(404).send({ error: 'Pedido no encontrado' })
    return reply.send({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productName: item.product?.name ?? '',
        productSku: item.product?.sku ?? '',
      })),
    })
  })
}
