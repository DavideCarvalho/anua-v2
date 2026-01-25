import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'TeacherAvailability'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('teacherId')
        .notNullable()
        .references('id')
        .inTable('Teacher')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.text('day').notNullable()
      table.time('startTime').notNullable()
      table.time('endTime').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
