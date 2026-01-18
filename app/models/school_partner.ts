import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Scholarship from './scholarship.js'

export default class SchoolPartner extends BaseModel {
  @beforeCreate()
  static assignId(partner: SchoolPartner) {
    if (!partner.id) {
      partner.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare name: string

  @column()
  declare cnpj: string

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare contactName: string | null

  @column()
  declare discountPercentage: number

  @column.date()
  declare partnershipStartDate: DateTime

  @column.date()
  declare partnershipEndDate: DateTime | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => Scholarship)
  declare scholarships: HasMany<typeof Scholarship>
}
