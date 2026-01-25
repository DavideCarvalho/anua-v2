import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventParticipant'

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
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('registrationDate').notNullable().defaultTo(this.now())
      table.text('status').notNullable().defaultTo('REGISTERED')
      table.text('notes').nullable()
      table.unique(['eventId', 'userId'])
      table.index(['eventId'])
      table.index(['userId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
