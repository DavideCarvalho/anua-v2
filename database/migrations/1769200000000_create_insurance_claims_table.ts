import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'insurance_claims'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('student_payment_id').notNullable().references('id').inTable('student_payments').onDelete('CASCADE')
      table.date('claim_date').notNullable()
      table.integer('overdue_amount').notNullable() // valor em centavos
      table.float('coverage_percentage').notNullable() // 50, 70 ou 100
      table.integer('covered_amount').notNullable() // valor coberto em centavos
      table
        .enum('status', ['PENDING', 'APPROVED', 'PAID', 'REJECTED'], {
          useNative: true,
          enumName: 'insurance_claim_status',
          existingType: false,
        })
        .defaultTo('PENDING')
        .notNullable()
      table.timestamp('approved_at').nullable()
      table.uuid('approved_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('paid_at').nullable()
      table.timestamp('rejected_at').nullable()
      table.uuid('rejected_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.text('rejection_reason').nullable()
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['student_payment_id'])
      table.index(['status'])
      table.index(['claim_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS "insurance_claim_status"')
  }
}
