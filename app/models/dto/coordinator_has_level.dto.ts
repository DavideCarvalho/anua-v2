import { BaseModelDto } from '@adocasts.com/dto/base'
import type CoordinatorHasLevel from '#models/coordinator_has_level'
import type { DateTime } from 'luxon'

export default class CoordinatorHasLevelDto extends BaseModelDto {
  declare id: string
  declare coordinatorId: string
  declare levelAssignedToCourseHasAcademicPeriodId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: CoordinatorHasLevel) {
    super()

    if (!model) return

    this.id = model.id
    this.coordinatorId = model.coordinatorId
    this.levelAssignedToCourseHasAcademicPeriodId = model.levelAssignedToCourseHasAcademicPeriodId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
