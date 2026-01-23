import { BaseModelDto } from '@adocasts.com/dto/base'
import type Teacher from '#models/teacher'
import UserDto from './user.dto.js'
import SubjectDto from './subject.dto.js'

export default class TeacherDto extends BaseModelDto {
  declare id: string
  declare hourlyRate: number
  declare user?: UserDto
  declare subjects?: SubjectDto[]

  constructor(teacher?: Teacher) {
    super()

    if (!teacher) return

    this.id = teacher.id
    this.hourlyRate = teacher.hourlyRate
    this.user = teacher.user ? new UserDto(teacher.user) : undefined
    this.subjects = teacher.subjects ? SubjectDto.fromArray(teacher.subjects) : undefined
  }
}
