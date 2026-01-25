import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventRecurrence'

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
      table.text('pattern').notNullable()
      table.integer('interval').notNullable()
      table.specificType('daysOfWeek', 'text[]').nullable()
      table.integer('dayOfMonth').nullable()
      table.timestamp('endDate').nullable()
      table.integer('occurrences').nullable()
      table.index(['eventId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
