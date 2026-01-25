import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AcademicPeriodWeekendClass'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('academicPeriodId')
        .notNullable()
        .references('id')
        .inTable('AcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.date('date').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
