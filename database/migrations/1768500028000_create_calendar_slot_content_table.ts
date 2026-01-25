import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CalendarSlotContent'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('title').notNullable()
      table.text('content').notNullable()
      table
        .text('calendarSlotId')
        .notNullable()
        .references('id')
        .inTable('CalendarSlot')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
