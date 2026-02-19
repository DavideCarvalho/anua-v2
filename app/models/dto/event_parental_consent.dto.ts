import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventParentalConsent from '#models/event_parental_consent'
import type { ParentalConsentStatus } from '#models/event_parental_consent'

export default class EventParentalConsentDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare studentId: string
  declare responsibleId: string
  declare status: ParentalConsentStatus
  declare respondedAt: Date | null
  declare expiresAt: Date | null
  declare approvalNotes: string | null
  declare denialReason: string | null
  declare signature: string | null
  declare ipAddress: string | null
  declare emailSentAt: Date | null
  declare reminderSentAt: Date | null
  declare reminderCount: number
  declare metadata: Record<string, unknown> | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(eventParentalConsent?: EventParentalConsent) {
    super()

    if (!eventParentalConsent) return

    this.id = eventParentalConsent.id
    this.eventId = eventParentalConsent.eventId
    this.studentId = eventParentalConsent.studentId
    this.responsibleId = eventParentalConsent.responsibleId
    this.status = eventParentalConsent.status
    this.respondedAt = eventParentalConsent.respondedAt
      ? eventParentalConsent.respondedAt.toJSDate()
      : null
    this.expiresAt = eventParentalConsent.expiresAt
      ? eventParentalConsent.expiresAt.toJSDate()
      : null
    this.approvalNotes = eventParentalConsent.approvalNotes
    this.denialReason = eventParentalConsent.denialReason
    this.signature = eventParentalConsent.signature
    this.ipAddress = eventParentalConsent.ipAddress
    this.emailSentAt = eventParentalConsent.emailSentAt
      ? eventParentalConsent.emailSentAt.toJSDate()
      : null
    this.reminderSentAt = eventParentalConsent.reminderSentAt
      ? eventParentalConsent.reminderSentAt.toJSDate()
      : null
    this.reminderCount = eventParentalConsent.reminderCount
    this.metadata = eventParentalConsent.metadata
    this.createdAt = eventParentalConsent.createdAt.toJSDate()
    this.updatedAt = eventParentalConsent.updatedAt.toJSDate()
  }
}
