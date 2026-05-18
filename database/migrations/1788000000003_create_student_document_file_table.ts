import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentDocumentFile'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('submissionId')
        .notNullable()
        .references('id')
        .inTable('StudentDocumentSubmission')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('fileName').notNullable()
      table.text('fileUrl').notNullable()
      table.text('mimeType').notNullable()
      table.integer('size').notNullable()
      table.integer('ord').notNullable().defaultTo(0)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.index(['submissionId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
