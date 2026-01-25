import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentDocument'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('fileName').notNullable()
      table.text('fileUrl').notNullable()
      table.text('mimeType').notNullable()
      table.integer('size').notNullable()
      table.specificType('status', '"StudentDocumentStatus"').notNullable().defaultTo('PENDING')
      table.text('reviewedBy').nullable()
      table.timestamp('reviewedAt').nullable()
      table.text('rejectionReason').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('contractDocumentId')
        .notNullable()
        .references('id')
        .inTable('ContractDocument')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
