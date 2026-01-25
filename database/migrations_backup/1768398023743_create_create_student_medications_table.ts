import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_medications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('medical_info_id', 12)
        .notNullable()
        .references('id')
        .inTable('student_medical_infos')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('dosage').notNullable()
      table.string('frequency').notNullable()
      table.string('instructions').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['medical_info_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
