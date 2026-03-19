import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Invoice'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('studentHasLevelId')
        .nullable()
        .references('id')
        .inTable('StudentHasLevel')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')

      table.index(['studentHasLevelId'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['studentHasLevelId'])
      table.dropColumn('studentHasLevelId')
    })
  }
}
