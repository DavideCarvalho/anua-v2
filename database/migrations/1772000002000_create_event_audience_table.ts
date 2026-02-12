import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventAudience'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('eventId')
        .notNullable()
        .references('id')
        .inTable('Event')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('scopeType').notNullable()
      table.text('scopeId').notNullable()

      table.unique(['eventId', 'scopeType', 'scopeId'])
      table.index(['eventId'])
      table.index(['scopeType'])
      table.index(['scopeId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
