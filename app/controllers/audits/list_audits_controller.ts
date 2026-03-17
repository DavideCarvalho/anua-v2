import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { listAuditsValidator } from '#validators/audit'
import AppException from '#exceptions/app_exception'
import AuditTransformer from '#transformers/audit_transformer'

const ENTITY_MAP: Record<string, string> = {
  'invoice': 'Invoice',
  'student-payment': 'StudentPayment',
  'student-has-level': 'StudentHasLevel',
  'agreement': 'Agreement',
  'contract': 'Contract',
}

export default class ListAuditsController {
  async handle(ctx: HttpContext) {
    const { params, serialize } = ctx
    await ctx.request.validateUsing(listAuditsValidator)

    const { entityType, entityId } = params
    const auditableType = ENTITY_MAP[entityType]

    if (!auditableType) {
      throw AppException.badRequest('Tipo de entidade inválido')
    }

    const audits = await db
      .from('audits')
      .where('auditable_type', auditableType)
      .where('auditable_id', entityId)
      .orderBy('created_at', 'desc')

    return serialize(AuditTransformer.transform(audits))
  }
}
