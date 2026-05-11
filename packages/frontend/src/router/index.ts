import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ─── Public layout ──────────────────────────────────────────────────────
    {
      path: '/',
      component: () => import('../components/layout/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../views/public/HomeView.vue') },
        { path: 'sobre-nosotros', name: 'about', component: () => import('../views/public/AboutView.vue') },
        { path: 'marcas', name: 'brands', component: () => import('../views/public/BrandsView.vue') },
        { path: 'contacto', name: 'contact', component: () => import('../views/public/ContactView.vue') },
      ],
    },

    // ─── Auth pages ─────────────────────────────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/activar/:token',
      name: 'activate',
      component: () => import('../views/auth/ActivateView.vue'),
    },
    {
      path: '/cambiar-contrasena',
      name: 'change-password',
      component: () => import('../views/auth/ChangePasswordView.vue'),
      meta: { requiresAuth: true },
    },

    // ─── Shop layout (authenticated) ────────────────────────────────────────
    {
      path: '/tienda',
      component: () => import('../components/layout/ShopLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/tienda/catalogo' },
        { path: 'catalogo', name: 'catalog', component: () => import('../views/shop/CatalogView.vue') },
        { path: 'producto/:id', name: 'product', component: () => import('../views/shop/ProductView.vue') },
        { path: 'carrito', name: 'cart', component: () => import('../views/shop/CartView.vue') },
        { path: 'checkout', name: 'checkout', component: () => import('../views/shop/CheckoutView.vue') },
        { path: 'pedidos', name: 'orders', component: () => import('../views/shop/OrdersView.vue') },
        { path: 'pedidos/:id', name: 'order-detail', component: () => import('../views/shop/OrderDetailView.vue') },
        { path: 'facturas', name: 'invoices', component: () => import('../views/shop/InvoicesView.vue') },
        { path: 'cuenta', name: 'account', component: () => import('../views/shop/AccountView.vue') },
      ],
    },

    // ─── Admin layout ───────────────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('../components/layout/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: () => import('../views/admin/DashboardView.vue') },
        { path: 'productos', name: 'admin-products', component: () => import('../views/admin/ProductsView.vue') },
        { path: 'clientes', name: 'admin-customers', component: () => import('../views/admin/CustomersView.vue') },
        { path: 'clientes/importar', name: 'admin-customer-import', component: () => import('../views/admin/CustomerImportView.vue') },
        { path: 'clientes/:id', name: 'admin-customer-detail', component: () => import('../views/admin/CustomerDetailView.vue') },
        { path: 'pedidos', name: 'admin-orders', component: () => import('../views/admin/OrdersView.vue') },
        { path: 'facturas', name: 'admin-invoices', component: () => import('../views/admin/InvoicesView.vue') },
      ],
    },

    // ─── 404 ────────────────────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/public/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  // Wait for initial auth check
  if (auth.loading) {
    await new Promise<void>((resolve) => {
      const stop = setInterval(() => {
        if (!auth.loading) { clearInterval(stop); resolve() }
      }, 50)
    })
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: 'home' })
  }

  // Force password change
  if (auth.isLoggedIn && auth.mustChangePassword && to.name !== 'change-password') {
    return next({ name: 'change-password' })
  }

  next()
})

export default router
