import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolHasGroup from '#models/school_has_group'

export default class SchoolHasGroupDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare schoolGroupId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: SchoolHasGroup) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.schoolGroupId = model.schoolGroupId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
