import { BaseModelDto } from '@adocasts.com/dto/base'
import OccurrenceDto from '#models/dto/occurrence.dto'
import type Occurrence from '#models/occurrence'

interface ConstructorData {
  occurrence: Occurrence
  studentName: string
  className: string
  teacherName: string | null
  subjectName: string | null
  acknowledgedCount: number
  totalResponsibles: number
}

export default class OccurrenceSchoolListItemDto extends BaseModelDto {
  declare id: string
  declare type: string
  declare text: string
  declare date: string | null
  declare createdAt: string | null
  declare student: {
    id: string
    name: string
  }
  declare class: {
    id: string
    name: string
  }
  declare teacherHasClassId: string
  declare teacher: {
    id: string
    name: string | null
  } | null
  declare subject: {
    id: string
    name: string | null
  } | null
  declare acknowledgedCount: number
  declare totalResponsibles: number

  constructor(data: ConstructorData) {
    super()

    const base = new OccurrenceDto(data.occurrence)

    this.id = base.id
    this.type = base.type
    this.text = base.text
    this.date = base.date ? base.date.toISOString().split('T')[0] : null
    this.createdAt = base.createdAt ? base.createdAt.toISOString() : null
    this.student = {
      id: data.occurrence.studentId,
      name: data.studentName,
    }
    this.class = {
      id: data.occurrence.teacherHasClass?.classId || '',
      name: data.className,
    }
    this.teacherHasClassId = base.teacherHasClassId
    this.teacher = data.occurrence.teacherHasClass?.teacherId
      ? {
          id: data.occurrence.teacherHasClass.teacherId,
          name: data.teacherName,
        }
      : null
    this.subject = data.occurrence.teacherHasClass?.subjectId
      ? {
          id: data.occurrence.teacherHasClass.subjectId,
          name: data.subjectName,
        }
      : null
    this.acknowledgedCount = data.acknowledgedCount
    this.totalResponsibles = data.totalResponsibles
  }
}
