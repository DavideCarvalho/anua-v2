import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, belongsTo, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Student from './student.js'
import StudentHasLevel from './student_has_level.js'
import User from './user.js'

export type IndividualDiscountType = 'PERCENTAGE' | 'FLAT'

export default class IndividualDiscount extends BaseModel {
  static table = 'IndividualDiscount'

  @beforeCreate()
  static assignId(discount: IndividualDiscount) {
    if (!discount.id) {
      discount.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'description' })
  declare description: string | null

  @column({ columnName: 'enrollmentDiscountPercentage' })
  declare enrollmentDiscountPercentage: number | null

  @column({ columnName: 'discountPercentage' })
  declare discountPercentage: number | null

  @column({ columnName: 'enrollmentDiscountValue' })
  declare enrollmentDiscountValue: number | null

  @column({ columnName: 'discountValue' })
  declare discountValue: number | null

  @column({ columnName: 'discountType' })
  declare discountType: IndividualDiscountType

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column.dateTime({ columnName: 'validFrom' })
  declare validFrom: DateTime | null

  @column.dateTime({ columnName: 'validUntil' })
  declare validUntil: DateTime | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'studentHasLevelId' })
  declare studentHasLevelId: string | null

  @column({ columnName: 'createdById' })
  declare createdById: string

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => StudentHasLevel, { foreignKey: 'studentHasLevelId' })
  declare studentHasLevel: BelongsTo<typeof StudentHasLevel>

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  /**
   * Check if discount is currently valid
   */
  isValid(): boolean {
    if (!this.isActive) return false

    const now = DateTime.now()

    if (this.validFrom && now < this.validFrom) return false
    if (this.validUntil && now > this.validUntil) return false

    return true
  }

  /**
   * Calculate discounted enrollment value based on discount type
   */
  calculateDiscountedEnrollmentValue(originalValue: number): number {
    if (this.discountType === 'FLAT' && this.enrollmentDiscountValue) {
      return Math.max(0, originalValue - this.enrollmentDiscountValue)
    }
    const percentage = this.enrollmentDiscountPercentage ?? 0
    return Math.round(originalValue * (1 - percentage / 100))
  }

  /**
   * Calculate discounted monthly value based on discount type
   */
  calculateDiscountedMonthlyValue(originalValue: number): number {
    if (this.discountType === 'FLAT' && this.discountValue) {
      return Math.max(0, originalValue - this.discountValue)
    }
    const percentage = this.discountPercentage ?? 0
    return Math.round(originalValue * (1 - percentage / 100))
  }

  /**
   * Get the effective discount amount/value for display
   */
  getEffectiveEnrollmentDiscountDisplay(): string {
    if (this.discountType === 'FLAT' && this.enrollmentDiscountValue) {
      return `R$ ${(this.enrollmentDiscountValue / 100).toFixed(2).replace('.', ',')}`
    }
    return `${this.enrollmentDiscountPercentage ?? 0}%`
  }

  /**
   * Get the effective discount amount/value for monthly fee
   */
  getEffectiveDiscountDisplay(): string {
    if (this.discountType === 'FLAT' && this.discountValue) {
      return `R$ ${(this.discountValue / 100).toFixed(2).replace('.', ',')}`
    }
    return `${this.discountPercentage ?? 0}%`
  }
}
