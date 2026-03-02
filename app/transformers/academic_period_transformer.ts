import { BaseTransformer } from '@adonisjs/core/transformers'
import type AcademicPeriod from '#models/academic_period'
import SchoolTransformer from '#transformers/school_transformer'
import CourseHasAcademicPeriodTransformer from '#transformers/course_has_academic_period_transformer'

export default class AcademicPeriodTransformer extends BaseTransformer<AcademicPeriod> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'startDate',
        'endDate',
        'enrollmentStartDate',
        'enrollmentEndDate',
        'isActive',
        'segment',
        'isClosed',
        'minimumGradeOverride',
        'minimumAttendanceOverride',
        'schoolId',
        'previousAcademicPeriodId',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      courseAcademicPeriods: CourseHasAcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.courseAcademicPeriods)
      )?.depth(2),
    }
  }
}
