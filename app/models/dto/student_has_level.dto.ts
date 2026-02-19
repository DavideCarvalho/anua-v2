import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasLevel from '#models/student_has_level'
import type { DocusealSignatureStatus } from '#models/student_has_level'
import type { DateTime } from 'luxon'
import AcademicPeriodDto from './academic_period.dto.js'
import { ContractDto } from './contract.dto.js'
import ScholarshipDto from './scholarship.dto.js'
import LevelDto from './level.dto.js'
import ClassDto from './class.dto.js'

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

  declare academicPeriod?: AcademicPeriodDto
  declare contract?: ContractDto
  declare scholarship?: ScholarshipDto
  declare level?: LevelDto
  declare class?: ClassDto

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

    this.academicPeriod = model.academicPeriod
      ? new AcademicPeriodDto(model.academicPeriod)
      : undefined
    this.contract = model.contract ? new ContractDto(model.contract) : undefined
    this.scholarship = model.scholarship ? new ScholarshipDto(model.scholarship) : undefined
    this.level = model.level ? new LevelDto(model.level) : undefined
    this.class = model.class ? new ClassDto(model.class) : undefined
  }
}
