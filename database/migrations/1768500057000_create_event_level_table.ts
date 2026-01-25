import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventLevel'

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
        .text('levelId')
        .notNullable()
        .references('id')
        .inTable('Level')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.unique(['eventId', 'levelId'])
      table.index(['eventId'])
      table.index(['levelId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
