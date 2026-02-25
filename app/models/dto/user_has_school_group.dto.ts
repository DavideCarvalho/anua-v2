import { BaseModelDto } from '@adocasts.com/dto/base'
import type UserHasSchoolGroup from '#models/user_has_school_group'
import UserDto from './user.dto.js'
import SchoolGroupDto from './school_group.dto.js'

export default class UserHasSchoolGroupDto extends BaseModelDto {
  declare id: string
  declare userId: string
  declare schoolGroupId: string
  declare createdAt: Date
  declare updatedAt: Date | null
  declare user?: UserDto
  declare schoolGroup?: SchoolGroupDto

  constructor(model?: UserHasSchoolGroup) {
    super()

    if (!model) return

    this.id = model.id
    this.userId = model.userId
    this.schoolGroupId = model.schoolGroupId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt ? model.updatedAt.toJSDate() : null
    this.user = model.user ? new UserDto(model.user) : undefined
    this.schoolGroup = model.schoolGroup ? new SchoolGroupDto(model.schoolGroup) : undefined
  }
}
