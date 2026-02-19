import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserHasSchool from '#models/user_has_school'

export default class UserHasSchoolDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare schoolId: string
  declare isDefault: boolean
  declare createdAt: Date
  declare updatedAt: Date | null

  constructor(model?: UserHasSchool) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.schoolId = model.schoolId
    this.isDefault = model.isDefault
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt ? model.updatedAt.toJSDate() : null
  }
}
