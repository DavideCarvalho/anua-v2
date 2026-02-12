import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Event'

  async up() {
    await this.schema.raw(
      'ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "has_additional_costs" boolean NOT NULL DEFAULT false'
    )
    await this.schema.raw(
      'ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "additional_cost_amount" integer NULL'
    )
    await this.schema.raw(
      'ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "additional_cost_description" text NULL'
    )
    await this.schema.raw(
      'ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "additional_cost_installments" integer NULL'
    )

    await this.schema.raw(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Event' AND column_name = 'hasAdditionalCosts'
        ) THEN
          UPDATE "Event"
          SET "has_additional_costs" = COALESCE("has_additional_costs", "hasAdditionalCosts");
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Event' AND column_name = 'additionalCostAmount'
        ) THEN
          UPDATE "Event"
          SET "additional_cost_amount" = COALESCE("additional_cost_amount", "additionalCostAmount");
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Event' AND column_name = 'additionalCostDescription'
        ) THEN
          UPDATE "Event"
          SET "additional_cost_description" = COALESCE("additional_cost_description", "additionalCostDescription");
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Event' AND column_name = 'additionalCostInstallments'
        ) THEN
          UPDATE "Event"
          SET "additional_cost_installments" = COALESCE("additional_cost_installments", "additionalCostInstallments");
        END IF;
      END
      $$;
    `)
  }

  async down() {
    await this.schema.raw(
      'ALTER TABLE "Event" DROP COLUMN IF EXISTS "additional_cost_installments"'
    )
    await this.schema.raw('ALTER TABLE "Event" DROP COLUMN IF EXISTS "additional_cost_description"')
    await this.schema.raw('ALTER TABLE "Event" DROP COLUMN IF EXISTS "additional_cost_amount"')
    await this.schema.raw('ALTER TABLE "Event" DROP COLUMN IF EXISTS "has_additional_costs"')
  }
}
