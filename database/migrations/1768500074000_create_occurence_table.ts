import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Occurence'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.date('date').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.text('text').notNullable()
      table.specificType('type', '"OccurenceType"').notNullable()
      table
        .text('teacherHasClassId')
        .notNullable()
        .references('id')
        .inTable('TeacherHasClass')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
