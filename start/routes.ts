import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { registerApiRoutes } from '#start/routes/api/index'
import { registerPageRoutes } from '#start/routes/pages/index'

const AdminDebugController = () => import('#controllers/admin/debug_controller')
const GetServerStatsController = () => import('#controllers/admin/get_server_stats_controller')

// Page Routes (Inertia)
registerPageRoutes()

// API Routes v1
router
  .group(() => {
    registerApiRoutes()
  })
  .prefix('/api/v1')
  .as('api.v1')

router
  .get('/admin/api/server-stats', [GetServerStatsController])
  .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])

router
  .group(() => {
    router.get('/queries', [AdminDebugController, 'queries'])
    router.get('/events', [AdminDebugController, 'events'])
    router.get('/routes', [AdminDebugController, 'routes'])
    router.get('/logs', [AdminDebugController, 'logs'])
    router.get('/emails', [AdminDebugController, 'emails'])
    router.get('/emails/:id/preview', [AdminDebugController, 'emailPreview'])
    router.get('/traces', [AdminDebugController, 'traces'])
    router.get('/traces/:id', [AdminDebugController, 'traceDetail'])
  })
  .prefix('/admin/api/debug')
  .use([middleware.auth(), middleware.requireRole(['SUPER_ADMIN', 'ADMIN'])])
