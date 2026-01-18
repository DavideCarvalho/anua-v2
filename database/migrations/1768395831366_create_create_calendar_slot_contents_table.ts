import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'calendar_slot_contents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('calendar_slot_id', 12)
        .notNullable()
        .references('id')
        .inTable('calendar_slots')
        .onDelete('CASCADE')
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['calendar_slot_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
