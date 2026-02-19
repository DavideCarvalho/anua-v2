import { DateTime } from 'luxon'

interface AuditMetadata {
  ip_address?: string
  user_agent?: string
  url?: string
  source?: string
  user_name?: string
}

interface AuditRow {
  id: number
  event: string
  auditable_type: string
  auditable_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  metadata: AuditMetadata | null
  created_at: Date | string
}

export default class AuditDto {
  declare id: number
  declare event: 'created' | 'updated' | 'deleted'
  declare entityType: string
  declare entityId: string
  declare oldValues: Record<string, unknown> | null
  declare newValues: Record<string, unknown> | null
  declare metadata: AuditMetadata | null
  declare createdAt: DateTime

  constructor(row: AuditRow) {
    this.id = row.id
    this.event = row.event as 'created' | 'updated' | 'deleted'
    this.entityType = row.auditable_type
    this.entityId = row.auditable_id
    this.oldValues = row.old_values
    this.newValues = row.new_values
    this.metadata = row.metadata
    this.createdAt =
      row.created_at instanceof Date
        ? DateTime.fromJSDate(row.created_at)
        : DateTime.fromISO(row.created_at as string)
  }

  static fromArray(rows: AuditRow[]): AuditDto[] {
    return rows.map((row) => new AuditDto(row))
  }
}
