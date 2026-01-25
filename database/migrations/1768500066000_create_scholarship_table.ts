import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Scholarship'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.integer('enrollmentDiscountPercentage').notNullable().defaultTo(0)
      table.integer('discountPercentage').notNullable().defaultTo(0)
      table.specificType('type', '"ScholarshipType"').notNullable()
      table.boolean('isActive').notNullable().defaultTo(true)
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table
        .text('schoolPartnerId')
        .nullable()
        .references('id')
        .inTable('SchoolPartner')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('description').nullable()
      table.text('code').nullable().unique()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
