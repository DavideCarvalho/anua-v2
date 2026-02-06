import { HttpContext } from '@adonisjs/core/http'
import { Resolver } from '@stouder-io/adonis-auditing'

export default class SourceResolver implements Resolver {
  async resolve(ctx: HttpContext): Promise<string | null> {
    return ctx.route?.name ?? null
  }
}
