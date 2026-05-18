import { BaseSchema } from '@adonisjs/lucid/schema'

const NEW_TYPES = [
  'ENROLLMENT_STARTED',
  'ENROLLMENT_DOCUMENT_REJECTED',
  'ENROLLMENT_DOCUMENT_APPROVED',
  'ENROLLMENT_ALL_DOCUMENTS_APPROVED',
  'ENROLLMENT_SIGNATURE_PENDING',
  'ENROLLMENT_PAYMENT_RECEIVED',
  'ENROLLMENT_REMINDER',
  'ENROLLMENT_COMPLETED',
]

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
    // PostgreSQL não suporta DROP VALUE em enums — para reverter, recriar o enum
    // sem esses valores. Em desenvolvimento, geralmente usa-se DROP TYPE CASCADE.
    // Deixar down vazio: reverter desta migration manualmente se necessário.
  }
}
