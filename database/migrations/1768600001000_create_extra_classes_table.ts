import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ExtraClass'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('slug').notNullable()
      table.text('description').nullable()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('academicPeriodId')
        .notNullable()
        .references('id')
        .inTable('AcademicPeriod')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('contractId')
        .notNullable()
        .references('id')
        .inTable('Contract')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('teacherId')
        .notNullable()
        .references('id')
        .inTable('Teacher')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.integer('maxStudents').nullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['schoolId'])
      table.index(['academicPeriodId'])
      table.unique(['schoolId', 'slug', 'academicPeriodId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
