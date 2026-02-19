import { BaseModelDto } from '@adocasts.com/dto/base'
import type Level from '#models/level'
import SchoolDto from './school.dto.js'
import ClassDto from './class.dto.js'

export default class LevelDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare order: number
  declare schoolId: string
  declare contractId: string | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date | null
  declare school?: SchoolDto
  declare classes?: ClassDto[]

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
    this.createdAt = level.createdAt.toJSDate()
    this.updatedAt = level.updatedAt ? level.updatedAt.toJSDate() : null
    this.school = level.school ? new SchoolDto(level.school) : undefined
    this.classes = level.classes?.map((c) => new ClassDto(c))
  }
}
