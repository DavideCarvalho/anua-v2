import { BaseTransformer } from '@adonisjs/core/transformers'
import type LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import LevelTransformer from '#transformers/level_transformer'
import CourseHasAcademicPeriodTransformer from '#transformers/course_has_academic_period_transformer'

export default class LevelAssignedToCourseHasAcademicPeriodTransformer extends BaseTransformer<LevelAssignedToCourseHasAcademicPeriod> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'levelId', 'courseHasAcademicPeriodId', 'isActive']),
      level: LevelTransformer.transform(this.whenLoaded(this.resource.level))?.depth(6),
      courseHasAcademicPeriod: CourseHasAcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.courseHasAcademicPeriod)
      )?.depth(6),
    }
  }
}
