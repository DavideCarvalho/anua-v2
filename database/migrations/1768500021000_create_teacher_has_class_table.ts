import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'TeacherHasClass'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('teacherId')
        .notNullable()
        .references('id')
        .inTable('Teacher')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('classId')
        .notNullable()
        .references('id')
        .inTable('Class')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('subjectId')
        .notNullable()
        .references('id')
        .inTable('Subject')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('subjectQuantity').notNullable().defaultTo(1)
      table.string('classWeekDay', 10).nullable()
      table.string('startTime', 10).nullable()
      table.string('endTime', 10).nullable()
      table
        .text('teacherAvailabilityId')
        .nullable()
        .references('id')
        .inTable('TeacherAvailability')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.unique(['teacherId', 'classId', 'subjectId', 'classWeekDay', 'startTime', 'endTime'])
      table.index(['classId'])
      table.index(['subjectId'])
      table.index(['teacherId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
