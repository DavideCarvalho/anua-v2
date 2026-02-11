import { BaseModelDto } from '@adocasts.com/dto/base'
import type TeacherHasClass from '#models/teacher_has_class'

export default class OccurrenceTeacherClassDto extends BaseModelDto {
  declare id: string
  declare teacher: { id: string; name: string }
  declare class: { id: string; name: string }
  declare subject: { id: string; name: string }

  constructor(model: TeacherHasClass) {
    super()

    this.id = model.id
    this.teacher = {
      id: model.teacherId,
      name: model.teacher?.user?.name || 'Professor',
    }
    this.class = {
      id: model.classId,
      name: model.class?.name || '-',
    }
    this.subject = {
      id: model.subjectId,
      name: model.subject?.name || 'Sem materia',
    }
  }
}
