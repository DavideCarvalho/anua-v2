import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Notification'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('whatsappSentAt').nullable()
      table.text('whatsappError').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('whatsappSentAt')
      table.dropColumn('whatsappError')
    })
  }
}
