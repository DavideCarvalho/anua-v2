import { BaseTransformer } from '@adonisjs/core/transformers'
import type Assignment from '#models/assignment'
import TeacherHasClassTransformer from '#transformers/teacher_has_class_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'

export default class AssignmentTransformer extends BaseTransformer<Assignment> {
  toObject() {
    const teacherHasClass = this.whenLoaded(this.resource.teacherHasClass)
    const teacherHasClassResource = teacherHasClass as
      | {
          class?: { id: string; name: string }
          subject?: { id: string; name: string }
        }
      | undefined

    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'description',
        'dueDate',
        'grade',
        'teacherHasClassId',
        'academicPeriodId',
        'createdAt',
        'updatedAt',
      ]),
      title: this.resource.name,
      maxScore: this.resource.grade,
      class: teacherHasClassResource?.class
        ? this.pick(teacherHasClassResource.class, ['id', 'name'])
        : null,
      subject: teacherHasClassResource?.subject
        ? this.pick(teacherHasClassResource.subject, ['id', 'name'])
        : null,
      teacherHasClass: TeacherHasClassTransformer.transform(teacherHasClass)?.depth(6),
      academicPeriod: AcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.academicPeriod)
      ),
      submissionsCount:
        (this.resource as { $extras?: { submissionsCount?: number } }).$extras?.submissionsCount ??
        0,
    }
  }
}
