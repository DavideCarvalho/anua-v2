import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('AgreementProposal', (table) => {
      table.string('id').primary()
      table.string('schoolId').notNullable().references('id').inTable('School')
      table.string('studentId').notNullable().references('id').inTable('Student')
      table
        .enum('status', [
          'PENDING_SCHOOL_APPROVAL',
          'APPROVED',
          'SENT_TO_RESPONSIBLE',
          'ACCEPTED',
          'REJECTED_BY_SCHOOL',
          'REJECTED_BY_RESPONSIBLE',
          'CANCELLED',
          'EXPIRED',
        ])
        .notNullable()
        .defaultTo('PENDING_SCHOOL_APPROVAL')
      table.integer('totalAmount').notNullable()
      table.integer('installments').notNullable().defaultTo(2)
      table.integer('overdueDays').notNullable()
      table.string('approvedById').nullable().references('id').inTable('User')
      table.timestamp('approvedAt').nullable()
      table.string('rejectedById').nullable().references('id').inTable('User')
      table.timestamp('rejectedAt').nullable()
      table.string('rejectionReason').nullable()
      table.string('cancellationReason').nullable()
      table.timestamp('sentAt').nullable()
      table.timestamp('acceptedAt').nullable()
      table.timestamp('cancelledAt').nullable()
      table.timestamp('expiresAt').nullable()
      table.timestamp('createdAt').notNullable()
      table.timestamp('updatedAt').notNullable()

      table.index(['schoolId'])
      table.index(['studentId'])
      table.index(['status'])
    })

    this.schema.createTable('AgreementProposalInvoice', (table) => {
      table.string('id').primary()
      table
        .string('proposalId')
        .notNullable()
        .references('id')
        .inTable('AgreementProposal')
        .onDelete('CASCADE')
      table.string('invoiceId').notNullable().references('id').inTable('Invoice')
      table.integer('amount').notNullable()
      table.integer('overdueDays').notNullable()
      table.timestamp('createdAt').notNullable()

      table.unique(['proposalId', 'invoiceId'])
    })
  }

  async down() {
    this.schema.dropTable('AgreementProposalInvoice')
    this.schema.dropTable('AgreementProposal')
  }
}
