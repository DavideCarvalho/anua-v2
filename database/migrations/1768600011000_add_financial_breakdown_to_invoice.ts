import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Invoice'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('baseAmount').notNullable().defaultTo(0)
      table.integer('discountAmount').notNullable().defaultTo(0)
      table.integer('fineAmount').notNullable().defaultTo(0)
      table.integer('interestAmount').notNullable().defaultTo(0)
    })

    // Backfill: set baseAmount = totalAmount for existing invoices
    this.defer(async (db) => {
      await db.rawQuery('UPDATE "Invoice" SET "baseAmount" = "totalAmount" WHERE "baseAmount" = 0')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('baseAmount')
      table.dropColumn('discountAmount')
      table.dropColumn('fineAmount')
      table.dropColumn('interestAmount')
    })
  }
}
