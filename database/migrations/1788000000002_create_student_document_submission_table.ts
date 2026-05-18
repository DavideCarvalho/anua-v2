import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentDocumentSubmission'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('contractDocumentId')
        .notNullable()
        .references('id')
        .inTable('ContractDocument')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.specificType('status', '"StudentDocumentStatus"').notNullable().defaultTo('PENDING')
      table.text('rejectionReason').nullable()
      table
        .text('reviewedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('reviewedAt').nullable()
      table.timestamp('submittedAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.unique(['contractDocumentId', 'studentId'])
      table.index(['studentId'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
