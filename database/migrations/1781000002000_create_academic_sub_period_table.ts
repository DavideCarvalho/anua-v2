import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'AcademicSubPeriod'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('slug').notNullable()
      table.integer('order').notNullable()
      table.date('startDate').notNullable()
      table.date('endDate').notNullable()
      table.float('weight', 8).notNullable().defaultTo(1)
      table.float('minimumGrade', 8).nullable()
      table.boolean('hasRecovery').notNullable().defaultTo(false)
      table.date('recoveryStartDate').nullable()
      table.date('recoveryEndDate').nullable()
      table
        .text('academicPeriodId')
        .notNullable()
        .references('id')
        .inTable('AcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable()
      table.index(['academicPeriodId'])
      table.index(['schoolId'])
      table.index(['academicPeriodId', 'order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
