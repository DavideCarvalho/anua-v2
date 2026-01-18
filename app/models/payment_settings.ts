import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import SchoolChain from './school_chain.js'

export default class PaymentSettings extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare pricePerStudent: number

  @column()
  declare trialDays: number

  @column()
  declare discount: number

  @column()
  declare platformFeePercentage: number

  @column()
  declare isActive: boolean

  @column()
  declare schoolId: string | null

  @column()
  declare schoolChainId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolChain)
  declare schoolChain: BelongsTo<typeof SchoolChain>
}
