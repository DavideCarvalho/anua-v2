import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasAcademicPeriod from '#models/student_has_academic_period'

export default class StudentHasAcademicPeriodDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare academicPeriodId: string
  declare classId: string | null

  constructor(model?: StudentHasAcademicPeriod) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.academicPeriodId = model.academicPeriodId
    this.classId = model.classId
  }
}
