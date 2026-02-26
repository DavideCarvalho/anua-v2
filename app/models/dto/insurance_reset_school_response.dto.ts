import { BaseModelDto } from '@adocasts.com/dto/base'
import type School from '#models/school'

export default class InsuranceResetSchoolResponseDto extends BaseModelDto {
  declare id: string

  constructor(school?: School) {
    super()

    if (!school) return

    this.id = school.id
  }
}
