import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_has_subjects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('teacher_id', 12)
        .notNullable()
        .references('id')
        .inTable('teachers')
        .onDelete('CASCADE')
      table
        .string('subject_id', 12)
        .notNullable()
        .references('id')
        .inTable('subjects')
        .onDelete('CASCADE')

      table.unique(['teacher_id', 'subject_id'])
      table.index(['teacher_id'])
      table.index(['subject_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
