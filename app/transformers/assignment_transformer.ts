import { BaseTransformer } from '@adonisjs/core/transformers'
import type Assignment from '#models/assignment'
import TeacherHasClassTransformer from '#transformers/teacher_has_class_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'

export default class AssignmentTransformer extends BaseTransformer<Assignment> {
  toObject() {
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
      teacherHasClass: TeacherHasClassTransformer.transform(
        this.whenLoaded(this.resource.teacherHasClass)
      ),
      academicPeriod: AcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.academicPeriod)
      ),
    }
  }
}
