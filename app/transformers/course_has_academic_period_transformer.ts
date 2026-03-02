import { BaseTransformer } from '@adonisjs/core/transformers'
import type CourseHasAcademicPeriod from '#models/course_has_academic_period'

export default class CourseHasAcademicPeriodTransformer extends BaseTransformer<CourseHasAcademicPeriod> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'courseId',
      'academicPeriodId',
      'createdAt',
      'updatedAt',
    ])
  }
}
