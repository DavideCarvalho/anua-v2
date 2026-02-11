import limiter from '@adonisjs/limiter/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import type { HttpLimiter } from '@adonisjs/limiter'

/**
 * Rate limiter for authentication endpoints
 * 5 attempts per minute per IP
 */
export const throttleAuth = limiter.define('auth', (ctx: HttpContext) => {
  return limiter
    .allowRequests(5)
    .every('1 minute')
    .blockFor('15 minutes')
    .usingKey(`ip_${ctx.request.ip()}`) as HttpLimiter<any>
})

/**
 * Rate limiter for API endpoints
 * 100 requests per minute for authenticated users
 * 20 requests per minute for guests
 */
export const throttleApi = limiter.define('api', (ctx: HttpContext) => {
  if (ctx.auth.user) {
    return limiter
      .allowRequests(100)
      .every('1 minute')
      .usingKey(`user_${ctx.auth.user.id}`) as HttpLimiter<any>
  }

  return limiter
    .allowRequests(20)
    .every('1 minute')
    .usingKey(`ip_${ctx.request.ip()}`) as HttpLimiter<any>
})

/**
 * Rate limiter for sensitive operations
 * 3 attempts per 5 minutes
 */
export const throttleSensitive = limiter.define('sensitive', (ctx: HttpContext) => {
  const key = ctx.auth.user ? `user_${ctx.auth.user.id}` : `ip_${ctx.request.ip()}`

  return limiter
    .allowRequests(3)
    .every('5 minutes')
    .blockFor('30 minutes')
    .usingKey(key) as HttpLimiter<any>
})

/**
 * Default global throttle
 * 60 requests per minute
 */
export const throttleGlobal = limiter.define('global', (ctx: HttpContext) => {
  return limiter
    .allowRequests(60)
    .every('1 minute')
    .usingKey(`ip_${ctx.request.ip()}`) as HttpLimiter<any>
})
