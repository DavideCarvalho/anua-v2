import { BaseTransformer } from '@adonisjs/core/transformers'
import type Occurrence from '#models/occurrence'

export default class OccurrenceSchoolListItemTransformer extends BaseTransformer<Occurrence> {
  toObject() {
    return {
      id: this.resource.id,
      type: this.resource.type,
      text: this.resource.text,
      date: this.resource.date?.toISODate() ?? null,
      createdAt: this.resource.createdAt?.toISO() ?? null,
      student: {
        id: this.resource.studentId,
        name: this.resource.student?.user?.name ?? 'Aluno',
      },
      class: {
        id: this.resource.teacherHasClass?.classId ?? '',
        name: this.resource.teacherHasClass?.class?.name ?? '-',
      },
      teacherHasClassId: this.resource.teacherHasClassId,
      teacher: this.resource.teacherHasClass?.teacherId
        ? {
            id: this.resource.teacherHasClass.teacherId,
            name: this.resource.teacherHasClass.teacher?.user?.name ?? null,
          }
        : null,
      subject: this.resource.teacherHasClass?.subjectId
        ? {
            id: this.resource.teacherHasClass.subjectId,
            name: this.resource.teacherHasClass.subject?.name ?? null,
          }
        : null,
      acknowledgedCount: Number(this.resource.$extras.acknowledgements_count ?? 0),
      totalResponsibles: Number(this.resource.$extras.total_responsibles ?? 0),
    }
  }
}
