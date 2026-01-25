import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_absences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('absence_id')
        .notNullable()
        .unique()
        .references('id')
        .inTable('absences')
        .onDelete('CASCADE')
      table.string('calendar_slot_id', 12).notNullable().references('id').inTable('calendar_slots')
      table.string('teacher_id_took_place', 12).nullable().references('id').inTable('teachers')

      table.index(['absence_id'])
      table.index(['calendar_slot_id'])
      table.index(['teacher_id_took_place'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
