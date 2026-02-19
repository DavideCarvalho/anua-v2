import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventParticipant from '#models/event_participant'
import type { DateTime } from 'luxon'

export default class EventParticipantDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare userId: string
  declare registrationDate: DateTime
  declare status: string
  declare notes: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(eventParticipant?: EventParticipant) {
    super()

    if (!eventParticipant) return

    this.id = eventParticipant.id
    this.eventId = eventParticipant.eventId
    this.userId = eventParticipant.userId
    this.registrationDate = eventParticipant.registrationDate
    this.status = eventParticipant.status
    this.notes = eventParticipant.notes
    this.createdAt = eventParticipant.createdAt
    this.updatedAt = eventParticipant.updatedAt
  }
}
