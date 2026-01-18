import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasResponsible from '#models/student_has_responsible'
import UserDto from './user.dto.js'
import StudentDto from './student.dto.js'

export class StudentHasResponsibleDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare responsibleId: string
  declare isPedagogical: boolean
  declare isFinancial: boolean
  declare createdAt: string
  declare updatedAt: string
  declare responsible?: UserDto
  declare student?: StudentDto

  constructor(instance?: StudentHasResponsible) {
    super()

    if (!instance) return

    this.id = instance.id
    this.studentId = instance.studentId
    this.responsibleId = instance.responsibleId
    this.isPedagogical = instance.isPedagogical
    this.isFinancial = instance.isFinancial
    this.createdAt = instance.createdAt.toISO()!
    this.updatedAt = instance.updatedAt.toISO()!
    this.responsible = instance.responsible ? new UserDto(instance.responsible) : undefined
    this.student = instance.student ? new StudentDto(instance.student) : undefined
  }
}

export class AssignResponsibleDto extends BaseModelDto {
  declare studentId: string
  declare responsibleId: string
  declare isPedagogical?: boolean
  declare isFinancial?: boolean

  constructor(data: {
    studentId: string
    responsibleId: string
    isPedagogical?: boolean
    isFinancial?: boolean
  }) {
    super()
    this.studentId = data.studentId
    this.responsibleId = data.responsibleId
    this.isPedagogical = data.isPedagogical
    this.isFinancial = data.isFinancial
  }
}

export class UpdateResponsibleAssignmentDto extends BaseModelDto {
  declare isPedagogical?: boolean
  declare isFinancial?: boolean

  constructor(data: { isPedagogical?: boolean; isFinancial?: boolean }) {
    super()
    this.isPedagogical = data.isPedagogical
    this.isFinancial = data.isFinancial
  }
}
