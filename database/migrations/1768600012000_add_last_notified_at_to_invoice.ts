import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Invoice'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('lastNotifiedAt', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('lastNotifiedAt')
    })
  }
}
