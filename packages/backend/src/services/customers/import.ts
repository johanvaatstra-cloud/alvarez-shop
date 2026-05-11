import { prisma } from '../../lib/prisma'
import { sendActivationEmail } from '../email'
import { nanoid } from 'nanoid'
import type { CustomerImportRow, ImportResult } from '@alvarez/shared'

const VAT_REGEX = /^[A-Z0-9]{9}$/i

export async function importCustomers(
  customers: CustomerImportRow[],
  importedBy: string,
  filename: string,
): Promise<ImportResult> {
  const batchId = `batch-${new Date().toISOString().slice(0, 10)}-${nanoid(6)}`
  const errors: ImportResult['errors'] = []
  let rowsSuccess = 0
  let rowsSkipped = 0
  let rowsError = 0

  for (let i = 0; i < customers.length; i++) {
    const row = customers[i]
    const rowNum = i + 1

    // --- Validation ---
    if (!row.companyName?.trim()) {
      errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'companyName es obligatorio' })
      rowsError++
      continue
    }
    if (!row.vatNumber?.trim() || !VAT_REGEX.test(row.vatNumber.trim())) {
      errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'vatNumber inválido o faltante' })
      rowsError++
      continue
    }
    if (!row.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'email inválido o faltante' })
      rowsError++
      continue
    }
    if (!row.street?.trim() || !row.city?.trim() || !row.postalCode?.trim() || !row.province?.trim()) {
      errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'Dirección incompleta' })
      rowsError++
      continue
    }
    if (!row.paymentMethod || !['ONLINE', 'ON_ACCOUNT'].includes(row.paymentMethod)) {
      errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'paymentMethod debe ser ONLINE o ON_ACCOUNT' })
      rowsError++
      continue
    }

    try {
      // --- Deduplication ---
      const existing = await prisma.customer.findUnique({ where: { vatNumber: row.vatNumber.trim() } })

      if (existing) {
        if (existing.isActive) {
          // Skip active customers
          errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'Cliente ya activo — omitido' })
          rowsSkipped++
          continue
        }
        // Update inactive customer + resend activation
        const token = nanoid(48)
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        // Check email conflict with another vatNumber
        const emailConflict = await prisma.customer.findFirst({
          where: { email: row.email.trim(), vatNumber: { not: row.vatNumber.trim() } },
        })
        if (emailConflict) {
          errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'Email ya existe con otro CIF/NIF — requiere revisión manual' })
          rowsError++
          continue
        }

        await prisma.customer.update({
          where: { vatNumber: row.vatNumber.trim() },
          data: {
            companyName: row.companyName.trim(),
            contactName: row.contactName.trim(),
            email: row.email.trim(),
            phone: row.phone?.trim() ?? existing.phone,
            paymentMethod: row.paymentMethod,
            creditLimit: row.creditLimit != null && row.creditLimit !== '' ? parseFloat(String(row.creditLimit)) : existing.creditLimit,
            paymentTermDays: row.paymentTermDays != null && row.paymentTermDays !== '' ? parseInt(String(row.paymentTermDays)) : existing.paymentTermDays,
            chamberOfCommerce: row.chamberOfCommerce?.trim() ?? existing.chamberOfCommerce,
            externalId: row.externalId?.trim() ?? existing.externalId,
            importBatchId: batchId,
            importedAt: new Date(),
            activationToken: token,
            activationExpiry: expiry,
          },
        })
        await sendActivationEmail(row.email.trim(), row.contactName.trim(), token)
        rowsSuccess++
        continue
      }

      // --- Check email conflict ---
      const emailConflict = await prisma.customer.findUnique({ where: { email: row.email.trim() } })
      if (emailConflict) {
        errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: 'Email ya existe con otro CIF/NIF — requiere revisión manual' })
        rowsError++
        continue
      }

      // --- Create new customer ---
      const token = nanoid(48)
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      await prisma.customer.create({
        data: {
          companyName: row.companyName.trim(),
          vatNumber: row.vatNumber.trim(),
          chamberOfCommerce: row.chamberOfCommerce?.trim(),
          contactName: row.contactName.trim(),
          email: row.email.trim(),
          phone: row.phone?.trim(),
          isActive: false,
          paymentMethod: row.paymentMethod,
          creditLimit: row.creditLimit != null && row.creditLimit !== '' ? parseFloat(String(row.creditLimit)) : null,
          paymentTermDays: row.paymentTermDays != null && row.paymentTermDays !== '' ? parseInt(String(row.paymentTermDays)) : null,
          externalId: row.externalId?.trim(),
          importBatchId: batchId,
          importedAt: new Date(),
          activationToken: token,
          activationExpiry: expiry,
          addresses: {
            create: {
              label: 'Principal',
              street: row.street.trim(),
              city: row.city.trim(),
              postalCode: row.postalCode.trim(),
              province: row.province.trim(),
              country: 'ES',
              isDefault: true,
            },
          },
        },
      })

      await sendActivationEmail(row.email.trim(), row.contactName.trim(), token)
      rowsSuccess++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      errors.push({ row: rowNum, email: row.email, vatNumber: row.vatNumber, reason: msg })
      rowsError++
    }
  }

  await prisma.importBatch.create({
    data: {
      batchId,
      filename,
      rowsTotal: customers.length,
      rowsSuccess,
      rowsSkipped,
      rowsError,
      errorLog: errors.length > 0 ? JSON.stringify(errors) : null,
      importedBy,
    },
  })

  return { batchId, rowsTotal: customers.length, rowsSuccess, rowsSkipped, rowsError, errors }
}
