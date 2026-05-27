import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { Auditable } from '@adogrove/adonis-auditing'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Student from './student.js'
import User from './user.js'
import AgreementProposalInvoice from './agreement_proposal_invoice.js'

export type AgreementProposalStatus =
  | 'PENDING_SCHOOL_APPROVAL'
  | 'APPROVED'
  | 'SENT_TO_RESPONSIBLE'
  | 'ACCEPTED'
  | 'REJECTED_BY_SCHOOL'
  | 'REJECTED_BY_RESPONSIBLE'
  | 'CANCELLED'
  | 'EXPIRED'

export default class AgreementProposal extends compose(BaseModel, Auditable) {
  static table = 'AgreementProposal'

  @beforeCreate()
  static assignId(model: AgreementProposal) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'status' })
  declare status: AgreementProposalStatus

  @column({ columnName: 'totalAmount' })
  declare totalAmount: number

  @column({ columnName: 'installments' })
  declare installments: number

  @column({ columnName: 'overdueDays' })
  declare overdueDays: number

  @column({ columnName: 'approvedById' })
  declare approvedById: string | null

  @column.dateTime({ columnName: 'approvedAt' })
  declare approvedAt: DateTime | null

  @column({ columnName: 'rejectedById' })
  declare rejectedById: string | null

  @column.dateTime({ columnName: 'rejectedAt' })
  declare rejectedAt: DateTime | null

  @column({ columnName: 'rejectionReason' })
  declare rejectionReason: string | null

  @column({ columnName: 'cancellationReason' })
  declare cancellationReason: string | null

  @column.dateTime({ columnName: 'sentAt' })
  declare sentAt: DateTime | null

  @column.dateTime({ columnName: 'acceptedAt' })
  declare acceptedAt: DateTime | null

  @column.dateTime({ columnName: 'cancelledAt' })
  declare cancelledAt: DateTime | null

  @column.dateTime({ columnName: 'expiresAt' })
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'approvedById' })
  declare approvedBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'rejectedById' })
  declare rejectedBy: BelongsTo<typeof User>

  @hasMany(() => AgreementProposalInvoice, { foreignKey: 'proposalId' })
  declare invoices: HasMany<typeof AgreementProposalInvoice>
}
