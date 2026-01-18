import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_has_responsibles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw('generate_id(7)'))
      table
        .string('student_id')
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table
        .string('responsible_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.boolean('is_pedagogical').defaultTo(false)
      table.boolean('is_financial').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['student_id'])
      table.index(['responsible_id'])
      table.unique(['student_id', 'responsible_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
