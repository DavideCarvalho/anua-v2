import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserSchoolSelection from '#models/user_school_selection'
import type { DateTime } from 'luxon'

export default class UserSchoolSelectionDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare schoolId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: UserSchoolSelection) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.schoolId = model.schoolId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
