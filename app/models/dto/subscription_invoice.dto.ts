import { BaseModelDto } from '@adocasts.com/dto/base'
import type SubscriptionInvoice from '#models/subscription_invoice'
import type { SubscriptionInvoiceStatus } from '#models/subscription_invoice'

export default class SubscriptionInvoiceDto extends BaseModelDto {
  declare id: string
  declare subscriptionId: string
  declare academicPeriodId: string | null
  declare month: number
  declare year: number
  declare activeStudents: number
  declare amount: number
  declare status: SubscriptionInvoiceStatus
  declare dueDate: Date
  declare paidAt: Date | null
  declare invoiceUrl: string | null
  declare paymentGatewayId: string | null
  declare description: string | null
  declare paymentMethodSnapshot: string | null
  declare creditCardLastFourDigits: string | null
  declare creditCardBrand: string | null
  declare metadata: Record<string, unknown> | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(subscriptionInvoice?: SubscriptionInvoice) {
    super()

    if (!subscriptionInvoice) return

    this.id = subscriptionInvoice.id
    this.subscriptionId = subscriptionInvoice.subscriptionId
    this.academicPeriodId = subscriptionInvoice.academicPeriodId
    this.month = subscriptionInvoice.month
    this.year = subscriptionInvoice.year
    this.activeStudents = subscriptionInvoice.activeStudents
    this.amount = subscriptionInvoice.amount
    this.status = subscriptionInvoice.status
    this.dueDate = subscriptionInvoice.dueDate.toJSDate()
    this.paidAt = subscriptionInvoice.paidAt ? subscriptionInvoice.paidAt.toJSDate() : null
    this.invoiceUrl = subscriptionInvoice.invoiceUrl
    this.paymentGatewayId = subscriptionInvoice.paymentGatewayId
    this.description = subscriptionInvoice.description
    this.paymentMethodSnapshot = subscriptionInvoice.paymentMethodSnapshot
    this.creditCardLastFourDigits = subscriptionInvoice.creditCardLastFourDigits
    this.creditCardBrand = subscriptionInvoice.creditCardBrand
    this.metadata = subscriptionInvoice.metadata
    this.createdAt = subscriptionInvoice.createdAt.toJSDate()
    this.updatedAt = subscriptionInvoice.updatedAt.toJSDate()
  }
}
