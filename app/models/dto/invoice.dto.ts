import { BaseModelDto } from '@adocasts.com/dto/base'
import type Invoice from '#models/invoice'
import type { DateTime } from 'luxon'
import StudentDto from './student.dto.js'
import StudentPaymentDto from './student_payment.dto.js'

export default class InvoiceDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare contractId: string
  declare type: 'MONTHLY' | 'UPFRONT'
  declare month: number | null
  declare year: number | null
  declare dueDate: DateTime
  declare status: 'OPEN' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'RENEGOTIATED'
  declare totalAmount: number
  declare netAmountReceived: number | null
  declare paidAt: DateTime | null
  declare paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH' | 'OTHER' | null
  declare paymentGatewayId: string | null
  declare paymentGateway: 'ASAAS' | 'CUSTOM' | null
  declare observation: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime
  declare student?: StudentDto
  declare payments?: StudentPaymentDto[]

  constructor(invoice?: Invoice) {
    super()

    if (!invoice) return

    this.id = invoice.id
    this.studentId = invoice.studentId
    this.contractId = invoice.contractId
    this.type = invoice.type
    this.month = invoice.month
    this.year = invoice.year
    this.dueDate = invoice.dueDate
    this.status = invoice.status
    this.totalAmount = invoice.totalAmount
    this.netAmountReceived = invoice.netAmountReceived
    this.paidAt = invoice.paidAt
    this.paymentMethod = invoice.paymentMethod
    this.paymentGatewayId = invoice.paymentGatewayId
    this.paymentGateway = invoice.paymentGateway
    this.observation = invoice.observation
    this.createdAt = invoice.createdAt
    this.updatedAt = invoice.updatedAt
    this.student = invoice.student ? new StudentDto(invoice.student) : undefined
    // Filter out cancelled/renegotiated payments from the main list
    this.payments = invoice.payments
      ?.filter((p) => !['CANCELLED', 'RENEGOTIATED'].includes(p.status))
      .map((p) => new StudentPaymentDto(p))
  }
}
