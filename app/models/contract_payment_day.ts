import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Contract from './contract.js'

export default class ContractPaymentDay extends BaseModel {
  static table = 'ContractPaymentDay'

  @beforeCreate()
  static assignId(paymentDay: ContractPaymentDay) {
    if (!paymentDay.id) {
      paymentDay.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'contractId' })
  declare contractId: string

  @column({ columnName: 'day' })
  declare day: number // 1-31

  // Relacionamento
  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>
}
