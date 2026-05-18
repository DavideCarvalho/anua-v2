import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import { throttleAuth, throttleApi } from '#start/limiter'

export function registerAuthApiRoutes() {
  // Public
  router
    .group(() => {
      router.post('/login', [controllers.auth.Login]).as('auth.login')
      router.post('/send-code', [controllers.auth.SendCode]).as('auth.send_code')
      router.post('/verify-code', [controllers.auth.VerifyCode]).as('auth.verify_code')
    })
    .prefix('/auth')
    .use(throttleAuth)

  // Protected
  router
    .group(() => {
      router.post('/logout', [controllers.auth.Logout]).as('auth.logout')
      router.get('/me', [controllers.auth.Me]).as('auth.me')
    })
    .prefix('/auth')
    .use([middleware.auth(), middleware.impersonation()])
    .use(throttleApi)
}
