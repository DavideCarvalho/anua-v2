import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AgreementProposal from './agreement_proposal.js'
import Invoice from './invoice.js'

export default class AgreementProposalInvoice extends BaseModel {
  static table = 'AgreementProposalInvoice'

  @beforeCreate()
  static assignId(model: AgreementProposalInvoice) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'proposalId' })
  declare proposalId: string

  @column({ columnName: 'invoiceId' })
  declare invoiceId: string

  @column({ columnName: 'amount' })
  declare amount: number

  @column({ columnName: 'overdueDays' })
  declare overdueDays: number

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @belongsTo(() => AgreementProposal, { foreignKey: 'proposalId' })
  declare proposal: BelongsTo<typeof AgreementProposal>

  @belongsTo(() => Invoice, { foreignKey: 'invoiceId' })
  declare invoice: BelongsTo<typeof Invoice>
}
