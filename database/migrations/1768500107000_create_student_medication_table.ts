import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'StudentMedication'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('medicalInfoId')
        .notNullable()
        .references('id')
        .inTable('StudentMedicalInfo')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.text('name').notNullable()
      table.text('dosage').notNullable()
      table.text('frequency').notNullable()
      table.text('instructions').nullable()
      table.timestamp('createdAt').notNullable().defaultTo(this.now())
      table.timestamp('updatedAt').notNullable()
      table.index(['medicalInfoId'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
