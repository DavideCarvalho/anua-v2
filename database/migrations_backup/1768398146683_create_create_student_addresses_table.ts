import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_addresses'

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
      table.string('street').notNullable()
      table.string('number').notNullable()
      table.string('complement').nullable()
      table.string('neighborhood').notNullable()
      table.string('city').notNullable()
      table.string('state').notNullable()
      table.string('zip_code').notNullable()
      table.float('latitude').nullable()
      table.float('longitude').nullable()
      // location geography field seria implementado via SQL raw se necessário
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['student_id'])
      table.index(['city'])
      table.index(['state'])
      table.index(['zip_code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
