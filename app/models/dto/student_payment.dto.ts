import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentPayment from '#models/student_payment'
import StudentDto from './student.dto.js'
import StudentHasExtraClassDto from './student_has_extra_class.dto.js'

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
  declare dueDate: Date
  declare installments: number
  declare installmentNumber: number
  declare discountPercentage: number
  declare discountType: 'PERCENTAGE' | 'FLAT'
  declare discountValue: number
  declare paidAt: Date | null
  declare emailSentAt: Date | null
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
  declare createdAt: Date
  declare updatedAt: Date
  declare student?: StudentDto
  declare studentHasExtraClass?: StudentHasExtraClassDto

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
    this.dueDate = studentPayment.dueDate.toJSDate()
    this.installments = studentPayment.installments
    this.installmentNumber = studentPayment.installmentNumber
    this.discountPercentage = studentPayment.discountPercentage
    this.discountType = studentPayment.discountType
    this.discountValue = studentPayment.discountValue
    this.paidAt = studentPayment.paidAt ? studentPayment.paidAt.toJSDate() : null
    this.emailSentAt = studentPayment.emailSentAt ? studentPayment.emailSentAt.toJSDate() : null
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
    this.createdAt = studentPayment.createdAt.toJSDate()
    this.updatedAt = studentPayment.updatedAt.toJSDate()
    this.student = studentPayment.student ? new StudentDto(studentPayment.student) : undefined
    this.studentHasExtraClass = studentPayment.studentHasExtraClass
      ? new StudentHasExtraClassDto(studentPayment.studentHasExtraClass)
      : undefined
  }
}
