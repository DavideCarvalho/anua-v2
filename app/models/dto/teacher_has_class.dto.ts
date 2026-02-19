import { BaseModelDto } from '@adocasts.com/dto/base'
import type TeacherHasClass from '#models/teacher_has_class'

export default class TeacherHasClassDto extends BaseModelDto {
  declare id: string
  declare teacherId: string
  declare classId: string
  declare subjectId: string
  declare subjectQuantity: number
  declare classWeekDay: string | null
  declare startTime: string | null
  declare endTime: string | null
  declare teacherAvailabilityId: string | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: TeacherHasClass) {
    super()

    if (!model) return

    this.id = model.id
    this.teacherId = model.teacherId
    this.classId = model.classId
    this.subjectId = model.subjectId
    this.subjectQuantity = model.subjectQuantity
    this.classWeekDay = model.classWeekDay
    this.startTime = model.startTime
    this.endTime = model.endTime
    this.teacherAvailabilityId = model.teacherAvailabilityId
    this.isActive = model.isActive
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
