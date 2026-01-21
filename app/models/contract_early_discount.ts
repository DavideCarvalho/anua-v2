import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Contract from './contract.js'

export default class ContractEarlyDiscount extends BaseModel {
  static table = 'ContractEarlyDiscount'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare contractId: string

  @column()
  declare percentage: number

  @column()
  declare daysBeforeDeadline: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamento
  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>
}
