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
  declare user?: UserDto

  constructor(student?: Student) {
    super()

    if (!student) return

    this.id = student.id
    // Note: Model uses descountPercentage (typo in DB)
    this.discountPercentage = student.descountPercentage
    this.monthlyPaymentAmount = student.monthlyPaymentAmount
    this.isSelfResponsible = student.isSelfResponsible
    this.paymentDate = student.paymentDate
    this.classId = student.classId
    this.contractId = student.contractId
    this.canteenLimit = student.canteenLimit
    this.balance = student.balance
    this.enrollmentStatus = student.enrollmentStatus
    // Note: Student model doesn't have createdAt/updatedAt - they come from User
    this.user = student.user ? new UserDto(student.user) : undefined
  }
}
