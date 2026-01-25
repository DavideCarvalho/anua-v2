import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'assignments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.string('name').notNullable()
      table.text('description').nullable()
      table.datetime('due_date').notNullable()
      table.float('grade').defaultTo(0)
      table
        .string('teacher_has_class_id', 12)
        .notNullable()
        .references('id')
        .inTable('teacher_has_classes')
        .onDelete('CASCADE')
      table
        .string('academic_period_id', 12)
        .notNullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['teacher_has_class_id'])
      table.index(['academic_period_id'])
      table.index(['due_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
