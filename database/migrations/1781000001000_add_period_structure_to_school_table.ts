import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'School'

  async up() {
    const hasPeriodStructure = await this.schema.hasColumn(this.tableName, 'periodStructure')
    if (!hasPeriodStructure) {
      this.schema.alterTable(this.tableName, (table) => {
        table.specificType('periodStructure', '"PeriodStructure"').nullable()
      })
    }

    const hasRecoveryGradeMethod = await this.schema.hasColumn(
      this.tableName,
      'recoveryGradeMethod'
    )
    if (!hasRecoveryGradeMethod) {
      this.schema.alterTable(this.tableName, (table) => {
        table
          .specificType('recoveryGradeMethod', '"RecoveryGradeMethod"')
          .nullable()
          .defaultTo('AVERAGE')
      })
    }
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('periodStructure')
      table.dropColumn('recoveryGradeMethod')
    })
  }
}
