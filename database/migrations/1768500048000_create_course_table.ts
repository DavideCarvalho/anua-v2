import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Course'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('slug').notNullable().unique()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.integer('version').notNullable().defaultTo(1)
      table
        .text('coordinatorId')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.integer('enrollmentMinimumAge').nullable()
      table.integer('enrollmentMaximumAge').nullable()
      table.integer('maxStudentsPerClass').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['schoolId', 'slug', 'version'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
