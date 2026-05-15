import { BaseSchema } from '@adonisjs/lucid/schema'

// Adiciona campos de auditoria para presenças. Permite responder
// "quem fez essa chamada?" e "quem mudou o status do João depois?".
// Também marca quando um bimestre é encerrado, para que edições
// retroativas no boletim peçam motivo obrigatório.
export default class extends BaseSchema {
  async up() {
    const hasAttendanceCreatedBy = await this.schema.hasColumn('Attendance', 'createdById')
    if (!hasAttendanceCreatedBy) {
      this.schema.alterTable('Attendance', (table) => {
        table
          .text('createdById')
          .nullable()
          .references('id')
          .inTable('User')
          .onUpdate('CASCADE')
          .onDelete('SET NULL')
        table
          .text('lastEditedById')
          .nullable()
          .references('id')
          .inTable('User')
          .onUpdate('CASCADE')
          .onDelete('SET NULL')
        table.timestamp('lastEditedAt').nullable()
      })
    }

    const hasShaLastEditedBy = await this.schema.hasColumn('StudentHasAttendance', 'lastEditedById')
    if (!hasShaLastEditedBy) {
      this.schema.alterTable('StudentHasAttendance', (table) => {
        table
          .text('lastEditedById')
          .nullable()
          .references('id')
          .inTable('User')
          .onUpdate('CASCADE')
          .onDelete('SET NULL')
        table.timestamp('lastEditedAt').nullable()
        table.index(['studentId', 'attendanceId'])
      })
    }

    const hasSubPeriodIsLocked = await this.schema.hasColumn('AcademicSubPeriod', 'isLocked')
    if (!hasSubPeriodIsLocked) {
      this.schema.alterTable('AcademicSubPeriod', (table) => {
        table.boolean('isLocked').notNullable().defaultTo(false)
        table.timestamp('lockedAt').nullable()
        table
          .text('lockedById')
          .nullable()
          .references('id')
          .inTable('User')
          .onUpdate('CASCADE')
          .onDelete('SET NULL')
      })
    }
  }

  async down() {
    this.schema.alterTable('Attendance', (table) => {
      table.dropColumn('createdById')
      table.dropColumn('lastEditedById')
      table.dropColumn('lastEditedAt')
    })
    this.schema.alterTable('StudentHasAttendance', (table) => {
      table.dropIndex(['studentId', 'attendanceId'])
      table.dropColumn('lastEditedById')
      table.dropColumn('lastEditedAt')
    })
    this.schema.alterTable('AcademicSubPeriod', (table) => {
      table.dropColumn('isLocked')
      table.dropColumn('lockedAt')
      table.dropColumn('lockedById')
    })
  }
}
