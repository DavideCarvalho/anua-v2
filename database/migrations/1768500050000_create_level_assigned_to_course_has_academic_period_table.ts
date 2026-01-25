import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'LevelAssignedToCourseHasAcademicPeriod'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('levelId')
        .notNullable()
        .references('id')
        .inTable('Level')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('courseHasAcademicPeriodId')
        .notNullable()
        .references('id')
        .inTable('CourseHasAcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.boolean('isActive').notNullable().defaultTo(true)
      table.unique(['levelId', 'courseHasAcademicPeriodId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
