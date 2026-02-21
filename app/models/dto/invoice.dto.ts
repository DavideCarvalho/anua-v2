import { BaseModelDto } from '@adocasts.com/dto/base'
import type Invoice from '#models/invoice'
import StudentDto from './student.dto.js'
import StudentPaymentDto from './student_payment.dto.js'

export default class InvoiceDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare contractId: string | null
  declare type: 'MONTHLY' | 'UPFRONT'
  declare month: number | null
  declare year: number | null
  declare dueDate: Date
  declare status: 'OPEN' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'RENEGOTIATED'
  declare baseAmount: number
  declare discountAmount: number
  declare fineAmount: number
  declare interestAmount: number
  declare totalAmount: number
  declare netAmountReceived: number | null
  declare paidAt: Date | null
  declare paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH' | 'OTHER' | null
  declare paymentGatewayId: string | null
  declare paymentGateway: 'ASAAS' | 'CUSTOM' | null
  declare invoiceUrl: string | null
  declare observation: string | null
  declare nfseStatus:
    | 'SCHEDULED'
    | 'AUTHORIZED'
    | 'PROCESSING_CANCELLATION'
    | 'CANCELLED'
    | 'CANCELLATION_DENIED'
    | 'ERROR'
    | null
  declare nfsePdfUrl: string | null
  declare nfseXmlUrl: string | null
  declare createdAt: Date
  declare updatedAt: Date
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
    this.dueDate = invoice.dueDate.toJSDate()
    this.status = invoice.status
    this.baseAmount = invoice.baseAmount
    this.discountAmount = invoice.discountAmount
    this.fineAmount = invoice.fineAmount
    this.interestAmount = invoice.interestAmount
    this.totalAmount = invoice.totalAmount
    this.netAmountReceived = invoice.netAmountReceived
    this.paidAt = invoice.paidAt ? invoice.paidAt.toJSDate() : null
    this.paymentMethod = invoice.paymentMethod
    this.paymentGatewayId = invoice.paymentGatewayId
    this.paymentGateway = invoice.paymentGateway
    this.invoiceUrl = invoice.invoiceUrl
    this.observation = invoice.observation
    this.nfseStatus = invoice.nfseStatus
    this.nfsePdfUrl = invoice.nfsePdfUrl
    this.nfseXmlUrl = invoice.nfseXmlUrl
    this.createdAt = invoice.createdAt.toJSDate()
    this.updatedAt = invoice.updatedAt.toJSDate()
    this.student = invoice.student ? new StudentDto(invoice.student) : undefined
    // Filter out cancelled/renegotiated payments from the main list
    this.payments = invoice.payments
      ?.filter((p) => !['CANCELLED', 'RENEGOTIATED'].includes(p.status))
      .map((p) => new StudentPaymentDto(p))
  }
}
