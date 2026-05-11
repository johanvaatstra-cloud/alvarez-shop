import { prisma } from '../../lib/prisma'
import { sendActivationEmail } from '../email'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export async function activateCustomer(token: string, password: string): Promise<boolean> {
  const customer = await prisma.customer.findUnique({ where: { activationToken: token } })

  if (!customer) return false
  if (!customer.activationExpiry || customer.activationExpiry < new Date()) return false

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash,
      isActive: true,
      mustChangePassword: false,
      activationToken: null,
      activationExpiry: null,
      activatedAt: new Date(),
    },
  })

  return true
}

export async function resendActivationEmail(customerId: string): Promise<boolean> {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer || customer.isActive) return false

  const token = nanoid(48)
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.customer.update({
    where: { id: customerId },
    data: { activationToken: token, activationExpiry: expiry },
  })

  await sendActivationEmail(customer.email, customer.contactName, token)
  return true
}

export async function setTempPassword(customerId: string, tempPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(tempPassword, 12)
  await prisma.customer.update({
    where: { id: customerId },
    data: { passwordHash, mustChangePassword: true, isActive: true },
  })
}
