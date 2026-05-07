import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AcademicPeriod'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('periodStructure', ['BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL'])
        .nullable()
        .defaultTo(null)
      table
        .enum('recoveryGradeMethod', ['AVERAGE', 'REPLACE_IF_HIGHER', 'REPLACE'])
        .nullable()
        .defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('periodStructure')
      table.dropColumn('recoveryGradeMethod')
    })
  }
}
