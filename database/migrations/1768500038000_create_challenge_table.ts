import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Challenge'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('description').notNullable()
      table.text('icon').nullable()
      table.integer('points').notNullable().defaultTo(0)
      table.specificType('category', '"ChallengeCategory"').notNullable()
      table.jsonb('criteria').notNullable()
      table.boolean('isRecurring').notNullable().defaultTo(false)
      table.specificType('recurrencePeriod', '"RecurrencePeriod"').nullable()
      table.date('startDate').nullable()
      table.date('endDate').nullable()
      table
        .text('schoolId')
        .nullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.boolean('isActive').notNullable().defaultTo(true)
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
