import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { getCurrentSpan } from '@adonisjs/otel/helpers'
import { createRequestLogger, isEnabled } from 'evlog'

function toStringOrUndefined(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return undefined
}

function resolveUserRole(value: unknown): string | undefined {
  if (typeof value === 'object' && value !== null) {
    return toStringOrUndefined((value as Record<string, unknown>).name)
  }

  return toStringOrUndefined(value)
}

export default class EvlogMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!isEnabled()) {
      return next()
    }

    const requestLog = createRequestLogger({
      method: ctx.request.method(),
      path: ctx.request.url(),
      requestId: ctx.request.id(),
    })

    if (ctx.route?.pattern) {
      requestLog.set({ route: ctx.route.pattern })
    }

    const spanContext = getCurrentSpan()?.spanContext()
    if (spanContext) {
      requestLog.set({ traceId: spanContext.traceId, spanId: spanContext.spanId })
    }

    try {
      await next()
    } catch (error) {
      if (error instanceof Error) {
        requestLog.error(error)
      } else {
        requestLog.error(String(error))
      }
      throw error
    } finally {
      const authUser = ctx.auth?.user as Record<string, unknown> | undefined
      const effectiveUser = (ctx.effectiveUser ?? ctx.auth?.user) as
        | Record<string, unknown>
        | undefined
      const userId = toStringOrUndefined(authUser?.id)
      const effectiveUserId = toStringOrUndefined(effectiveUser?.id)
      const isImpersonating =
        ctx.impersonation?.isImpersonating === true ||
        (userId !== undefined && effectiveUserId !== undefined && userId !== effectiveUserId)

      if (authUser) {
        requestLog.set({
          userId,
          userEmail: toStringOrUndefined(authUser.email),
          userRole: resolveUserRole(authUser.role),
          schoolId: toStringOrUndefined(authUser.schoolId),
        })
      }

      if (effectiveUser) {
        requestLog.set({
          effectiveUserId,
          effectiveUserEmail: toStringOrUndefined(effectiveUser.email),
          effectiveUserRole: resolveUserRole(effectiveUser.role),
          effectiveSchoolId: toStringOrUndefined(effectiveUser.schoolId),
          isImpersonating,
        })
      }

      requestLog.emit({ status: ctx.response.getStatus() })
    }
  }
}
