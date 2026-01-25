import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'EventAttachment'

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
      table.text('fileName').notNullable()
      table.text('originalName').notNullable()
      table.text('mimeType').notNullable()
      table.integer('size').notNullable()
      table.string('url', 512).notNullable()
      table.text('description').nullable()
      table.index(['eventId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
