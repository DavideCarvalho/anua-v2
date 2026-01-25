import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_availabilities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('teacher_id', 12)
        .notNullable()
        .references('id')
        .inTable('teachers')
        .onDelete('CASCADE')
      table.string('day').notNullable() // Nome do dia da semana
      table.time('start_time').notNullable()
      table.time('end_time').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['teacher_id'])
      table.index(['day'])
      table.index(['start_time'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
