import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_attachments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('examId')
        .notNullable()
        .references('id')
        .inTable('exams')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('title').notNullable()
      table.text('fileName').notNullable()
      table.text('fileUrl').notNullable()
      table.integer('fileSize').nullable()
      table.text('mimeType').nullable()
      table.text('uploadedBy').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
