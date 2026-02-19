import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventParticipant from '#models/event_participant'

export default class EventParticipantDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare userId: string
  declare registrationDate: Date
  declare status: string
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(eventParticipant?: EventParticipant) {
    super()

    if (!eventParticipant) return

    this.id = eventParticipant.id
    this.eventId = eventParticipant.eventId
    this.userId = eventParticipant.userId
    this.registrationDate = eventParticipant.registrationDate.toJSDate()
    this.status = eventParticipant.status
    this.notes = eventParticipant.notes
    this.createdAt = eventParticipant.createdAt.toJSDate()
    this.updatedAt = eventParticipant.updatedAt.toJSDate()
  }
}
