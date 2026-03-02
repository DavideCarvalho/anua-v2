import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentEmergencyContact from '#models/student_emergency_contact'

export default class StudentEmergencyContactTransformer extends BaseTransformer<StudentEmergencyContact> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'studentId',
      'userId',
      'name',
      'phone',
      'relationship',
      'order',
      'createdAt',
      'updatedAt',
    ])
  }
}
