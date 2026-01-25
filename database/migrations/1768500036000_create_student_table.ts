import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Student'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .text('id')
        .primary()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('descountPercentage').notNullable().defaultTo(0)
      table.integer('monthlyPaymentAmount').notNullable().defaultTo(0)
      table.boolean('isSelfResponsible').notNullable().defaultTo(false)
      table.integer('paymentDate').nullable()
      table
        .text('classId')
        .nullable()
        .references('id')
        .inTable('Class')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('contractId').nullable()
      table.float('canteenLimit', 8).nullable()
      table.integer('balance').notNullable().defaultTo(0)
      table
        .specificType('enrollmentStatus', '"EnrollmentStatus"')
        .notNullable()
        .defaultTo('PENDING_DOCUMENT_REVIEW')
      table.index(['id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
