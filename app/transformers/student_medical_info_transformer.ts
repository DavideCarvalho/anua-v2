import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentMedicalInfo from '#models/student_medical_info'

export default class StudentMedicalInfoTransformer extends BaseTransformer<StudentMedicalInfo> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'studentId',
      'conditions',
      'documents',
      'createdAt',
      'updatedAt',
    ])
  }
}
