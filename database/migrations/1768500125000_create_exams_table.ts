import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('title').notNullable()
      table.text('description').nullable()
      table.timestamp('examDate').notNullable()
      table.timestamp('startTime').nullable()
      table.timestamp('endTime').nullable()
      table.specificType('location', 'geography(Point,4326)').nullable()
      table.float('maxScore', 8).notNullable()
      table.float('weight', 8).notNullable().defaultTo(1.0)
      table.specificType('type', '"ExamType"').notNullable().defaultTo('WRITTEN')
      table.specificType('status', '"ExamStatus"').notNullable().defaultTo('DRAFT')
      table.text('instructions').nullable()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('classId')
        .notNullable()
        .references('id')
        .inTable('Class')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('subjectId')
        .nullable()
        .references('id')
        .inTable('Subject')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .text('teacherId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('academicPeriodId')
        .notNullable()
        .references('id')
        .inTable('AcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
