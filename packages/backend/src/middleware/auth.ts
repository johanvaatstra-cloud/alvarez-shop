import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  sub: string
  email: string
  isAdmin: boolean
}

export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.cookies['access_token']
    if (!token) {
      return reply.status(401).send({ error: 'No autorizado' })
    }

    const secret = process.env.JWT_ACCESS_SECRET!
    const payload = jwt.verify(token, secret) as JwtPayload
    request.user = payload
  } catch {
    return reply.status(401).send({ error: 'Token inválido o expirado' })
  }
}

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  await verifyAuth(request, reply)
  if (request.user && !request.user.isAdmin) {
    return reply.status(403).send({ error: 'Acceso denegado — se requieren permisos de administrador' })
  }
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload
  }
}
