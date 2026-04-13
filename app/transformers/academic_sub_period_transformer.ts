import { BaseTransformer } from '@adonisjs/core/transformers'
import type AcademicSubPeriod from '#models/academic_sub_period'

export default class AcademicSubPeriodTransformer extends BaseTransformer<AcademicSubPeriod> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'order',
        'startDate',
        'endDate',
        'weight',
        'minimumGrade',
        'hasRecovery',
        'recoveryStartDate',
        'recoveryEndDate',
        'academicPeriodId',
        'schoolId',
        'createdAt',
        'updatedAt',
      ]),
    }
  }
}
