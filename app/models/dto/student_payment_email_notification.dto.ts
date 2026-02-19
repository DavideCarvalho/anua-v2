import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentPaymentEmailNotification from '#models/student_payment_email_notification'
import type { DateTime } from 'luxon'

export default class StudentPaymentEmailNotificationDto extends BaseModelDto {
  declare id: string
  declare studentPaymentId: string
  declare emailType: string
  declare recipients: Record<string, unknown>
  declare daysOverdue: number | null
  declare metadata: Record<string, unknown> | null
  declare sentAt: DateTime

  constructor(studentPaymentEmailNotification?: StudentPaymentEmailNotification) {
    super()

    if (!studentPaymentEmailNotification) return

    this.id = studentPaymentEmailNotification.id
    this.studentPaymentId = studentPaymentEmailNotification.studentPaymentId
    this.emailType = studentPaymentEmailNotification.emailType
    this.recipients = studentPaymentEmailNotification.recipients
    this.daysOverdue = studentPaymentEmailNotification.daysOverdue
    this.metadata = studentPaymentEmailNotification.metadata
    this.sentAt = studentPaymentEmailNotification.sentAt
  }
}
