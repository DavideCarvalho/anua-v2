import router from '@adonisjs/core/services/router'
import { registerApiRoutes } from '#start/routes/api/index'
import { registerPageRoutes } from '#start/routes/pages/index'

// Page Routes (Inertia)
registerPageRoutes()

// API Routes v1
router
  .group(() => {
    registerApiRoutes()
  })
  .prefix('/api/v1')
  .as('api.v1')

// CSP violation reports — browsers POST here when reportOnly detects a violation
// Remove this route (and set reportOnly: false in config/shield.ts) once the policy is verified
router.post('/csp-report', async ({ request, logger }) => {
  const report = request.input('csp-report')
  logger.warn({ report }, 'CSP violation detected')
})

// /admin/api/server-stats and /admin/api/debug/* are auto-registered by adonisjs-server-stats provider (config/server_stats.ts)
