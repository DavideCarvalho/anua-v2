import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentPayment'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('studentHasExtraClassId')
        .nullable()
        .references('id')
        .inTable('StudentHasExtraClass')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['studentHasExtraClassId'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('studentHasExtraClassId')
    })
  }
}
