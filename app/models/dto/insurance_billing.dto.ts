import { BaseModelDto } from '@adocasts.com/dto/base'
import type InsuranceBilling from '#models/insurance_billing'
import type { InsuranceBillingStatus } from '#models/insurance_billing'
import type { DateTime } from 'luxon'

export default class InsuranceBillingDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare period: DateTime
  declare insuredStudentsCount: number
  declare averageTuition: number
  declare insurancePercentage: number
  declare totalAmount: number
  declare status: InsuranceBillingStatus
  declare dueDate: DateTime
  declare paidAt: DateTime | null
  declare invoiceUrl: string | null
  declare paymentGatewayId: string | null
  declare lastReminderSentAt: DateTime | null
  declare notes: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(insuranceBilling?: InsuranceBilling) {
    super()

    if (!insuranceBilling) return

    this.id = insuranceBilling.id
    this.schoolId = insuranceBilling.schoolId
    this.period = insuranceBilling.period
    this.insuredStudentsCount = insuranceBilling.insuredStudentsCount
    this.averageTuition = insuranceBilling.averageTuition
    this.insurancePercentage = insuranceBilling.insurancePercentage
    this.totalAmount = insuranceBilling.totalAmount
    this.status = insuranceBilling.status
    this.dueDate = insuranceBilling.dueDate
    this.paidAt = insuranceBilling.paidAt
    this.invoiceUrl = insuranceBilling.invoiceUrl
    this.paymentGatewayId = insuranceBilling.paymentGatewayId
    this.lastReminderSentAt = insuranceBilling.lastReminderSentAt
    this.notes = insuranceBilling.notes
    this.createdAt = insuranceBilling.createdAt
    this.updatedAt = insuranceBilling.updatedAt
  }
}
