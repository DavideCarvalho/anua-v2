import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_medical_infos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('student_id', 12)
        .notNullable()
        .unique()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.text('conditions').nullable()
      table.json('documents').nullable() // Array de documentos médicos
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['student_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
