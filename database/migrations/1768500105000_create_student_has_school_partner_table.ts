import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentHasSchoolPartner'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('schoolPartnerId')
        .notNullable()
        .references('id')
        .inTable('SchoolPartner')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('academicPeriodId').notNullable()
      table.date('startDate').notNullable()
      table.date('endDate').nullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('userId')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.unique(['studentId', 'schoolPartnerId'])
      table.index(['schoolPartnerId'])
      table.index(['studentId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
