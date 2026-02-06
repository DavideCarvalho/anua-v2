import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ExtraClassSchedule'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('extraClassId')
        .notNullable()
        .references('id')
        .inTable('ExtraClass')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.integer('weekDay').notNullable()
      table.text('startTime').notNullable()
      table.text('endTime').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['extraClassId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
