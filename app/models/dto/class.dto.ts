import { BaseModelDto } from '@adocasts.com/dto/base'
import type Class_ from '#models/class'
import type { DateTime } from 'luxon'

export default class ClassDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare schoolId: string
  declare levelId: string | null
  declare isArchived: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: Class_) {
    super()

    if (!model) return

    this.id = model.id
    this.name = model.name
    this.slug = model.slug
    this.schoolId = model.schoolId
    this.levelId = model.levelId
    this.isArchived = model.isArchived
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
