import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ContractEarlyDiscount'

  async up() {
    this.schema.raw(`
      ALTER TABLE "ContractEarlyDiscount"
      ALTER COLUMN "percentage" TYPE NUMERIC(5, 2)
      USING "percentage"::numeric;
    `)
  }

  async down() {
    this.schema.raw(`
      ALTER TABLE "ContractEarlyDiscount"
      ALTER COLUMN "percentage" TYPE INTEGER
      USING ROUND("percentage")::integer;
    `)
  }
}
