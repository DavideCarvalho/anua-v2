import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table.datetime('date').notNullable()
      table.text('note').nullable()
      table.string('calendar_slot_id', 12).nullable() // Will be added when we create calendar system
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['date'])
      table.index(['calendar_slot_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
