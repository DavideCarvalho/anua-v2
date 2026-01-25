import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ResponsibleAddress'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('responsibleId')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .unique()
      table.text('street').notNullable()
      table.text('number').notNullable()
      table.text('complement').nullable()
      table.text('neighborhood').notNullable()
      table.text('city').notNullable()
      table.text('state').notNullable()
      table.text('zipCode').notNullable()
      table.float('latitude', 8).nullable()
      table.float('longitude', 8).nullable()
      table.specificType('location', 'geography(Point,4326)').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
