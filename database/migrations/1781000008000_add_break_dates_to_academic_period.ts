import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AcademicPeriod'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('breakStartDate').nullable().defaultTo(null)
      table.date('breakEndDate').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('breakStartDate')
      table.dropColumn('breakEndDate')
    })
  }
}
