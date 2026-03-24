import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryAttachment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('messageId')
        .notNullable()
        .references('id')
        .inTable('ParentInquiryMessage')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('fileName').notNullable()
      table.text('filePath').notNullable()
      table.integer('fileSize').notNullable()
      table.text('mimeType').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())

      table.index(['messageId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
