import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import orderRoutes from './routes/orders'
import invoiceRoutes from './routes/invoices'
import customerRoutes from './routes/customers'
import adminCustomerRoutes from './routes/admin/customers'
import adminProductRoutes from './routes/admin/products'
import adminOrderRoutes from './routes/admin/orders'
import adminInvoiceRoutes from './routes/admin/invoices'

const app = Fastify({
  logger: { level: process.env.NODE_ENV === 'production' ? 'warn' : 'info' },
})

async function start() {
  // ─── Plugins ─────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })

  await app.register(cookie, {
    secret: process.env.JWT_ACCESS_SECRET ?? 'cookie-secret',
  })

  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  })

  // ─── Routes ──────────────────────────────────────────────────────────────────
  await app.register(authRoutes)
  await app.register(productRoutes)
  await app.register(orderRoutes)
  await app.register(invoiceRoutes)
  await app.register(customerRoutes)

  // Admin routes (prefixed)
  await app.register(adminCustomerRoutes)
  await app.register(adminProductRoutes)
  await app.register(adminOrderRoutes)
  await app.register(adminInvoiceRoutes)

  // ─── Health check ─────────────────────────────────────────────────────────────
  app.get('/health', async () => ({ ok: true, service: 'Alvarez Catalunya API', ts: new Date().toISOString() }))

  // ─── Start ────────────────────────────────────────────────────────────────────
  const PORT = parseInt(process.env.PORT ?? '3000')

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`✓ Alvarez Catalunya API running on port ${PORT}`)
}

start().catch((err) => {
  app.log.error(err)
  process.exit(1)
})
