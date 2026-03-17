import { BaseTransformer } from '@adonisjs/core/transformers'
import type ExtraClass from '#models/extra_class'
import ExtraClassScheduleTransformer from '#transformers/extra_class_schedule_transformer'
import ContractTransformer from '#transformers/contract_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'
import TeacherTransformer from '#transformers/teacher_transformer'

export default class ExtraClassTransformer extends BaseTransformer<ExtraClass> {
  toObject() {
    const enrollmentsCount = (this.resource.$extras as Record<string, unknown>)?.enrollments_count

    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'description',
        'schoolId',
        'academicPeriodId',
        'contractId',
        'teacherId',
        'maxStudents',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
      schedules: ExtraClassScheduleTransformer.transform(this.whenLoaded(this.resource.schedules)),
      contract: ContractTransformer.transform(this.whenLoaded(this.resource.contract))?.depth(6),
      academicPeriod: AcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.academicPeriod)
      )?.depth(6),
      teacher: TeacherTransformer.transform(this.whenLoaded(this.resource.teacher))?.depth(6),
      teacherName: this.resource.teacher?.user?.name,
      enrollmentCount: enrollmentsCount ? Number(enrollmentsCount) : undefined,
    }
  }
}
