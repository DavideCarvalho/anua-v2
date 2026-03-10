import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Attendance'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['calendarSlotId', 'date'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['calendarSlotId', 'date'])
    })
  }
}
