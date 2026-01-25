import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'SchoolHasGroup'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('schoolGroupId')
        .notNullable()
        .references('id')
        .inTable('SchoolGroup')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.unique(['schoolId', 'schoolGroupId'])
      table.index(['schoolGroupId'])
      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
