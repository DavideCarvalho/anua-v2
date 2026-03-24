import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiry'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('createdByResponsibleId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('subject').notNullable()
      table.text('status').notNullable().defaultTo('OPEN')
      table.timestamp('resolvedAt').nullable()
      table
        .text('resolvedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()

      table.index(['studentId'])
      table.index(['schoolId'])
      table.index(['status'])
      table.index(['createdByResponsibleId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
