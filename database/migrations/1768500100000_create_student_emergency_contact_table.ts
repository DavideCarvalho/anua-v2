import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentEmergencyContact'

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
        .unique()
      table
        .text('userId')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('name').notNullable()
      table.text('phone').notNullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.integer('order').notNullable().defaultTo(0)
      table.specificType('relationship', '"StudentEmergencyContactRelationship"').notNullable()
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
