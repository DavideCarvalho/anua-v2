import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentMedication from '#models/student_medication'

export default class StudentMedicationTransformer extends BaseTransformer<StudentMedication> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'medicalInfoId',
      'name',
      'dosage',
      'frequency',
      'instructions',
      'createdAt',
      'updatedAt',
    ])
  }
}
