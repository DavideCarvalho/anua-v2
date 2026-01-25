import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'PlatformSettings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.integer('defaultTrialDays').notNullable().defaultTo(30)
      table.integer('defaultPricePerStudent').notNullable().defaultTo(1290)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
