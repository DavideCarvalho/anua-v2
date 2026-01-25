import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentHasAssignment'

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
      table
        .text('assignmentId')
        .notNullable()
        .references('id')
        .inTable('Assignment')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.float('grade', 8).nullable()
      table.timestamp('submittedAt').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
