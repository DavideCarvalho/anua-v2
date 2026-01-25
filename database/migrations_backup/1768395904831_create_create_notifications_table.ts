import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 12).primary()
      table
        .string('user_id', 12)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // Notification details
      table
        .enum('type', [
          // Gamification - Store
          'ORDER_CREATED',
          'ORDER_APPROVED',
          'ORDER_REJECTED',
          'ORDER_PREPARING',
          'ORDER_READY',
          'ORDER_DELIVERED',

          // Gamification - Achievements & Challenges
          'ACHIEVEMENT_UNLOCKED',
          'CHALLENGE_STARTED',
          'CHALLENGE_COMPLETED',
          'CHALLENGE_EXPIRED',
          'POINTS_RECEIVED',
          'POINTS_DEDUCTED',
          'LEVEL_UP',
          'STREAK_MILESTONE',
          'RANKING_POSITION_CHANGED',

          // Academic
          'ASSIGNMENT_CREATED',
          'ASSIGNMENT_GRADED',
          'ASSIGNMENT_DUE_SOON',
          'GRADE_PUBLISHED',
          'ATTENDANCE_MARKED',

          // Events
          'PARENTAL_CONSENT_REQUESTED',
          'PARENTAL_CONSENT_REMINDER',
          'PARENTAL_CONSENT_APPROVED',
          'PARENTAL_CONSENT_DENIED',
          'PARENTAL_CONSENT_EXPIRED',

          // Administrative
          'PAYMENT_DUE',
          'PAYMENT_RECEIVED',
          'LOW_BALANCE',
          'CONFIG_WARNING_CRITICAL',
          'CONFIG_WARNING',

          // System
          'SYSTEM_ANNOUNCEMENT',
          'MAINTENANCE_SCHEDULED',
        ])
        .notNullable()

      table.string('title', 255).notNullable()
      table.text('message').notNullable()
      table.json('data').nullable() // Extra metadata

      // Read status
      table.boolean('is_read').defaultTo(false)
      table.timestamp('read_at').nullable()

      // Delivery tracking
      table.boolean('sent_via_in_app').defaultTo(false)
      table.boolean('sent_via_email').defaultTo(false)
      table.boolean('sent_via_push').defaultTo(false)
      table.boolean('sent_via_sms').defaultTo(false)
      table.boolean('sent_via_whatsapp').defaultTo(false)
      table.timestamp('email_sent_at').nullable()
      table.text('email_error').nullable()

      // Optional action URL
      table.string('action_url', 512).nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['user_id', 'is_read', 'created_at'])
      table.index(['user_id', 'type'])
      table.index(['created_at'])
      table.index(['type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
