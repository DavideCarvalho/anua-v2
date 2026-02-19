import { BaseModelDto } from '@adocasts.com/dto/base'
import type GamificationEvent from '#models/gamification_event'

export default class GamificationEventDto extends BaseModelDto {
  declare id: string
  declare type: string
  declare entityType: string
  declare entityId: string
  declare studentId: string
  declare metadata: Record<string, unknown>
  declare processed: boolean
  declare processedAt: Date | null
  declare error: string | null
  declare createdAt: Date

  constructor(gamificationEvent?: GamificationEvent) {
    super()

    if (!gamificationEvent) return

    this.id = gamificationEvent.id
    this.type = gamificationEvent.type
    this.entityType = gamificationEvent.entityType
    this.entityId = gamificationEvent.entityId
    this.studentId = gamificationEvent.studentId
    this.metadata = gamificationEvent.metadata
    this.processed = gamificationEvent.processed
    this.processedAt = gamificationEvent.processedAt
      ? gamificationEvent.processedAt.toJSDate()
      : null
    this.error = gamificationEvent.error
    this.createdAt = gamificationEvent.createdAt.toJSDate()
  }
}
