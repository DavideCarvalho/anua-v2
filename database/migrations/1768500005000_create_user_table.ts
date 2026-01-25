import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table.text('name').notNullable()
      table.text('slug').notNullable().unique()
      table.text('email').nullable().unique()
      table
        .text('schoolChainId')
        .nullable()
        .references('id')
        .inTable('SchoolChain')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.text('phone').nullable()
      table.boolean('whatsappContact').notNullable().defaultTo(false)
      table.date('birthDate').nullable()
      table.text('documentType').nullable()
      table.text('documentNumber').nullable()
      table.text('asaasCustomerId').nullable()
      table
        .text('roleId')
        .notNullable()
        .references('id')
        .inTable('Role')
        .onUpdate('CASCADE')
        .onDelete('RESTRICT')
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.text('imageUrl').nullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamp('deletedAt').nullable()
      table
        .text('deletedBy')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.integer('grossSalary').notNullable().defaultTo(0)
      table
        .text('schoolId')
        .nullable()
        .references('id')
        .inTable('School')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.index(['deletedBy'])
      table.index(['roleId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
