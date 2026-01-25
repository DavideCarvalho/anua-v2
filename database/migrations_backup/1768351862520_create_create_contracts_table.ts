import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contracts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw('generate_id(7)'))
      table
        .string('school_id')
        .notNullable()
        .references('id')
        .inTable('schools')
        .onDelete('CASCADE')
      table
        .string('academic_period_id')
        .nullable()
        .references('id')
        .inTable('academic_periods')
        .onDelete('SET NULL')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.date('end_date').nullable()
      table.integer('enrollment_value').nullable() // Valor da matrícula em centavos
      table.integer('amount').notNullable() // Valor do curso em centavos
      table.string('docuseal_template_id').nullable()
      table.enum('payment_type', ['MONTHLY', 'UPFRONT']).notNullable()
      table.integer('enrollment_value_installments').defaultTo(1)
      table.integer('enrollment_payment_until_days').nullable() // Dias para pagar matrícula
      table.integer('installments').defaultTo(1)
      table.boolean('flexible_installments').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.boolean('has_insurance').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['school_id'])
      table.index(['academic_period_id'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
