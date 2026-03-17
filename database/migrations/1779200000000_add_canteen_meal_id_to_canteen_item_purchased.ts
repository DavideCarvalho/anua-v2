import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CanteenItemPurchased'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .text('canteenMealId')
        .nullable()
        .references('id')
        .inTable('CanteenMeal')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.text('canteenItemId').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('canteenMealId')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.text('canteenItemId').notNullable().alter()
    })
  }
}
