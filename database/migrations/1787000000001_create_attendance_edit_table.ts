import { BaseSchema } from '@adonisjs/lucid/schema'

// Histórico append-only de edições de presença. Cada vez que uma célula
// (StudentHasAttendance) muda de status ou justificativa, escreve aqui
// quem editou, o valor anterior e — quando o bimestre está fechado —
// o motivo informado pela coordenadora.
export default class extends BaseSchema {
  protected tableName = 'AttendanceEdit'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').primary()
      table
        .text('studentHasAttendanceId')
        .notNullable()
        .references('id')
        .inTable('StudentHasAttendance')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      table.specificType('previousStatus', '"AttendanceStatus"').nullable()
      table.text('previousJustification').nullable()
      table.specificType('newStatus', '"AttendanceStatus"').notNullable()
      table.text('newJustification').nullable()
      table.text('reason').nullable()
      table
        .text('editedById')
        .nullable()
        .references('id')
        .inTable('User')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.timestamp('editedAt').notNullable().defaultTo(this.now())
      table.index(['studentHasAttendanceId', 'editedAt'])
      table.index(['editedById'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
