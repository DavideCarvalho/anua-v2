import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'NotificationPreference'

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
      table.specificType('notificationType', '"NotificationType"').notNullable()
      table.boolean('enableInApp').notNullable().defaultTo(true)
      table.boolean('enableEmail').notNullable().defaultTo(true)
      table.boolean('enablePush').notNullable().defaultTo(false)
      table.boolean('enableSms').notNullable().defaultTo(false)
      table.boolean('enableWhatsApp').notNullable().defaultTo(false)
      table.unique(['userId', 'notificationType'])
      table.index(['userId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
