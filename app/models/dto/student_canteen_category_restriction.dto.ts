import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentCanteenCategoryRestriction from '#models/student_canteen_category_restriction'

export default class StudentCanteenCategoryRestrictionDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare category: string
  declare createdBy: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: StudentCanteenCategoryRestriction) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.category = model.category
    this.createdBy = model.createdBy
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
