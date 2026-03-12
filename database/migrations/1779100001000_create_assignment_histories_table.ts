import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'assignment_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('assignmentId')
        .notNullable()
        .references('id')
        .inTable('Assignment')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table
        .text('actorUserId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('changedAt').notNullable().defaultTo(this.now())
      table.jsonb('changes').notNullable().defaultTo('[]')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable().defaultTo(this.now())

      table.index(['assignmentId'])
      table.index(['changedAt'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
