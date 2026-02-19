import { BaseModelDto } from '@adocasts.com/dto/base'
import type ResponsibleUserAcceptedOccurence from '#models/responsible_user_accepted_occurence'

export default class ResponsibleUserAcceptedOccurenceDto extends BaseModelDto {
  declare id: string
  declare responsibleUserId: string
  declare occurenceId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: ResponsibleUserAcceptedOccurence) {
    super()

    if (!model) return

    this.id = model.id
    this.responsibleUserId = model.responsibleUserId
    this.occurenceId = model.occurenceId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
