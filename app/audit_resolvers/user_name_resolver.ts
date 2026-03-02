import { type HttpContext } from '@adonisjs/core/http'
import { type Resolver } from '@stouder-io/adonis-auditing'
import { getAuditContext } from '#services/audit_context_service'

export default class UserNameResolver implements Resolver {
  async resolve(ctx: HttpContext): Promise<string | null> {
    // First try HTTP context (normal web requests)
    const user = ctx.auth?.user
    if (user?.name) {
      return user.name
    }

    // Fallback to job context (background jobs)
    const jobContext = getAuditContext()
    return jobContext?.userName ?? null
  }
}
