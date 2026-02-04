import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Store'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()

      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table
        .text('ownerUserId')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')

      table.text('name').notNullable()
      table.text('description').nullable()
      table.specificType('type', '"StoreType"').notNullable()
      table.float('commissionPercentage', 8).nullable()
      table.boolean('isActive').notNullable().defaultTo(true)

      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.timestamp('deletedAt').nullable()

      table.index(['schoolId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
