import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventParentalConsent from '#models/event_parental_consent'
import type { ParentalConsentStatus } from '#models/event_parental_consent'
import type { DateTime } from 'luxon'

export default class EventParentalConsentDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare studentId: string
  declare responsibleId: string
  declare status: ParentalConsentStatus
  declare respondedAt: DateTime | null
  declare expiresAt: DateTime | null
  declare approvalNotes: string | null
  declare denialReason: string | null
  declare signature: string | null
  declare ipAddress: string | null
  declare emailSentAt: DateTime | null
  declare reminderSentAt: DateTime | null
  declare reminderCount: number
  declare metadata: Record<string, unknown> | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(eventParentalConsent?: EventParentalConsent) {
    super()

    if (!eventParentalConsent) return

    this.id = eventParentalConsent.id
    this.eventId = eventParentalConsent.eventId
    this.studentId = eventParentalConsent.studentId
    this.responsibleId = eventParentalConsent.responsibleId
    this.status = eventParentalConsent.status
    this.respondedAt = eventParentalConsent.respondedAt
    this.expiresAt = eventParentalConsent.expiresAt
    this.approvalNotes = eventParentalConsent.approvalNotes
    this.denialReason = eventParentalConsent.denialReason
    this.signature = eventParentalConsent.signature
    this.ipAddress = eventParentalConsent.ipAddress
    this.emailSentAt = eventParentalConsent.emailSentAt
    this.reminderSentAt = eventParentalConsent.reminderSentAt
    this.reminderCount = eventParentalConsent.reminderCount
    this.metadata = eventParentalConsent.metadata
    this.createdAt = eventParentalConsent.createdAt
    this.updatedAt = eventParentalConsent.updatedAt
  }
}
