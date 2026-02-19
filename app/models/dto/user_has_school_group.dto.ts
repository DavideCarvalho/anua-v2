import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserHasSchoolGroup from '#models/user_has_school_group'
import type { DateTime } from 'luxon'

export default class UserHasSchoolGroupDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare schoolGroupId: string
  declare createdAt: Date
  declare updatedAt: Date | null

  constructor(model?: UserHasSchoolGroup) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.schoolGroupId = model.schoolGroupId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt?.toJSDate() ?? null
  }
}
