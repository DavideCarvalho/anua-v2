import { BaseModelDto } from '@adocasts.com/dto/base'
import type Subject from '#models/subject'
import SchoolDto from './school.dto.js'

export default class SubjectDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare quantityNeededScheduled: number
  declare schoolId: string
  declare createdAt: Date
  declare updatedAt: Date
  declare school?: SchoolDto

  constructor(subject?: Subject) {
    super()

    if (!subject) return

    this.id = subject.id
    this.name = subject.name
    this.slug = subject.slug
    this.quantityNeededScheduled = subject.quantityNeededScheduled
    this.schoolId = subject.schoolId
    this.createdAt = subject.createdAt.toJSDate()
    this.updatedAt = subject.updatedAt.toJSDate()
    this.school = subject.school ? new SchoolDto(subject.school) : undefined
  }
}
