import { BaseModelDto } from '@adocasts.com/dto/base'
import type ResponsibleUserAcceptedOccurence from '#models/responsible_user_accepted_occurence'
import type { DateTime } from 'luxon'

export default class ResponsibleUserAcceptedOccurenceDto extends BaseModelDto {
  declare id: string
  declare responsibleUserId: string
  declare occurenceId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: ResponsibleUserAcceptedOccurence) {
    super()

    if (!model) return

    this.id = model.id
    this.responsibleUserId = model.responsibleUserId
    this.occurenceId = model.occurenceId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
