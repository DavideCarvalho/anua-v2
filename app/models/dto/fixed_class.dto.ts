import { BaseModelDto } from '@adocasts.com/dto/base'
import type FixedClass from '#models/fixed_class'
import type { DateTime } from 'luxon'

export default class FixedClassDto extends BaseModelDto {
  declare id: string
  declare classScheduleId: string
  declare teacherId: string
  declare classId: string
  declare subjectId: string
  declare subjectQuantity: number
  declare classWeekDay: string
  declare startTime: string
  declare endTime: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(fixedClass?: FixedClass) {
    super()

    if (!fixedClass) return

    this.id = fixedClass.id
    this.classScheduleId = fixedClass.classScheduleId
    this.teacherId = fixedClass.teacherId
    this.classId = fixedClass.classId
    this.subjectId = fixedClass.subjectId
    this.subjectQuantity = fixedClass.subjectQuantity
    this.classWeekDay = fixedClass.classWeekDay
    this.startTime = fixedClass.startTime
    this.endTime = fixedClass.endTime
    this.createdAt = fixedClass.createdAt
    this.updatedAt = fixedClass.updatedAt
  }
}
