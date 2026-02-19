import { BaseModelDto } from '@adocasts.com/dto/base'
import type Occurrence from '#models/occurrence'
import type { OccurenceType } from '#models/occurrence'
import type { DateTime } from 'luxon'

export default class OccurrenceDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare teacherHasClassId: string
  declare type: OccurenceType
  declare text: string
  declare date: Date
  declare createdAt: Date
  declare updatedAt: Date

  constructor(occurrence?: Occurrence) {
    super()

    if (!occurrence) return

    this.id = occurrence.id
    this.studentId = occurrence.studentId
    this.teacherHasClassId = occurrence.teacherHasClassId
    this.type = occurrence.type
    this.text = occurrence.text
    this.date = occurrence.date.toJSDate()
    this.createdAt = occurrence.createdAt.toJSDate()
    this.updatedAt = occurrence.updatedAt.toJSDate()
  }
}
