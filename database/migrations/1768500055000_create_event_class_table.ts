import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventClass'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table
        .text('eventId')
        .notNullable()
        .references('id')
        .inTable('Event')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('classId')
        .notNullable()
        .references('id')
        .inTable('Class')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.unique(['eventId', 'classId'])
      table.index(['classId'])
      table.index(['eventId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
