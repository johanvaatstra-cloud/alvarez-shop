# Alvarez Catalunya — B2B Webshop

B2B e-commerce platform for Alvarez Catalunya, a premium food distributor serving the HORECA sector in Tarragona and Barcelona. Part of the **Selec Mardis Group**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite + Tailwind CSS |
| State | Pinia (cart persisted to localStorage) |
| Routing | Vue Router 4 with navigation guards |
| i18n | vue-i18n v9 (ES/CA) |
| Backend | Fastify + TypeScript + Node.js |
| ORM | Prisma + PostgreSQL |
| Auth | JWT (access 15min + refresh 7d, httpOnly cookies) |
| Email | Resend SDK |
| Payments | Stripe |
| Monorepo | pnpm workspaces |

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Docker** (for PostgreSQL)

---

## Setup

### 1. Clone & install

```bash
cd alvarez-catalunya
pnpm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Configure backend environment

```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env` with your values:
```env
DATABASE_URL="postgresql://alvarez:alvarez_dev_2025@localhost:5432/alvarez_catalunya"
JWT_ACCESS_SECRET="your-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
RESEND_API_KEY="re_xxxx"                   # https://resend.com
STRIPE_SECRET_KEY="sk_test_xxxx"           # https://dashboard.stripe.com
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@alvarezcat.com"
ADMIN_PASSWORD="Admin2025!"
```

### 4. Run database migrations + seed

```bash
pnpm db:migrate      # creates tables
pnpm db:seed         # seeds 14 products + admin user
```

### 5. Start development servers

```bash
pnpm dev             # starts both frontend (:5173) and backend (:3000)
```

Or separately:
```bash
pnpm --filter backend dev
pnpm --filter frontend dev
```

---

## Default accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@alvarezcat.com | Admin2025! |

Customers are created via CSV import (no default customers).

---

## Key URLs

| URL | Description |
|---|---|
| `http://localhost:5173` | Public site (home, brands, about, contact) |
| `http://localhost:5173/login` | Customer login |
| `http://localhost:5173/tienda/catalogo` | Product catalog (auth required) |
| `http://localhost:5173/admin` | Admin panel (admin auth required) |
| `http://localhost:5173/admin/clientes/importar` | CSV customer import |
| `http://localhost:3000/health` | API health check |

---

## Customer Onboarding (CSV Import)

1. Log into admin panel → **Importar clientes**
2. Download CSV template
3. Fill in customer data (see column guide on the import page)
4. Upload CSV → review validation preview → confirm import
5. Each valid row creates an **inactive** customer + sends activation email
6. Customer clicks the link → sets password → account becomes active

**Deduplication rules:**
- Same `vatNumber` + inactive → update + resend activation
- Same `vatNumber` + active → skip (shown in report)
- Same `email` with different `vatNumber` → blocked (manual review)

---

## Payment flows

**ONLINE customers:**
- Checkout → Stripe PaymentIntent created → client pays with card/Bizum
- Order status → PENDING until payment confirmed

**ON_ACCOUNT customers:**
- Checkout → order placed without upfront payment
- Invoice automatically generated + emailed
- Credit limit enforced at checkout
- Admin marks invoices as paid from `/admin/facturas`

---

## Project Structure

```
alvarez-catalunya/
├── docker-compose.yml          # PostgreSQL
├── packages/
│   ├── shared/                 # Shared TypeScript DTOs
│   │   └── src/dto/
│   ├── backend/                # Fastify API
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── app.ts
│   │       ├── routes/
│   │       ├── services/
│   │       ├── middleware/
│   │       └── lib/
│   └── frontend/               # Vue 3 app
│       └── src/
│           ├── views/
│           ├── components/
│           ├── stores/
│           ├── api/
│           ├── router/
│           └── i18n/
```

---

## Design System

Colors (from alvarezcat.com):
- `--color-body: #252525` — primary text
- `--color-accent: #ab1642` — crimson CTA (buttons, badges, active links)
- `--color-surface: #fafafa` — card backgrounds
- `--color-muted: #888888` — secondary text
- `--color-border: #e0e0e0` — borders

Fonts: **Arapey** (headings) + **Source Sans Pro** (body/UI)

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Clear session |
| POST | `/auth/activate` | Activate account with token |
| POST | `/auth/change-password` | Change password |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List products (filtered/paginated) |
| GET | `/products/:id` | Get product by ID or SKU |
| GET | `/products/categories` | List categories |
| GET | `/products/brands` | List brands |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place order |
| GET | `/orders` | Customer order history |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/customers` | List customers |
| POST | `/admin/customers/import` | CSV import |
| GET | `/admin/customers/import/template` | Download CSV template |
| PATCH | `/admin/orders/:id/status` | Update order status |
| PATCH | `/admin/invoices/:id/paid` | Mark invoice as paid |
