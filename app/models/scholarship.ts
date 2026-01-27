import { v7 as uuidv7 } from 'uuid'
import { BaseModel, belongsTo, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import SchoolPartner from './school_partner.js'

export type ScholarshipType = 'PHILANTHROPIC' | 'DISCOUNT' | 'COMPANY_PARTNERSHIP' | 'FREE'

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
}
