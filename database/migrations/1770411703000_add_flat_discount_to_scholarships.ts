import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Scholarship'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('enrollmentDiscountValue').nullable().defaultTo(0)
      table.integer('discountValue').nullable().defaultTo(0)
      table.enum('discountType', ['PERCENTAGE', 'FLAT']).notNullable().defaultTo('PERCENTAGE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('enrollmentDiscountValue', 'discountValue', 'discountType')
    })
  }
}
