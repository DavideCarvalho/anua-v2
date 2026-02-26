import { BaseModelDto } from '@adocasts.com/dto/base'
import type TeacherHasSubject from '#models/teacher_has_subject'
import SubjectDto from './subject.dto.js'

export default class TeacherHasSubjectDto extends BaseModelDto {
  declare id: string
  declare teacherId: string
  declare subjectId: string
  declare subject?: SubjectDto

  constructor(model?: TeacherHasSubject) {
    super()

    if (!model) return

    this.id = model.id
    this.teacherId = model.teacherId
    this.subjectId = model.subjectId
    this.subject = model.subject ? new SubjectDto(model.subject) : undefined
  }
}
