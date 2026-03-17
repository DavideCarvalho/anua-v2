import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentMedicalInfo from '#models/student_medical_info'
import StudentMedicationTransformer from '#transformers/student_medication_transformer'

export default class StudentMedicalInfoTransformer extends BaseTransformer<StudentMedicalInfo> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'conditions',
        'documents',
        'createdAt',
        'updatedAt',
      ]),
      medications: StudentMedicationTransformer.transform(
        this.whenLoaded(this.resource.medications)
      ),
    }
  }
}
