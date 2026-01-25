import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'FixedClass'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('classScheduleId')
        .notNullable()
        .references('id')
        .inTable('ClassSchedule')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
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
      table.string('classWeekDay', 10).notNullable()
      table.string('startTime', 10).notNullable()
      table.string('endTime', 10).notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['classId'])
      table.index(['classScheduleId'])
      table.index(['subjectId'])
      table.index(['teacherId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
