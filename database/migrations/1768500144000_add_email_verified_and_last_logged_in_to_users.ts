import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('emailVerifiedAt').nullable()
      table.timestamp('lastLoggedInAt').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('emailVerifiedAt')
      table.dropColumn('lastLoggedInAt')
    })
  }
}
