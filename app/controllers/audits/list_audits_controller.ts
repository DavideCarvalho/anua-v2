import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { listAuditsValidator } from '#validators/audit'
import AuditDto from '#models/dto/audit.dto'

const ENTITY_MAP: Record<string, string> = {
  'invoice': 'Invoice',
  'student-payment': 'StudentPayment',
  'student-has-level': 'StudentHasLevel',
  'agreement': 'Agreement',
  'contract': 'Contract',
}

export default class ListAuditsController {
  async handle(ctx: HttpContext) {
    const { params, response } = ctx
    await ctx.request.validateUsing(listAuditsValidator)

    const { entityType, entityId } = params
    const auditableType = ENTITY_MAP[entityType]

    if (!auditableType) {
      return response.badRequest({ error: 'Invalid entity type' })
    }

    const audits = await db
      .from('audits')
      .where('auditable_type', auditableType)
      .where('auditable_id', entityId)
      .orderBy('created_at', 'desc')

    return AuditDto.fromArray(audits)
  }
}
