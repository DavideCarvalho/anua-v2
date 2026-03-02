import { BaseTransformer } from '@adonisjs/core/transformers'
import type Course from '#models/course'
import SchoolTransformer from '#transformers/school_transformer'
import UserTransformer from '#transformers/user_transformer'
import CourseHasAcademicPeriodTransformer from '#transformers/course_has_academic_period_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'

export default class CourseTransformer extends BaseTransformer<Course> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'schoolId',
        'version',
        'coordinatorId',
        'enrollmentMinimumAge',
        'enrollmentMaximumAge',
        'maxStudentsPerClass',
        'createdAt',
        'updatedAt',
      ]),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      coordinator: UserTransformer.transform(this.whenLoaded(this.resource.coordinator)),
      courseAcademicPeriods: CourseHasAcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.courseAcademicPeriods)
      ),
      academicPeriods: AcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.academicPeriods)
      ),
    }
  }
}
