import { HttpContext } from '@adonisjs/core/http'
import { UserResolver } from '@stouder-io/adonis-auditing'

export default class implements UserResolver {
  async resolve(ctx: HttpContext): Promise<{ id: string; type: string } | null> {
    const user = ctx.auth?.user
    if (!user) return null

    return {
      id: String(user.id),
      type: 'User',
    }
  }
}
