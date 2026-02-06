import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'locks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('key').primary()
      table.text('owner').notNullable()
      table.bigInteger('expiration').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
