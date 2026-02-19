import { BaseModelDto } from '@adocasts.com/dto/base'
import type AuditLog from '#models/audit_log'
import type { DateTime } from 'luxon'

export default class AuditLogDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare action: string
  declare entity: string
  declare entityId: string
  declare details: Record<string, unknown> | null
  declare createdAt: DateTime

  constructor(auditLog?: AuditLog) {
    super()

    if (!auditLog) return

    this.id = auditLog.id
    this.userId = auditLog.userId
    this.action = auditLog.action
    this.entity = auditLog.entity
    this.entityId = auditLog.entityId
    this.details = auditLog.details
    this.createdAt = auditLog.createdAt
  }
}
