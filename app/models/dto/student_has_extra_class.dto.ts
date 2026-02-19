import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasExtraClass from '#models/student_has_extra_class'
import StudentDto from './student.dto.js'
import ExtraClassDto from './extra_class.dto.js'

export default class StudentHasExtraClassDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare extraClassId: string
  declare contractId: string
  declare scholarshipId: string | null
  declare paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  declare paymentDay: number
  declare enrolledAt: Date
  declare cancelledAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare student?: StudentDto
  declare extraClass?: ExtraClassDto

  constructor(model?: StudentHasExtraClass) {
    super()
    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.extraClassId = model.extraClassId
    this.contractId = model.contractId
    this.scholarshipId = model.scholarshipId
    this.paymentMethod = model.paymentMethod
    this.paymentDay = model.paymentDay
    this.enrolledAt = model.enrolledAt.toJSDate()
    this.cancelledAt = model.cancelledAt ? model.cancelledAt.toJSDate() : null
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
    this.student = model.student ? new StudentDto(model.student) : undefined
    this.extraClass = model.extraClass ? new ExtraClassDto(model.extraClass) : undefined
  }
}
