import { BaseModelDto } from '@adocasts.com/dto/base'
import type EmployeeBenefit from '#models/employee_benefit'

export default class EmployeeBenefitDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare value: number
  declare description: string | null
  declare deductionPercentage: number
  declare userId: string

  constructor(model?: EmployeeBenefit) {
    super()

    if (!model) return

    this.id = model.id
    this.name = model.name
    this.value = model.value
    this.description = model.description
    this.deductionPercentage = model.deductionPercentage
    this.userId = model.userId
  }
}
