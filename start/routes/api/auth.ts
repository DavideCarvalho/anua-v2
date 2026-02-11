import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { throttleAuth, throttleApi } from '#start/limiter'

// Auth
const LoginController = () => import('#controllers/auth/login')
const LogoutController = () => import('#controllers/auth/logout')
const SendCodeController = () => import('#controllers/auth/send_code')
const VerifyCodeController = () => import('#controllers/auth/verify_code')
const MeController = () => import('#controllers/auth/me')

export function registerAuthApiRoutes() {
  // Public
  router
    .group(() => {
      router.post('/login', [LoginController]).as('auth.login')
      router.post('/send-code', [SendCodeController]).as('auth.sendCode')
      router.post('/verify-code', [VerifyCodeController]).as('auth.verifyCode')
    })
    .prefix('/auth')
    .use(throttleAuth)

  // Protected
  router
    .group(() => {
      router.post('/logout', [LogoutController]).as('auth.logout')
      router.get('/me', [MeController]).as('auth.me')
    })
    .prefix('/auth')
    .use(middleware.auth())
    .use(throttleApi)
}
