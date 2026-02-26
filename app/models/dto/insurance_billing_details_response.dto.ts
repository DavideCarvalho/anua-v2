import { BaseModelDto } from '@adocasts.com/dto/base'

export default class InsuranceBillingDetailsResponseDto extends BaseModelDto {
  declare id: string
  declare period: string
  declare insuredStudentsCount: number
  declare averageTuition: number
  declare insurancePercentage: number
  declare totalAmount: number
  declare status: string
  declare dueDate: string
  declare paidAt: string | null
  declare invoiceUrl: string | null
  declare paymentGatewayId: string | null
  declare notes: string | null
  declare school: {
    id: string
    name: string
  }
  declare studentPayments: Array<{
    id: string
    amount: number
    month: number
    year: number
    dueDate: string
    status: string
    student: {
      id: string
      name: string
    }
  }>

  constructor(payload?: {
    id: string
    period: string
    insuredStudentsCount: number
    averageTuition: number
    insurancePercentage: number
    totalAmount: number
    status: string
    dueDate: string
    paidAt: string | null
    invoiceUrl: string | null
    paymentGatewayId: string | null
    notes: string | null
    school: { id: string; name: string }
    studentPayments: Array<{
      id: string
      amount: number
      month: number
      year: number
      dueDate: string
      status: string
      student: { id: string; name: string }
    }>
  }) {
    super()

    if (!payload) return

    this.id = payload.id
    this.period = payload.period
    this.insuredStudentsCount = payload.insuredStudentsCount
    this.averageTuition = payload.averageTuition
    this.insurancePercentage = payload.insurancePercentage
    this.totalAmount = payload.totalAmount
    this.status = payload.status
    this.dueDate = payload.dueDate
    this.paidAt = payload.paidAt
    this.invoiceUrl = payload.invoiceUrl
    this.paymentGatewayId = payload.paymentGatewayId
    this.notes = payload.notes
    this.school = payload.school
    this.studentPayments = payload.studentPayments
  }
}
