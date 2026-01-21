import { DateTime } from 'luxon'
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

  @column()
  declare schoolId: string

  @column()
  declare schoolPartnerId: string | null

  @column()
  declare name: string

  @column()
  declare enrollmentDiscountPercentage: number

  @column()
  declare discountPercentage: number

  @column()
  declare type: ScholarshipType

  @column()
  declare isActive: boolean

  @column()
  declare description: string | null

  @column()
  declare code: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolPartner, { foreignKey: 'schoolPartnerId' })
  declare schoolPartner: BelongsTo<typeof SchoolPartner>
}
