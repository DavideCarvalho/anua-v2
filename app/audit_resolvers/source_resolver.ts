import { HttpContext } from '@adonisjs/core/http'
import { Resolver } from '@stouder-io/adonis-auditing'
import { getAuditContext } from '#services/audit_context_service'

export default class SourceResolver implements Resolver {
  async resolve(ctx: HttpContext): Promise<string | null> {
    // First try HTTP context (normal web requests)
    const routeName = ctx.route?.name
    if (routeName) {
      return routeName
    }

    // Fallback to job context (background jobs)
    const jobContext = getAuditContext()
    return jobContext?.source ?? null
  }
}
