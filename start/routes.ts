import router from '@adonisjs/core/services/router'
import { registerApiRoutes } from '#start/routes/api/index'
import { registerPageRoutes } from '#start/routes/pages/index'

// Page Routes (Inertia)
registerPageRoutes()

// API Routes v1
router
  .group(() => {
    registerApiRoutes()

    // CSP violation reports — browsers POST here when reportOnly detects a violation
    // Browsers send Content-Type: application/csp-report with a raw JSON body.
    // request.input() only works for form fields, so we read the raw body instead.
    // Remove this route (and set reportOnly: false in config/shield.ts) once the policy is verified
    router
      .post('/csp-report', async ({ request, logger }) => {
        const raw = request.raw()
        let report: unknown = null
        try {
          report = raw ? JSON.parse(raw) : null
        } catch {
          report = raw
        }
        logger.warn({ report }, 'CSP violation detected')
      })
      .as('csp_report')
  })
  .prefix('/api/v1')
  .as('api.v1')

// /admin/api/server-stats and /admin/api/debug/* are auto-registered by adonisjs-server-stats provider (config/server_stats.ts)
