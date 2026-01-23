import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserHasSchool from '#models/user_has_school'
import type { DateTime } from 'luxon'

export default class UserHasSchoolDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare schoolId: string
  declare isDefault: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(model?: UserHasSchool) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.schoolId = model.schoolId
    this.isDefault = model.isDefault
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
