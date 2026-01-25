import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_has_classes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('teacher_availability_id').references('id').inTable('teacher_availabilities')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['teacher_availability_id'])
    })
  }
}
