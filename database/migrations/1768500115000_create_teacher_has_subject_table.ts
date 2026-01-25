import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'TeacherHasSubject'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('teacherId')
        .notNullable()
        .references('id')
        .inTable('Teacher')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('subjectId')
        .notNullable()
        .references('id')
        .inTable('Subject')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.index(['teacherId', 'subjectId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
