import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasLevel from '#models/student_has_level'
import type { DocusealSignatureStatus } from '#models/student_has_level'
import type { DateTime } from 'luxon'

export default class StudentHasLevelDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare levelAssignedToCourseAcademicPeriodId: string
  declare scholarshipId: string | null
  declare academicPeriodId: string | null
  declare levelId: string | null
  declare classId: string | null
  declare contractId: string | null
  declare contractUrl: string | null
  declare paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | null
  declare enrollmentInstallments: number | null
  declare installments: number | null
  declare paymentDay: number | null
  declare docusealSubmissionId: string | null
  declare docusealSignatureStatus: DocusealSignatureStatus | null
  declare documentSignedAt: DateTime | null
  declare enrollmentPaymentId: string | null
  declare signedContractFilePath: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentHasLevel) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.levelAssignedToCourseAcademicPeriodId = model.levelAssignedToCourseAcademicPeriodId
    this.scholarshipId = model.scholarshipId
    this.academicPeriodId = model.academicPeriodId
    this.levelId = model.levelId
    this.classId = model.classId
    this.contractId = model.contractId
    this.contractUrl = model.contractUrl
    this.paymentMethod = model.paymentMethod
    this.enrollmentInstallments = model.enrollmentInstallments
    this.installments = model.installments
    this.paymentDay = model.paymentDay
    this.docusealSubmissionId = model.docusealSubmissionId
    this.docusealSignatureStatus = model.docusealSignatureStatus
    this.documentSignedAt = model.documentSignedAt
    this.enrollmentPaymentId = model.enrollmentPaymentId
    this.signedContractFilePath = model.signedContractFilePath
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
