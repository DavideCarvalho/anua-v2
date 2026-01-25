import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Assignment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('description').nullable()
      table.timestamp('dueDate').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.float('grade', 8).notNullable().defaultTo(0)
      table
        .text('teacherHasClassId')
        .notNullable()
        .references('id')
        .inTable('TeacherHasClass')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('academicPeriodId')
        .notNullable()
        .references('id')
        .inTable('AcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
