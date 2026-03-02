import { BaseTransformer } from '@adonisjs/core/transformers'
import type CourseHasAcademicPeriod from '#models/course_has_academic_period'
import CourseTransformer from '#transformers/course_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'
import LevelAssignedToCourseHasAcademicPeriodTransformer from '#transformers/level_assigned_to_course_has_academic_period_transformer'

export default class CourseHasAcademicPeriodTransformer extends BaseTransformer<CourseHasAcademicPeriod> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'courseId', 'academicPeriodId', 'createdAt', 'updatedAt']),
      course: CourseTransformer.transform(this.whenLoaded(this.resource.course))?.depth(2),
      academicPeriod: AcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.academicPeriod)
      ),
      levelAssignments: LevelAssignedToCourseHasAcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.levelAssignments)
      )?.depth(6),
    }
  }
}
