import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Assignment'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Alter grade column to be nullable and remove default value
      table.float('grade', 8).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert back to not nullable with default 0
      table.float('grade', 8).notNullable().defaultTo(0).alter()
    })
  }
}
