import { BaseTransformer } from '@adonisjs/core/transformers'
import type TeacherHasClass from '#models/teacher_has_class'

export default class OccurrenceTeacherClassTransformer extends BaseTransformer<TeacherHasClass> {
  toObject() {
    return {
      id: this.resource.id,
      teacher: {
        id: this.resource.teacherId,
        name: this.resource.teacher?.user?.name ?? 'Professor',
      },
      class: {
        id: this.resource.classId,
        name: this.resource.class?.name ?? '-',
      },
      subject: {
        id: this.resource.subjectId,
        name: this.resource.subject?.name ?? 'Sem materia',
      },
    }
  }
}
