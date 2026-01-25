import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_emergency_contacts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('student_id', 12)
        .notNullable()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.string('user_id', 12).nullable().references('id').inTable('users') // Se o usuário já existe
      table.string('name').notNullable()
      table.string('phone').notNullable()
      table
        .enum('relationship', [
          'MOTHER',
          'FATHER',
          'GRANDMOTHER',
          'GRANDFATHER',
          'AUNT',
          'UNCLE',
          'COUSIN',
          'NEPHEW',
          'NIECE',
          'GUARDIAN',
          'OTHER',
        ])
        .notNullable()
      table.integer('order').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['student_id'])
      table.index(['user_id'])
      table.index(['relationship'])
      table.index(['order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
