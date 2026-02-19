import { BaseModelDto } from '@adocasts.com/dto/base'
import type InsuranceBilling from '#models/insurance_billing'
import type { InsuranceBillingStatus } from '#models/insurance_billing'

export default class InsuranceBillingDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare period: Date
  declare insuredStudentsCount: number
  declare averageTuition: number
  declare insurancePercentage: number
  declare totalAmount: number
  declare status: InsuranceBillingStatus
  declare dueDate: Date
  declare paidAt: Date | null
  declare invoiceUrl: string | null
  declare paymentGatewayId: string | null
  declare lastReminderSentAt: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date | null

  constructor(insuranceBilling?: InsuranceBilling) {
    super()

    if (!insuranceBilling) return

    this.id = insuranceBilling.id
    this.schoolId = insuranceBilling.schoolId
    this.period = insuranceBilling.period.toJSDate()
    this.insuredStudentsCount = insuranceBilling.insuredStudentsCount
    this.averageTuition = insuranceBilling.averageTuition
    this.insurancePercentage = insuranceBilling.insurancePercentage
    this.totalAmount = insuranceBilling.totalAmount
    this.status = insuranceBilling.status
    this.dueDate = insuranceBilling.dueDate.toJSDate()
    this.paidAt = insuranceBilling.paidAt ? insuranceBilling.paidAt.toJSDate() : null
    this.invoiceUrl = insuranceBilling.invoiceUrl
    this.paymentGatewayId = insuranceBilling.paymentGatewayId
    this.lastReminderSentAt = insuranceBilling.lastReminderSentAt
      ? insuranceBilling.lastReminderSentAt.toJSDate()
      : null
    this.notes = insuranceBilling.notes
    this.createdAt = insuranceBilling.createdAt.toJSDate()
    this.updatedAt = insuranceBilling.updatedAt ? insuranceBilling.updatedAt.toJSDate() : null
  }
}
