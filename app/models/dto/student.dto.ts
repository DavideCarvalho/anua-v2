import { BaseModelDto } from '@adocasts.com/dto/base'
import type Student from '#models/student'
import UserDto from './user.dto.js'

export default class StudentDto extends BaseModelDto {
  declare id: string
  declare discountPercentage: number
  declare monthlyPaymentAmount: number
  declare isSelfResponsible: boolean
  declare paymentDate: number | null
  declare classId: string | null
  declare contractId: string | null
  declare canteenLimit: number | null
  declare balance: number
  declare enrollmentStatus: string
  declare createdAt: string
  declare updatedAt: string
  declare user?: UserDto

  constructor(student?: Student) {
    super()

    if (!student) return

    this.id = student.id
    this.discountPercentage = student.discountPercentage
    this.monthlyPaymentAmount = student.monthlyPaymentAmount
    this.isSelfResponsible = student.isSelfResponsible
    this.paymentDate = student.paymentDate
    this.classId = student.classId
    this.contractId = student.contractId
    this.canteenLimit = student.canteenLimit
    this.balance = student.balance
    this.enrollmentStatus = student.enrollmentStatus
    this.createdAt = student.createdAt.toISO()!
    this.updatedAt = student.updatedAt.toISO()!
    this.user = student.user ? new UserDto(student.user) : undefined
  }
}
