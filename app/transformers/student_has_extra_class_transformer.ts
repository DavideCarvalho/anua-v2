import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentHasExtraClass from '#models/student_has_extra_class'
import StudentTransformer from '#transformers/student_transformer'

export default class StudentHasExtraClassTransformer extends BaseTransformer<StudentHasExtraClass> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'extraClassId',
        'contractId',
        'scholarshipId',
        'paymentMethod',
        'paymentDay',
        'enrolledAt',
        'cancelledAt',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student))?.depth(2),
      extraClass: this.whenLoaded(this.resource.extraClass),
    }
  }
}
