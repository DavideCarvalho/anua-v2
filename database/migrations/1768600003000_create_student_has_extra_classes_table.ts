import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentHasExtraClass'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('extraClassId')
        .notNullable()
        .references('id')
        .inTable('ExtraClass')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('scholarshipId')
        .nullable()
        .references('id')
        .inTable('Scholarship')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('paymentMethod').notNullable()
      table.integer('paymentDay').notNullable()
      table.timestamp('enrolledAt').notNullable()
      table.timestamp('cancelledAt').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['studentId'])
      table.index(['extraClassId'])
      table.unique(['studentId', 'extraClassId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
