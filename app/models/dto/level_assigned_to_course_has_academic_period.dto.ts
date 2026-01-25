import { BaseModelDto } from '@adocasts.com/dto/base'
import type LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import LevelDto from './level.dto.js'

export default class LevelAssignedToCourseHasAcademicPeriodDto extends BaseModelDto {
  declare id: string
  declare levelId: string
  declare courseHasAcademicPeriodId: string
  declare isActive: boolean
  declare level?: LevelDto

  constructor(levelAssigned?: LevelAssignedToCourseHasAcademicPeriod) {
    super()

    if (!levelAssigned) return

    this.id = levelAssigned.id
    this.levelId = levelAssigned.levelId
    this.courseHasAcademicPeriodId = levelAssigned.courseHasAcademicPeriodId
    this.isActive = levelAssigned.isActive
    this.level = levelAssigned.level ? new LevelDto(levelAssigned.level) : undefined
  }
}
