import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentHasLevel from '#models/student_has_level'
import StudentTransformer from '#transformers/student_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'
import ContractTransformer from '#transformers/contract_transformer'
import ScholarshipTransformer from '#transformers/scholarship_transformer'
import LevelTransformer from '#transformers/level_transformer'
import ClassTransformer from '#transformers/class_transformer'

export default class StudentHasLevelTransformer extends BaseTransformer<StudentHasLevel> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'studentId',
        'levelAssignedToCourseAcademicPeriodId',
        'scholarshipId',
        'academicPeriodId',
        'levelId',
        'classId',
        'contractId',
        'contractUrl',
        'paymentMethod',
        'enrollmentInstallments',
        'installments',
        'paymentDay',
        'docusealSubmissionId',
        'docusealSignatureStatus',
        'documentSignedAt',
        'enrollmentPaymentId',
        'signedContractFilePath',
        'deletedAt',
        'createdAt',
        'updatedAt',
      ]),
      student: StudentTransformer.transform(this.whenLoaded(this.resource.student)),
      academicPeriod: AcademicPeriodTransformer.transform(
        this.whenLoaded(this.resource.academicPeriod)
      ),
      contract: ContractTransformer.transform(this.whenLoaded(this.resource.contract)),
      scholarship: ScholarshipTransformer.transform(this.whenLoaded(this.resource.scholarship)),
      level: LevelTransformer.transform(this.whenLoaded(this.resource.level)),
      class: ClassTransformer.transform(this.whenLoaded(this.resource.class)),
    }
  }
}
