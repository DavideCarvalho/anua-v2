import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Contract from './contract.js'

export default class ContractInterestConfig extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare contractId: string

  @column()
  declare delayInterestPercentage: number

  @column()
  declare delayInterestPerDayDelayed: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamento
  @belongsTo(() => Contract)
  declare contract: BelongsTo<typeof Contract>
}
