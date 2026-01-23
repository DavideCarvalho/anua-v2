import { BaseModelDto } from '@adocasts.com/dto/base'
import type Subject from '#models/subject'
import type { DateTime } from 'luxon'

export default class SubjectDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare quantityNeededScheduled: number
  declare schoolId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(subject?: Subject) {
    super()

    if (!subject) return

    this.id = subject.id
    this.name = subject.name
    this.slug = subject.slug
    this.quantityNeededScheduled = subject.quantityNeededScheduled
    this.schoolId = subject.schoolId
    this.createdAt = subject.createdAt
    this.updatedAt = subject.updatedAt
  }
}
