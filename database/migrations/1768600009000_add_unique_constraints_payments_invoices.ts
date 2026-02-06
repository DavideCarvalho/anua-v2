import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // One active TUITION payment per studentHasLevel + month (excluding cancelled/renegotiated)
    this.schema.raw(`
      CREATE UNIQUE INDEX "uq_student_payment_tuition_per_month"
      ON "StudentPayment" ("studentHasLevelId", "month", "year")
      WHERE "type" = 'TUITION'
        AND "status" != 'CANCELLED'
        AND "status" != 'RENEGOTIATED'
        AND "studentHasLevelId" IS NOT NULL
    `)

    // One active invoice per student + contract + month (excluding cancelled/renegotiated)
    this.schema.raw(`
      CREATE UNIQUE INDEX "uq_invoice_per_student_contract_month"
      ON "Invoice" ("studentId", "contractId", "month", "year")
      WHERE "status" != 'CANCELLED'
        AND "status" != 'RENEGOTIATED'
        AND "month" IS NOT NULL
        AND "year" IS NOT NULL
    `)
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS "uq_student_payment_tuition_per_month"')
    this.schema.raw('DROP INDEX IF EXISTS "uq_invoice_per_student_contract_month"')
  }
}
