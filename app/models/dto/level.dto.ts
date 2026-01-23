import { BaseModelDto } from '@adocasts.com/dto/base'
import type Level from '#models/level'
import type { DateTime } from 'luxon'

export default class LevelDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare order: number
  declare schoolId: string
  declare contractId: string | null
  declare isActive: boolean
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(level?: Level) {
    super()

    if (!level) return

    this.id = level.id
    this.name = level.name
    this.slug = level.slug
    this.order = level.order
    this.schoolId = level.schoolId
    this.contractId = level.contractId
    this.isActive = level.isActive
    this.createdAt = level.createdAt
    this.updatedAt = level.updatedAt
  }
}
