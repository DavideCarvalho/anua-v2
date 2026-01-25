import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Notification'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('userId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.specificType('type', '"NotificationType"').notNullable()
      table.string('title', 255).notNullable()
      table.text('message').notNullable()
      table.jsonb('data').nullable()
      table.boolean('isRead').notNullable().defaultTo(false)
      table.timestamp('readAt').nullable()
      table.boolean('sentViaInApp').notNullable().defaultTo(false)
      table.boolean('sentViaEmail').notNullable().defaultTo(false)
      table.boolean('sentViaPush').notNullable().defaultTo(false)
      table.boolean('sentViaSms').notNullable().defaultTo(false)
      table.boolean('sentViaWhatsApp').notNullable().defaultTo(false)
      table.timestamp('emailSentAt').nullable()
      table.text('emailError').nullable()
      table.string('actionUrl', 512).nullable()
      table.index(['createdAt'])
      table.index(['userId', 'isRead', 'createdAt'])
      table.index(['userId', 'type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
