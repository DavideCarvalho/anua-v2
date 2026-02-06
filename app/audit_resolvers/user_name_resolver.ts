import { HttpContext } from '@adonisjs/core/http'
import { Resolver } from '@stouder-io/adonis-auditing'

export default class UserNameResolver implements Resolver {
  async resolve(ctx: HttpContext): Promise<string | null> {
    const user = ctx.auth?.user
    return user?.name ?? null
  }
}
