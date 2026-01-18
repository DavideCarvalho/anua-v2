import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .foreign('calendar_slot_id')
        .references('id')
        .inTable('calendar_slots')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['calendar_slot_id'])
    })
  }
}
