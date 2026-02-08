import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'IndividualDiscount'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('description').nullable()

      // Discount values - can be percentage or flat
      table.integer('enrollmentDiscountPercentage').nullable().defaultTo(0)
      table.integer('discountPercentage').nullable().defaultTo(0)
      table.integer('enrollmentDiscountValue').nullable().defaultTo(0)
      table.integer('discountValue').nullable().defaultTo(0)

      // Discount type: PERCENTAGE or FLAT
      table.enum('discountType', ['PERCENTAGE', 'FLAT']).notNullable().defaultTo('PERCENTAGE')

      table.boolean('isActive').notNullable().defaultTo(true)
      table.dateTime('validFrom').nullable()
      table.dateTime('validUntil').nullable()

      // Foreign keys
      table
        .text('schoolId')
        .notNullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table
        .text('studentId')
        .notNullable()
        .references('id')
        .inTable('Student')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table
        .text('studentHasLevelId')
        .nullable()
        .references('id')
        .inTable('StudentHasLevel')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table
        .text('createdById')
        .notNullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')

      table.dateTime('createdAt').notNullable().defaultTo(this.now())
      table.dateTime('updatedAt').notNullable().defaultTo(this.now())
      table.dateTime('deletedAt').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
