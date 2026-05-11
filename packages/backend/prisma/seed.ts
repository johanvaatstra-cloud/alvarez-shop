import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Alvarez Catalunya database...')

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'jamon-iberico' }, create: { name: 'Jamón Ibérico', slug: 'jamon-iberico', icon: '🥩' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'ahumados' }, create: { name: 'Ahumados', slug: 'ahumados', icon: '🐟' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'foie-pato' }, create: { name: 'Foie Gras & Pato', slug: 'foie-pato', icon: '🦆' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'bacalao' }, create: { name: 'Bacalao', slug: 'bacalao', icon: '🐠' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'conservas' }, create: { name: 'Conservas de Pescado', slug: 'conservas', icon: '🥫' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'quesos' }, create: { name: 'Quesos', slug: 'quesos', icon: '🧀' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'embutidos' }, create: { name: 'Embutidos & Cárnicos', slug: 'embutidos', icon: '🥓' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'pan-artesanal' }, create: { name: 'Pan Artesanal', slug: 'pan-artesanal', icon: '🍞' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'setas-trufas' }, create: { name: 'Setas, Hongos & Trufas', slug: 'setas-trufas', icon: '🍄' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'arroz' }, create: { name: 'Arroz', slug: 'arroz', icon: '🍚' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'aceites-vinagres' }, create: { name: 'Aceites, Vinagres & Condimentos', slug: 'aceites-vinagres', icon: '🫒' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'varios' }, create: { name: 'Productos Varios', slug: 'varios', icon: '🛒' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'vinos' }, create: { name: 'Vinos', slug: 'vinos', icon: '🍷' }, update: {} }),
  ])

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]))

  // ─── Products ──────────────────────────────────────────────────────────────
  const productDefs = [
    { sku: '0701005R', name: 'Jamón Bellota 50% Ibérico', description: 'Jamón de bellota de cerdo 50% ibérico, criado en la dehesa. Curación mínima 36 meses. D.O. Guijuelo — Lisardo Castro.', brand: 'Lisardo Castro', categoryId: catMap['jamon-iberico'], pricePerKg: 39.95, unit: 'Kg', packageSize: 'Pieza 7,5 Kg-8,5 Kg.', unitsPerBox: 1, tags: ['FI'], stock: 15 },
    { sku: '0701006R', name: 'Jamón Cebo Ibérico 50%', description: 'Jamón de cebo de cerdo 50% ibérico, alimentado con pienso y pastos naturales. Curación 24 meses. D.O. Guijuelo.', brand: 'Lisardo Castro', categoryId: catMap['jamon-iberico'], pricePerKg: 23.60, unit: 'Kg', packageSize: 'Pieza 7,5 Kg-8,5 Kg.', unitsPerBox: 1, tags: ['FI'], stock: 22 },
    { sku: '0504038A', name: 'Ventresca de Atún PN 900g Selec Mardis', description: 'Ventresca de atún claro en aceite de oliva. Selección Selec Mardis. Tarro 900g neto.', brand: 'Selec Mardis', categoryId: catMap['conservas'], pricePerUnit: 18.19, unit: 'Ud.', packageSize: 'Tarro 900g', unitsPerBox: 6, tags: [], stock: 48 },
    { sku: '0902009R', name: 'Queso Oveja Curado Selec Mardis 3kg', description: 'Queso de oveja curado, mínimo 6 meses de maduración. Selección Selec Mardis. Pieza aprox. 3kg.', brand: 'Selec Mardis', categoryId: catMap['quesos'], pricePerKg: 11.35, unit: 'Kg', packageSize: 'Pieza ~3 Kg', unitsPerBox: 1, tags: ['FI'], stock: 30 },
    { sku: '0201002C', name: 'Carpaccio de Buey Estuche 20 Rac.', description: 'Carpaccio de buey loncheado ultra-fino, en estuche para presentación. 20 raciones individuales. Listo para emplatar.', brand: 'Selec Mardis', categoryId: catMap['embutidos'], pricePerUnit: 45.99, unit: 'Estuche', packageSize: 'Estuche 20 raciones', unitsPerBox: 1, tags: ['SF'], stock: 18 },
    { sku: '1202006A', name: 'Vinagre Forvm Chardonnay 500ml', description: 'Vinagre de vino Chardonnay envejecido en barricas de roble. Acidez 6%. Botella 500ml.', brand: 'Forvm', categoryId: catMap['aceites-vinagres'], pricePerUnit: 9.57, unit: 'Ud.', packageSize: 'Botella 500ml', unitsPerBox: 12, tags: [], stock: 60 },
    { sku: '1207007R', name: 'Gilda con Anchoa del Cantábrico 2kg', description: 'Gildas preparadas con anchoa del Cantábrico, guindilla vasca y aceituna gordal. Cubo 2kg para servicio HORECA.', brand: 'Agromar', categoryId: catMap['conservas'], pricePerUnit: 69.38, unit: 'Ud.', packageSize: 'Cubo 2kg', unitsPerBox: 1, tags: ['FI'], stock: 12 },
    { sku: '1905046C', name: 'Gyozas de Pato Bandeja 20 Uds.', description: 'Gyozas rellenas de pato Moulard de Navarra. Bandeja de 20 unidades de 20g cada una. Martiko.', brand: 'Martiko', categoryId: catMap['foie-pato'], pricePerUnit: 10.73, unit: 'Bandeja', packageSize: 'Bandeja 20 uds. x 20g', unitsPerBox: 6, tags: ['SF'], stock: 35 },
    { sku: '0902023R', name: 'Queso Idiazabal Ahumado D.O. 3kg', description: 'Queso de leche de oveja latixa ahumado con madera de cerezo. Denominación de Origen Idiazabal. Pieza aprox. 3kg.', brand: 'Ameztoi', categoryId: catMap['quesos'], pricePerKg: 14.50, unit: 'Kg', packageSize: 'Pieza ~3 Kg', unitsPerBox: 1, tags: ['FI'], stock: 20 },
    { sku: '1213116C', name: 'Pan Burger Potato Rolls Amapola 80g', description: 'Pan de patata con semillas de amapola para hamburguesas gourmet. Triticum. Caja 18 unidades.', brand: 'Triticum', categoryId: catMap['pan-artesanal'], pricePerUnit: 0.76, unit: 'Ud.', packageSize: 'Caja 18 uds. x 80g', unitsPerBox: 18, tags: ['SF'], stock: 80 },
    { sku: '0301001M', name: 'Magret de Pato Martiko', description: 'Magret de pato Moulard de Navarra, fresco. Pieza de aprox. 350-400g. Para planchas y asados de alta gama.', brand: 'Martiko', categoryId: catMap['foie-pato'], pricePerKg: 22.50, unit: 'Kg', packageSize: 'Pieza ~380g', unitsPerBox: 10, tags: ['FI'], stock: 25 },
    { sku: '0401001B', name: 'Salmón Ahumado Noruego Benfumat', description: 'Salmón ahumado de origen noruego, ahumado en frío con madera de haya. Loncheado al vacío. 1kg.', brand: 'Benfumat', categoryId: catMap['ahumados'], pricePerKg: 28.90, unit: 'Kg', packageSize: 'Bolsa 1kg loncheado', unitsPerBox: 5, tags: ['FI'], stock: 40 },
    { sku: '1101001A', name: 'AOVE ½ Galón Selec Mardis', description: 'Aceite de oliva virgen extra selección Selec Mardis. Envase ½ galón (1,89L) para uso HORECA.', brand: 'Selec Mardis', categoryId: catMap['aceites-vinagres'], pricePerUnit: 14.90, unit: 'Ud.', packageSize: 'Lata ½ Galón 1,89L', unitsPerBox: 6, tags: [], stock: 55 },
    { sku: '0602001R', name: 'Sal Escamas Mardisal 1,5kg', description: 'Sal en escamas Mardisal, ideal para acabado de platos. Cubo 1,5kg para restauración.', brand: 'Mardisal', categoryId: catMap['varios'], pricePerUnit: 8.95, unit: 'Ud.', packageSize: 'Cubo 1,5kg', unitsPerBox: 6, tags: [], stock: 70 },
  ]

  const productIds: Record<string, string> = {}
  for (const product of productDefs) {
    const p = await prisma.product.upsert({
      where: { sku: product.sku },
      create: product,
      update: { ...product },
    })
    productIds[p.sku] = p.id
  }

  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@alvarezcat.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin1234!'
  const adminHash = await bcrypt.hash(adminPassword, 12)

  await prisma.customer.upsert({
    where: { email: adminEmail },
    create: {
      companyName: 'Alvarez Catalunya Admin',
      vatNumber: 'A00000000',
      contactName: 'Administrador',
      email: adminEmail,
      passwordHash: adminHash,
      isActive: true,
      isAdmin: true,
      paymentMethod: 'ONLINE',
    },
    update: { passwordHash: adminHash, isAdmin: true, isActive: true },
  })

  // ─── Test customers ────────────────────────────────────────────────────────
  const testHash = await bcrypt.hash('Test1234!', 12)

  const marta = await prisma.customer.upsert({
    where: { email: 'marta@calamarta.com' },
    create: {
      companyName: 'Cala Marta Restaurant',
      vatNumber: 'B43111001',
      contactName: 'Marta Puig',
      email: 'marta@calamarta.com',
      phone: '+34977100001',
      passwordHash: testHash,
      isActive: true,
      activatedAt: new Date(),
      paymentMethod: 'ONLINE',
      externalId: 'EXT001',
    },
    update: { passwordHash: testHash, isActive: true },
  })

  const jordi = await prisma.customer.upsert({
    where: { email: 'jordi@hotelmed.com' },
    create: {
      companyName: 'Hotel Mediterráneo',
      vatNumber: 'B43222002',
      contactName: 'Jordi Mas',
      email: 'jordi@hotelmed.com',
      phone: '+34977200002',
      passwordHash: testHash,
      isActive: true,
      activatedAt: new Date(),
      paymentMethod: 'ON_ACCOUNT',
      creditLimit: 10000,
      paymentTermDays: 30,
      externalId: 'EXT002',
    },
    update: { passwordHash: testHash, isActive: true, creditLimit: 10000 },
  })

  const anna = await prisma.customer.upsert({
    where: { email: 'anna@gourmetbcn.com' },
    create: {
      companyName: 'Gourmet BCN SL',
      vatNumber: 'B08333003',
      contactName: 'Anna Soler',
      email: 'anna@gourmetbcn.com',
      phone: '+34934300003',
      passwordHash: testHash,
      isActive: true,
      activatedAt: new Date(),
      paymentMethod: 'ON_ACCOUNT',
      creditLimit: 3000,
      currentBalance: 2850,
      paymentTermDays: 60,
      externalId: 'EXT003',
    },
    update: { passwordHash: testHash, isActive: true, creditLimit: 3000, currentBalance: 2850 },
  })

  await prisma.customer.upsert({
    where: { email: 'pere@elceller.com' },
    create: {
      companyName: 'El Celler de Pere',
      vatNumber: 'B17444004',
      contactName: 'Pere Vidal',
      email: 'pere@elceller.com',
      phone: '+34972400004',
      isActive: false,
      paymentMethod: 'ONLINE',
      activationToken: randomBytes(16).toString('hex'),
      activationExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      externalId: 'EXT004',
    },
    update: { isActive: false },
  })

  // ─── Standaard adressen ────────────────────────────────────────────────────
  for (const { customerId, label, street, city, postalCode, province } of [
    { customerId: marta.id, label: 'Sede principal', street: 'Carrer Major 45', city: 'Cambrils', postalCode: '43850', province: 'Tarragona' },
    { customerId: jordi.id, label: 'Hotel', street: 'Passeig Marítim 22', city: 'Salou', postalCode: '43840', province: 'Tarragona' },
    { customerId: anna.id, label: 'Oficina', street: 'Carrer de la Diputació 180', city: 'Barcelona', postalCode: '08011', province: 'Barcelona' },
  ]) {
    if ((await prisma.address.count({ where: { customerId } })) === 0) {
      await prisma.address.create({ data: { customerId, label, street, city, postalCode, province, isDefault: true } })
    }
  }

  // ─── Testbestellingen ──────────────────────────────────────────────────────

  // Jordi Bestelling 1 — DELIVERED 60 dagen geleden, Factuur PAID
  if (!(await prisma.order.findUnique({ where: { orderNumber: 'AC-2025-J001' } }))) {
    const at = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const due = new Date(at); due.setDate(due.getDate() + 30)
    const o = await prisma.order.create({
      data: {
        orderNumber: 'AC-2025-J001', customerId: jordi.id,
        status: 'DELIVERED', paymentMethod: 'ON_ACCOUNT',
        totalAmount: 226.37, vatAmount: 20.58, createdAt: at,
        items: { create: [
          { productId: productIds['0504038A'], quantity: 5, unitPrice: 18.19 },
          { productId: productIds['1202006A'], quantity: 12, unitPrice: 9.57 },
        ]},
      },
    })
    await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2025-J001', customerId: jordi.id, orderId: o.id,
        amount: 205.79, vatAmount: 20.58, dueDate: due,
        status: 'PAID', paidAt: new Date(at.getTime() + 20 * 24 * 60 * 60 * 1000), createdAt: at,
      },
    })
  }

  // Jordi Bestelling 2 — DELIVERED 35 dagen geleden, Factuur OVERDUE
  if (!(await prisma.order.findUnique({ where: { orderNumber: 'AC-2025-J002' } }))) {
    const at = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
    const due = new Date(at); due.setDate(due.getDate() + 30) // vervaldatum 5 dagen geleden
    const o = await prisma.order.create({
      data: {
        orderNumber: 'AC-2025-J002', customerId: jordi.id,
        status: 'DELIVERED', paymentMethod: 'ON_ACCOUNT',
        totalAmount: 79.99, vatAmount: 7.27, createdAt: at,
        items: { create: [
          { productId: productIds['1905046C'], quantity: 4, unitPrice: 10.73 },
          { productId: productIds['1101001A'], quantity: 2, unitPrice: 14.90 },
        ]},
      },
    })
    await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2025-J002', customerId: jordi.id, orderId: o.id,
        amount: 72.72, vatAmount: 7.27, dueDate: due, status: 'OVERDUE', createdAt: at,
      },
    })
    await prisma.customer.update({ where: { id: jordi.id }, data: { currentBalance: { increment: 79.99 } } })
  }

  // Jordi Bestelling 3 — PENDING 3 dagen geleden, geen factuur
  if (!(await prisma.order.findUnique({ where: { orderNumber: 'AC-2025-J003' } }))) {
    const at = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    await prisma.order.create({
      data: {
        orderNumber: 'AC-2025-J003', customerId: jordi.id,
        status: 'PENDING', paymentMethod: 'ON_ACCOUNT',
        totalAmount: 59.07, vatAmount: 5.37, createdAt: at,
        items: { create: [{ productId: productIds['0602001R'], quantity: 6, unitPrice: 8.95 }] },
      },
    })
  }

  // Marta Bestelling 1 — DELIVERED 25 dagen geleden, Stripe
  if (!(await prisma.order.findUnique({ where: { orderNumber: 'AC-2025-M001' } }))) {
    const at = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    await prisma.order.create({
      data: {
        orderNumber: 'AC-2025-M001', customerId: marta.id,
        status: 'DELIVERED', paymentMethod: 'ONLINE',
        totalAmount: 224.66, vatAmount: 20.42,
        stripePaymentIntentId: 'pi_test_demo001', createdAt: at,
        items: { create: [
          { productId: productIds['1101001A'], quantity: 6, unitPrice: 14.90 },
          { productId: productIds['1202006A'], quantity: 12, unitPrice: 9.57 },
        ]},
      },
    })
  }

  // ─── Demo xlsx-bestanden ───────────────────────────────────────────────────
  const demoDir = path.join(__dirname, '..', '..', '..', 'demo')
  if (!fs.existsSync(demoDir)) fs.mkdirSync(demoDir, { recursive: true })

  // klanten_import_voorbeeld.xlsx — 5 nieuwe klanten
  const klantenRows = [
    { externalId: 'EXT100', companyName: 'Restaurant La Paella', vatNumber: 'B43500001', contactName: 'Carlos López', email: 'carlos@lapaella.com', phone: '+34977500001', street: 'Rambla Nova 45', city: 'Tarragona', postalCode: '43001', province: 'Tarragona', paymentMethod: 'ON_ACCOUNT', creditLimit: 5000, paymentTermDays: 30, chamberOfCommerce: '', notes: '' },
    { externalId: 'EXT101', companyName: 'Hotel Costa Dorada', vatNumber: 'B43500002', contactName: 'Elena García', email: 'elena@hotelcosta.com', phone: '+34977500002', street: 'Passeig Marítim 12', city: 'Salou', postalCode: '43840', province: 'Tarragona', paymentMethod: 'ON_ACCOUNT', creditLimit: 8000, paymentTermDays: 30, chamberOfCommerce: '', notes: '' },
    { externalId: 'EXT102', companyName: 'Brasserie Modernista', vatNumber: 'B08500003', contactName: 'Miquel Torres', email: 'miquel@brasserie.com', phone: '+34934500003', street: "Passeig de Gràcia 55", city: 'Barcelona', postalCode: '08007', province: 'Barcelona', paymentMethod: 'ONLINE', creditLimit: '', paymentTermDays: '', chamberOfCommerce: '', notes: '' },
    { externalId: 'EXT103', companyName: 'Gastrobar 1973', vatNumber: 'B08500004', contactName: 'Laia Puig', email: 'laia@gastrobar73.com', phone: '+34934500004', street: 'Carrer de la Ribera 8', city: 'Barcelona', postalCode: '08003', province: 'Barcelona', paymentMethod: 'ONLINE', creditLimit: '', paymentTermDays: '', chamberOfCommerce: '', notes: '' },
    { externalId: 'EXT104', companyName: "El Mercat de l'Alba", vatNumber: 'B43500005', contactName: 'Montserrat Vidal', email: 'montse@mercat.com', phone: '+34977500005', street: 'Plaça Corsini 3', city: 'Tarragona', postalCode: '43001', province: 'Tarragona', paymentMethod: 'ON_ACCOUNT', creditLimit: 3000, paymentTermDays: 60, chamberOfCommerce: '123456789', notes: 'VIP klant' },
  ]
  const kWb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(kWb, XLSX.utils.json_to_sheet(klantenRows), 'Klanten')
  fs.writeFileSync(path.join(demoDir, 'klanten_import_voorbeeld.xlsx'), XLSX.write(kWb, { type: 'buffer', bookType: 'xlsx' }) as Buffer)

  // producten_import_voorbeeld.xlsx — 14 bestaand (stock-update) + 5 nieuw = 19
  const productenRows = [
    { sku: '0701005R', name: 'Jamón Bellota 50% Ibérico', description: '', brand: 'Lisardo Castro', categorySlug: 'jamon-iberico', pricePerKg: 39.95, pricePerUnit: '', unit: 'Kg', packageSize: 'Pieza 7,5 Kg-8,5 Kg.', unitsPerBox: 1, tags: 'FI', stock: 18, isActive: 'true' },
    { sku: '0701006R', name: 'Jamón Cebo Ibérico 50%', description: '', brand: 'Lisardo Castro', categorySlug: 'jamon-iberico', pricePerKg: 23.60, pricePerUnit: '', unit: 'Kg', packageSize: 'Pieza 7,5 Kg-8,5 Kg.', unitsPerBox: 1, tags: 'FI', stock: 25, isActive: 'true' },
    { sku: '0504038A', name: 'Ventresca de Atún PN 900g Selec Mardis', description: '', brand: 'Selec Mardis', categorySlug: 'conservas', pricePerKg: '', pricePerUnit: 18.19, unit: 'Ud.', packageSize: 'Tarro 900g', unitsPerBox: 6, tags: '', stock: 60, isActive: 'true' },
    { sku: '0902009R', name: 'Queso Oveja Curado Selec Mardis 3kg', description: '', brand: 'Selec Mardis', categorySlug: 'quesos', pricePerKg: 11.35, pricePerUnit: '', unit: 'Kg', packageSize: 'Pieza ~3 Kg', unitsPerBox: 1, tags: 'FI', stock: 35, isActive: 'true' },
    { sku: '0201002C', name: 'Carpaccio de Buey Estuche 20 Rac.', description: '', brand: 'Selec Mardis', categorySlug: 'embutidos', pricePerKg: '', pricePerUnit: 45.99, unit: 'Estuche', packageSize: 'Estuche 20 raciones', unitsPerBox: 1, tags: 'SF', stock: 20, isActive: 'true' },
    { sku: '1202006A', name: 'Vinagre Forvm Chardonnay 500ml', description: '', brand: 'Forvm', categorySlug: 'aceites-vinagres', pricePerKg: '', pricePerUnit: 9.57, unit: 'Ud.', packageSize: 'Botella 500ml', unitsPerBox: 12, tags: '', stock: 72, isActive: 'true' },
    { sku: '1207007R', name: 'Gilda con Anchoa del Cantábrico 2kg', description: '', brand: 'Agromar', categorySlug: 'conservas', pricePerKg: '', pricePerUnit: 69.38, unit: 'Ud.', packageSize: 'Cubo 2kg', unitsPerBox: 1, tags: 'FI', stock: 15, isActive: 'true' },
    { sku: '1905046C', name: 'Gyozas de Pato Bandeja 20 Uds.', description: '', brand: 'Martiko', categorySlug: 'foie-pato', pricePerKg: '', pricePerUnit: 10.73, unit: 'Bandeja', packageSize: 'Bandeja 20 uds. x 20g', unitsPerBox: 6, tags: 'SF', stock: 40, isActive: 'true' },
    { sku: '0902023R', name: 'Queso Idiazabal Ahumado D.O. 3kg', description: '', brand: 'Ameztoi', categorySlug: 'quesos', pricePerKg: 14.50, pricePerUnit: '', unit: 'Kg', packageSize: 'Pieza ~3 Kg', unitsPerBox: 1, tags: 'FI', stock: 24, isActive: 'true' },
    { sku: '1213116C', name: 'Pan Burger Potato Rolls Amapola 80g', description: '', brand: 'Triticum', categorySlug: 'pan-artesanal', pricePerKg: '', pricePerUnit: 0.76, unit: 'Ud.', packageSize: 'Caja 18 uds. x 80g', unitsPerBox: 18, tags: 'SF', stock: 100, isActive: 'true' },
    { sku: '0301001M', name: 'Magret de Pato Martiko', description: '', brand: 'Martiko', categorySlug: 'foie-pato', pricePerKg: 22.50, pricePerUnit: '', unit: 'Kg', packageSize: 'Pieza ~380g', unitsPerBox: 10, tags: 'FI', stock: 30, isActive: 'true' },
    { sku: '0401001B', name: 'Salmón Ahumado Noruego Benfumat', description: '', brand: 'Benfumat', categorySlug: 'ahumados', pricePerKg: 28.90, pricePerUnit: '', unit: 'Kg', packageSize: 'Bolsa 1kg loncheado', unitsPerBox: 5, tags: 'FI', stock: 48, isActive: 'true' },
    { sku: '1101001A', name: 'AOVE ½ Galón Selec Mardis', description: '', brand: 'Selec Mardis', categorySlug: 'aceites-vinagres', pricePerKg: '', pricePerUnit: 14.90, unit: 'Ud.', packageSize: 'Lata ½ Galón 1,89L', unitsPerBox: 6, tags: '', stock: 66, isActive: 'true' },
    { sku: '0602001R', name: 'Sal Escamas Mardisal 1,5kg', description: '', brand: 'Mardisal', categorySlug: 'varios', pricePerKg: '', pricePerUnit: 8.95, unit: 'Ud.', packageSize: 'Cubo 1,5kg', unitsPerBox: 6, tags: '', stock: 80, isActive: 'true' },
    // 5 nieuwe producten
    { sku: '0502011A', name: 'Atún Claro en AOVE La Narval 250g', description: 'Atún claro en aceite de oliva virgen extra. Tarro cristal 250g neto.', brand: 'La Narval', categorySlug: 'conservas', pricePerKg: '', pricePerUnit: 6.45, unit: 'Ud.', packageSize: 'Tarro 250g', unitsPerBox: 24, tags: '', stock: 120, isActive: 'true' },
    { sku: '1104002R', name: 'AOVE Coupage 5L Selec Mardis', description: 'Aceite de oliva virgen extra coupage selección Selec Mardis. Bidón 5L HORECA.', brand: 'Selec Mardis', categorySlug: 'aceites-vinagres', pricePerKg: '', pricePerUnit: 48.50, unit: 'Ud.', packageSize: 'Bidón 5L', unitsPerBox: 4, tags: '', stock: 30, isActive: 'true' },
    { sku: '0801005B', name: 'Bacalao Gadus Morhua Salado 1kg Benfumat', description: 'Bacalao del Atlántico Norte salado y desecado. Lomo entero. Calibre extra. 1kg.', brand: 'Benfumat', categorySlug: 'bacalao', pricePerKg: 28.90, pricePerUnit: '', unit: 'Kg', packageSize: 'Pieza ~1 Kg', unitsPerBox: 5, tags: 'FI', stock: 40, isActive: 'true' },
    { sku: '1402008C', name: "Arroz Bomba D.O. Delta de l'Ebre 5kg", description: 'Arroz bomba D.O. Delta del Ebro. Saco 5kg para restauración.', brand: "Delta de l'Ebre", categorySlug: 'arroz', pricePerKg: '', pricePerUnit: 12.80, unit: 'Ud.', packageSize: 'Saco 5kg', unitsPerBox: 6, tags: '', stock: 50, isActive: 'true' },
    { sku: '0603009M', name: 'Trufa Negra Tuber Melanosporum 100g', description: 'Trufa negra congelada de alta calidad. Tuber melanosporum. Bote 100g para alta cocina.', brand: 'Selec Mardis', categorySlug: 'setas-trufas', pricePerKg: '', pricePerUnit: 89.00, unit: 'Ud.', packageSize: 'Bote 100g', unitsPerBox: 1, tags: 'FI', stock: 20, isActive: 'true' },
  ]
  const pWb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(pWb, XLSX.utils.json_to_sheet(productenRows), 'Producten')
  fs.writeFileSync(path.join(demoDir, 'producten_import_voorbeeld.xlsx'), XLSX.write(pWb, { type: 'buffer', bookType: 'xlsx' }) as Buffer)

  // ─── Kortingstestklanten ───────────────────────────────────────────────────
  const discountHash = await bcrypt.hash('Test1234!', 12)

  await prisma.customer.upsert({
    where: { email: 'basic@testhoreca.com' },
    create: {
      companyName: 'Basic HORECA SL',
      vatNumber: 'B99000001',
      contactName: 'Basic Klant',
      email: 'basic@testhoreca.com',
      passwordHash: discountHash,
      isActive: true,
      activatedAt: new Date(),
      paymentMethod: 'ONLINE',
      discountPct: 0,
    },
    update: { passwordHash: discountHash, isActive: true, discountPct: 0 },
  })

  await prisma.customer.upsert({
    where: { email: 'silver@testhoreca.com' },
    create: {
      companyName: 'Silver HORECA SL',
      vatNumber: 'B99000002',
      contactName: 'Silver Klant',
      email: 'silver@testhoreca.com',
      passwordHash: discountHash,
      isActive: true,
      activatedAt: new Date(),
      paymentMethod: 'ONLINE',
      discountPct: 2,
    },
    update: { passwordHash: discountHash, isActive: true, discountPct: 2 },
  })

  await prisma.customer.upsert({
    where: { email: 'gold@testhoreca.com' },
    create: {
      companyName: 'Gold HORECA SL',
      vatNumber: 'B99000003',
      contactName: 'Gold Klant',
      email: 'gold@testhoreca.com',
      passwordHash: discountHash,
      isActive: true,
      activatedAt: new Date(),
      paymentMethod: 'ONLINE',
      discountPct: 5,
    },
    update: { passwordHash: discountHash, isActive: true, discountPct: 5 },
  })

  console.log(`✓ ${productDefs.length} producten geseeed`)
  console.log(`✓ ${categories.length} categorieën geseeed`)
  console.log(`✓ Admin: ${adminEmail} / ${adminPassword}`)
  console.log('✓ Testaccounts:')
  console.log('    marta@calamarta.com / Test1234!  (ONLINE — 1 bestelling)')
  console.log('    jordi@hotelmed.com  / Test1234!  (OP REKENING — 3 bestellingen, 2 facturen)')
  console.log('    anna@gourmetbcn.com / Test1234!  (OP REKENING — kredietlimiet €3000, saldo €2850)')
  console.log('    pere@elceller.com               (NIET geactiveerd)')
  console.log('✓ Kortingstestaccounts:')
  console.log('    basic@testhoreca.com  / Test1234!  (0% korting)')
  console.log('    silver@testhoreca.com / Test1234!  (2% korting)')
  console.log('    gold@testhoreca.com   / Test1234!  (5% korting)')
  console.log('✓ Demo xlsx → demo/klanten_import_voorbeeld.xlsx')
  console.log('✓ Demo xlsx → demo/producten_import_voorbeeld.xlsx')
  console.log('✅ Seed voltooid!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
