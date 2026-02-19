import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserSchoolGroupSelection from '#models/user_school_group_selection'
import type { DateTime } from 'luxon'

export default class UserSchoolGroupSelectionDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare schoolGroupId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: UserSchoolGroupSelection) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.schoolGroupId = model.schoolGroupId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
