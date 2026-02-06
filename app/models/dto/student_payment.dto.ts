import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentPayment from '#models/student_payment'
import type { DateTime } from 'luxon'
import StudentDto from './student.dto.js'

export default class StudentPaymentDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare amount: number
  declare month: number
  declare year: number
  declare type:
    | 'ENROLLMENT'
    | 'TUITION'
    | 'CANTEEN'
    | 'COURSE'
    | 'AGREEMENT'
    | 'STUDENT_LOAN'
    | 'STORE'
    | 'EXTRA_CLASS'
    | 'OTHER'
  declare status:
    | 'NOT_PAID'
    | 'PENDING'
    | 'PAID'
    | 'OVERDUE'
    | 'CANCELLED'
    | 'FAILED'
    | 'RENEGOTIATED'
  declare totalAmount: number
  declare dueDate: DateTime
  declare installments: number
  declare installmentNumber: number
  declare discountPercentage: number
  declare paidAt: DateTime | null
  declare emailSentAt: DateTime | null
  declare contractId: string
  declare classHasAcademicPeriodId: string | null
  declare studentHasLevelId: string | null
  declare invoiceUrl: string | null
  declare paymentGatewayId: string | null
  declare paymentGateway: 'ASAAS' | 'CUSTOM' | null
  declare metadata: Record<string, unknown> | null
  declare agreementId: string | null
  declare invoiceId: string | null
  declare insuranceBillingId: string | null
  declare studentHasExtraClassId: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare student?: StudentDto

  constructor(studentPayment?: StudentPayment) {
    super()

    if (!studentPayment) return

    this.id = studentPayment.id
    this.studentId = studentPayment.studentId
    this.amount = studentPayment.amount
    this.month = studentPayment.month
    this.year = studentPayment.year
    this.type = studentPayment.type
    this.status = studentPayment.status
    this.totalAmount = studentPayment.totalAmount
    this.dueDate = studentPayment.dueDate
    this.installments = studentPayment.installments
    this.installmentNumber = studentPayment.installmentNumber
    this.discountPercentage = studentPayment.discountPercentage
    this.paidAt = studentPayment.paidAt
    this.emailSentAt = studentPayment.emailSentAt
    this.contractId = studentPayment.contractId
    this.classHasAcademicPeriodId = studentPayment.classHasAcademicPeriodId
    this.studentHasLevelId = studentPayment.studentHasLevelId
    this.invoiceUrl = studentPayment.invoiceUrl
    this.paymentGatewayId = studentPayment.paymentGatewayId
    this.paymentGateway = studentPayment.paymentGateway
    this.metadata = studentPayment.metadata
    this.agreementId = studentPayment.agreementId
    this.invoiceId = studentPayment.invoiceId
    this.insuranceBillingId = studentPayment.insuranceBillingId
    this.studentHasExtraClassId = studentPayment.studentHasExtraClassId
    this.createdAt = studentPayment.createdAt
    this.updatedAt = studentPayment.updatedAt
    this.student = studentPayment.student ? new StudentDto(studentPayment.student) : undefined
  }
}
