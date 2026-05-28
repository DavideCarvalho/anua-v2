import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'NotificationPreference'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('enableWhatsApp').notNullable().defaultTo(true).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('enableWhatsApp').notNullable().defaultTo(false).alter()
    })
  }
}
