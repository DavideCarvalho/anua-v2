import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'CoordinatorHasLevel'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('coordinatorId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('levelAssignedToCourseHasAcademicPeriodId')
        .notNullable()
        .references('id')
        .inTable('LevelAssignedToCourseHasAcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['coordinatorId', 'levelAssignedToCourseHasAcademicPeriodId'])
      table.index(['coordinatorId'])
      table.index(['levelAssignedToCourseHasAcademicPeriodId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
