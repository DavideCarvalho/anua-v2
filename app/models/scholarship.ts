import { v7 as uuidv7 } from 'uuid'
import { BaseModel, belongsTo, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import SchoolPartner from './school_partner.js'

export type ScholarshipType = 'PHILANTHROPIC' | 'DISCOUNT' | 'COMPANY_PARTNERSHIP' | 'FREE'
export type DiscountType = 'PERCENTAGE' | 'FLAT'

export default class Scholarship extends BaseModel {
  static table = 'Scholarship'

  @beforeCreate()
  static assignId(scholarship: Scholarship) {
    if (!scholarship.id) {
      scholarship.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'schoolPartnerId' })
  declare schoolPartnerId: string | null

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'enrollmentDiscountPercentage' })
  declare enrollmentDiscountPercentage: number

  @column({ columnName: 'discountPercentage' })
  declare discountPercentage: number

  @column({ columnName: 'enrollmentDiscountValue' })
  declare enrollmentDiscountValue: number | null

  @column({ columnName: 'discountValue' })
  declare discountValue: number | null

  @column({ columnName: 'discountType' })
  declare discountType: DiscountType

  @column({ columnName: 'type' })
  declare type: ScholarshipType

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column({ columnName: 'description' })
  declare description: string | null

  @column({ columnName: 'code' })
  declare code: string | null

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolPartner, { foreignKey: 'schoolPartnerId' })
  declare schoolPartner: BelongsTo<typeof SchoolPartner>

  /**
   * Calculate discounted enrollment value based on discount type
   */
  calculateDiscountedEnrollmentValue(originalValue: number): number {
    if (this.discountType === 'FLAT' && this.enrollmentDiscountValue) {
      return Math.max(0, originalValue - this.enrollmentDiscountValue)
    }
    return Math.round(originalValue * (1 - this.enrollmentDiscountPercentage / 100))
  }

  /**
   * Calculate discounted monthly value based on discount type
   */
  calculateDiscountedMonthlyValue(originalValue: number): number {
    if (this.discountType === 'FLAT' && this.discountValue) {
      return Math.max(0, originalValue - this.discountValue)
    }
    return Math.round(originalValue * (1 - this.discountPercentage / 100))
  }

  /**
   * Get the effective discount percentage for display
   */
  getEffectiveEnrollmentDiscountPercentage(originalValue: number): number {
    if (this.discountType === 'FLAT' && this.enrollmentDiscountValue) {
      return Math.round((this.enrollmentDiscountValue / originalValue) * 100)
    }
    return this.enrollmentDiscountPercentage
  }

  /**
   * Get the effective discount percentage for monthly fee
   */
  getEffectiveDiscountPercentage(originalValue: number): number {
    if (this.discountType === 'FLAT' && this.discountValue) {
      return Math.round((this.discountValue / originalValue) * 100)
    }
    return this.discountPercentage
  }
}
