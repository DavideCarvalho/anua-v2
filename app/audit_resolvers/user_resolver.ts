import { HttpContext } from '@adonisjs/core/http'
import { UserResolver } from '@stouder-io/adonis-auditing'
import { getAuditContext } from '#services/audit_context_service'

export default class implements UserResolver {
  async resolve(ctx: HttpContext): Promise<{ id: string; type: string } | null> {
    // First try HTTP context (normal web requests)
    const user = ctx.auth?.user
    if (user) {
      return {
        id: String(user.id),
        type: 'User',
      }
    }

    // Fallback to job context (background jobs)
    const jobContext = getAuditContext()
    if (jobContext?.userId) {
      return {
        id: jobContext.userId,
        type: 'User',
      }
    }

    return null
  }
}
