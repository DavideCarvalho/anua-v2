import { BaseSchema } from '@adonisjs/lucid/schema'

const NEW_TYPES = ['EXAM_SCHEDULED', 'EXAM_GRADE_AVAILABLE']

export default class extends BaseSchema {
  async up() {
    for (const value of NEW_TYPES) {
      await this.db.rawQuery(`
        DO $$ BEGIN
          ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS '${value}';
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `)
    }
  }

  async down() {
    // PostgreSQL não suporta DROP VALUE em enums; reverter manualmente recriando o enum.
  }
}
