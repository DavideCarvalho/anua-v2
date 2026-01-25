import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_grades'

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
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.float('score', 8).nullable()
      table.boolean('attended').notNullable().defaultTo(false)
      table.text('feedback').nullable()
      table.timestamp('gradedAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.unique(['examId', 'studentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
