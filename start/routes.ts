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
