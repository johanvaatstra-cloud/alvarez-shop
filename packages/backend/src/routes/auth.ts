import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { verifyAuth } from '../middleware/auth'
import { activateCustomer, setTempPassword } from '../services/customers/activation'
import { nanoid } from 'nanoid'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const ActivateSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
})

function signTokens(customerId: string, email: string, isAdmin: boolean) {
  const accessToken = jwt.sign(
    { sub: customerId, email, isAdmin },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.NODE_ENV === 'production' ? '2h' : '2h' },
  )
  const refreshToken = jwt.sign(
    { sub: customerId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' },
  )
  return { accessToken, refreshToken }
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
}

export default async function authRoutes(app: FastifyInstance) {
  // POST /auth/login
  app.post('/auth/login', async (request, reply) => {
    const body = LoginSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const customer = await prisma.customer.findUnique({ where: { email: body.data.email } })
    if (!customer) return reply.status(401).send({ error: 'Credenciales incorrectas' })

    if (!customer.isActive) {
      return reply.status(403).send({
        error: 'Su cuenta aún no está activada. Compruebe su correo o contacte con Alvarez Catalunya.',
      })
    }

    if (!customer.passwordHash) {
      return reply.status(401).send({ error: 'Credenciales incorrectas' })
    }

    const valid = await bcrypt.compare(body.data.password, customer.passwordHash)
    if (!valid) return reply.status(401).send({ error: 'Credenciales incorrectas' })

    const { accessToken, refreshToken } = signTokens(customer.id, customer.email, customer.isAdmin)

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } })

    reply
      .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 2 * 60 * 60 })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 })

    return reply.send({
      customer: {
        id: customer.id,
        email: customer.email,
        companyName: customer.companyName,
        contactName: customer.contactName,
        isAdmin: customer.isAdmin,
        mustChangePassword: customer.mustChangePassword,
        paymentMethod: customer.paymentMethod,
        creditLimit: customer.creditLimit,
        currentBalance: customer.currentBalance,
        discountPct: customer.discountPct,
      },
    })
  })

  // POST /auth/refresh
  app.post('/auth/refresh', async (request, reply) => {
    const token = request.cookies['refresh_token']
    if (!token) return reply.status(401).send({ error: 'No hay refresh token' })

    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { sub: string }

      const stored = await prisma.refreshToken.findUnique({ where: { token } })
      if (!stored || stored.expiresAt < new Date()) {
        return reply.status(401).send({ error: 'Refresh token inválido' })
      }

      const customer = await prisma.customer.findUnique({ where: { id: payload.sub } })
      if (!customer || !customer.isActive) return reply.status(401).send({ error: 'Cliente inactivo' })

      // Rotate refresh token
      await prisma.refreshToken.delete({ where: { token } })
      const { accessToken, refreshToken: newRefresh } = signTokens(customer.id, customer.email, customer.isAdmin)
      await prisma.refreshToken.create({
        data: { token: newRefresh, customerId: customer.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      })

      reply
        .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 2 * 60 * 60 })
        .setCookie('refresh_token', newRefresh, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 })

      return reply.send({ ok: true })
    } catch {
      return reply.status(401).send({ error: 'Refresh token inválido' })
    }
  })

  // POST /auth/logout
  app.post('/auth/logout', async (request, reply) => {
    const token = request.cookies['refresh_token']
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } })
    }
    reply.clearCookie('access_token').clearCookie('refresh_token')
    return reply.send({ ok: true })
  })

  // POST /auth/activate
  app.post('/auth/activate', async (request, reply) => {
    const body = ActivateSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const ok = await activateCustomer(body.data.token, body.data.password)
    if (!ok) return reply.status(400).send({ error: 'Token inválido o expirado' })

    return reply.send({ ok: true })
  })

  // POST /auth/change-password (authenticated)
  app.post('/auth/change-password', { preHandler: [verifyAuth] }, async (request, reply) => {
    const body = ChangePasswordSchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Datos inválidos' })

    const customer = await prisma.customer.findUnique({ where: { id: request.user!.sub } })
    if (!customer) return reply.status(404).send({ error: 'Cliente no encontrado' })

    const valid = await bcrypt.compare(body.data.currentPassword, customer.passwordHash)
    if (!valid) return reply.status(401).send({ error: 'Contraseña actual incorrecta' })

    const hash = await bcrypt.hash(body.data.newPassword, 12)
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash: hash, mustChangePassword: false },
    })

    return reply.send({ ok: true })
  })

  // GET /auth/me
  app.get('/auth/me', { preHandler: [verifyAuth] }, async (request, reply) => {
    const customer = await prisma.customer.findUnique({
      where: { id: request.user!.sub },
      include: { addresses: true },
    })
    if (!customer) return reply.status(404).send({ error: 'No encontrado' })
    const { passwordHash, activationToken, ...safe } = customer
    return reply.send(safe)
  })
}
