import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Contract from './contract.js'

export default class ContractInterestConfig extends BaseModel {
  static table = 'ContractInterestConfig'

  @beforeCreate()
  static assignId(config: ContractInterestConfig) {
    if (!config.id) {
      config.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'contractId' })
  declare contractId: string

  @column({ columnName: 'delayInterestPercentage' })
  declare delayInterestPercentage: number

  @column({ columnName: 'delayInterestPerDayDelayed' })
  declare delayInterestPerDayDelayed: number

  // Relacionamento
  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>
}
