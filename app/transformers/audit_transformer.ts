import { BaseTransformer } from '@adonisjs/core/transformers'

type AuditRow = {
  id: number
  event: string
  auditable_type: string
  auditable_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: Date | string
}

export default class AuditTransformer extends BaseTransformer<AuditRow> {
  toObject() {
    const event = this.resource.event as 'created' | 'updated' | 'deleted'

    return {
      id: this.resource.id,
      event,
      entityType: this.resource.auditable_type,
      entityId: this.resource.auditable_id,
      oldValues: this.resource.old_values,
      newValues: this.resource.new_values,
      metadata: this.resource.metadata,
      createdAt:
        this.resource.created_at instanceof Date
          ? this.resource.created_at
          : new Date(this.resource.created_at),
    }
  }
}
