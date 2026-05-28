import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // 1. Dead column on Contract — never fully wired in prod
    const contractHasDocusealCol = await this.db.rawQuery(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'Contract' AND column_name = 'docusealTemplateId'`
    )
    if (contractHasDocusealCol.rows.length > 0) {
      this.schema.alterTable('Contract', (table) => {
        table.dropColumn('docusealTemplateId')
      })
    }

    // 2. Rename StudentHasLevel.docuseal* → signature* (preserves data)
    const shlCols = await this.db.rawQuery(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'StudentHasLevel'
       AND column_name IN ('docusealSubmissionId', 'docusealSignatureStatus', 'signatureSubmissionId', 'signatureStatus')`
    )
    const shlColNames: string[] = shlCols.rows.map((r: { column_name: string }) => r.column_name)

    if (
      shlColNames.includes('docusealSubmissionId') &&
      !shlColNames.includes('signatureSubmissionId')
    ) {
      this.schema.raw(
        `ALTER TABLE "StudentHasLevel" RENAME COLUMN "docusealSubmissionId" TO "signatureSubmissionId"`
      )
    }
    if (
      shlColNames.includes('docusealSignatureStatus') &&
      !shlColNames.includes('signatureStatus')
    ) {
      this.schema.raw(
        `ALTER TABLE "StudentHasLevel" RENAME COLUMN "docusealSignatureStatus" TO "signatureStatus"`
      )
    }

    // 3. WebhookProvider enum: replace 'DOCUSEAL' with 'AUTENTIQUE'
    // Postgres can't drop enum values, so we recreate the type.
    this.schema.raw(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON e.enumtypid = t.oid
          WHERE t.typname = 'WebhookProvider' AND e.enumlabel = 'DOCUSEAL'
        ) THEN
          ALTER TYPE "WebhookProvider" RENAME TO "WebhookProvider_old";
          CREATE TYPE "WebhookProvider" AS ENUM ('ASAAS', 'ASAAS_RECARGA', 'AUTENTIQUE');

          ALTER TABLE "WebhookEvent"
            ALTER COLUMN provider TYPE "WebhookProvider"
            USING (
              CASE provider::text
                WHEN 'DOCUSEAL' THEN 'AUTENTIQUE'
                ELSE provider::text
              END
            )::"WebhookProvider";

          DROP TYPE "WebhookProvider_old";
        END IF;
      END$$;
    `)
  }

  async down() {
    // Reverse: restore Contract.docusealTemplateId
    const contractHasCol = await this.db.rawQuery(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'Contract' AND column_name = 'docusealTemplateId'`
    )
    if (contractHasCol.rows.length === 0) {
      this.schema.alterTable('Contract', (table) => {
        table.text('docusealTemplateId').nullable()
      })
    }

    // Reverse: rename signature* back to docuseal*
    this.schema.raw(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_name = 'StudentHasLevel' AND column_name = 'signatureSubmissionId')
        THEN
          ALTER TABLE "StudentHasLevel" RENAME COLUMN "signatureSubmissionId" TO "docusealSubmissionId";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_name = 'StudentHasLevel' AND column_name = 'signatureStatus')
        THEN
          ALTER TABLE "StudentHasLevel" RENAME COLUMN "signatureStatus" TO "docusealSignatureStatus";
        END IF;
      END$$;
    `)

    // Reverse: restore DOCUSEAL enum value
    this.schema.raw(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON e.enumtypid = t.oid
          WHERE t.typname = 'WebhookProvider' AND e.enumlabel = 'AUTENTIQUE'
        ) THEN
          ALTER TYPE "WebhookProvider" RENAME TO "WebhookProvider_old";
          CREATE TYPE "WebhookProvider" AS ENUM ('ASAAS', 'ASAAS_RECARGA', 'DOCUSEAL');

          ALTER TABLE "WebhookEvent"
            ALTER COLUMN provider TYPE "WebhookProvider"
            USING (
              CASE provider::text
                WHEN 'AUTENTIQUE' THEN 'DOCUSEAL'
                ELSE provider::text
              END
            )::"WebhookProvider";

          DROP TYPE "WebhookProvider_old";
        END IF;
      END$$;
    `)
  }
}
