import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventNotification'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('sentAt').nullable()
      table
        .text('eventId')
        .notNullable()
        .references('id')
        .inTable('Event')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('userId').notNullable()
      table.text('type').notNullable()
      table.string('title', 255).notNullable()
      table.text('message').notNullable()
      table.timestamp('scheduledFor').nullable()
      table.boolean('isSent').notNullable().defaultTo(false)
      table.specificType('sentVia', 'text[]').nullable()
      table.index(['eventId'])
      table.index(['isSent'])
      table.index(['scheduledFor'])
      table.index(['userId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
