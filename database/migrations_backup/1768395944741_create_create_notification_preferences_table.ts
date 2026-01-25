import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_preferences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('user_id', 12)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // What type of notification
      table
        .enum('notification_type', [
          // Same enum values as notifications table
          'ORDER_CREATED',
          'ORDER_APPROVED',
          'ORDER_REJECTED',
          'ORDER_PREPARING',
          'ORDER_READY',
          'ORDER_DELIVERED',
          'ACHIEVEMENT_UNLOCKED',
          'CHALLENGE_STARTED',
          'CHALLENGE_COMPLETED',
          'CHALLENGE_EXPIRED',
          'POINTS_RECEIVED',
          'POINTS_DEDUCTED',
          'LEVEL_UP',
          'STREAK_MILESTONE',
          'RANKING_POSITION_CHANGED',
          'ASSIGNMENT_CREATED',
          'ASSIGNMENT_GRADED',
          'ASSIGNMENT_DUE_SOON',
          'GRADE_PUBLISHED',
          'ATTENDANCE_MARKED',
          'PARENTAL_CONSENT_REQUESTED',
          'PARENTAL_CONSENT_REMINDER',
          'PARENTAL_CONSENT_APPROVED',
          'PARENTAL_CONSENT_DENIED',
          'PARENTAL_CONSENT_EXPIRED',
          'PAYMENT_DUE',
          'PAYMENT_RECEIVED',
          'LOW_BALANCE',
          'CONFIG_WARNING_CRITICAL',
          'CONFIG_WARNING',
          'SYSTEM_ANNOUNCEMENT',
          'MAINTENANCE_SCHEDULED',
        ])
        .notNullable()

      // Through which channels
      table.boolean('enable_in_app').defaultTo(true)
      table.boolean('enable_email').defaultTo(true)
      table.boolean('enable_push').defaultTo(false)
      table.boolean('enable_sms').defaultTo(false)
      table.boolean('enable_whatsapp').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'notification_type'])
      table.index(['user_id'])
      table.index(['notification_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
