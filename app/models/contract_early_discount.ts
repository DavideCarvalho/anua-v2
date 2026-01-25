import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Contract from './contract.js'

export default class ContractEarlyDiscount extends BaseModel {
  static table = 'ContractEarlyDiscount'

  @beforeCreate()
  static assignId(discount: ContractEarlyDiscount) {
    if (!discount.id) {
      discount.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'contractId' })
  declare contractId: string

  @column({ columnName: 'percentage' })
  declare percentage: number

  @column({ columnName: 'daysBeforeDeadline' })
  declare daysBeforeDeadline: number

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relacionamento
  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>
}
