import { BaseTransformer } from '@adonisjs/core/transformers'
import type StudentHasLevel from '#models/student_has_level'
import StudentTransformer from '#transformers/student_transformer'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'
import ContractTransformer from '#transformers/contract_transformer'
import ScholarshipTransformer from '#transformers/scholarship_transformer'
import LevelTransformer from '#transformers/level_transformer'
import ClassTransformer from '#transformers/class_transformer'
import type IndividualDiscount from '#models/individual_discount'

export default class StudentHasLevelTransformer extends BaseTransformer<StudentHasLevel> {
  toObject() {
    const individualDiscounts = Array.isArray(this.resource.$preloaded.individualDiscounts)
      ? (this.resource.$preloaded.individualDiscounts as IndividualDiscount[])
      : []

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
      individualDiscounts: individualDiscounts.map((discount) => ({
        id: discount.id,
        name: discount.name,
        discountType: discount.discountType,
        discountPercentage: discount.discountPercentage,
        discountValue: discount.discountValue,
        validUntil: discount.validUntil,
        isActive: discount.isActive,
      })),
      level: LevelTransformer.transform(this.whenLoaded(this.resource.level)),
      class: ClassTransformer.transform(this.whenLoaded(this.resource.class)),
    }
  }
}
