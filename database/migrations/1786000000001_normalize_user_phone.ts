import { BaseSchema } from '@adonisjs/lucid/schema'

// Normaliza User.phone pra dígitos apenas, in-place. Antes desta migration o
// campo era texto livre — convivia "(11) 99999-0000", "5511...", "11...".
// Lookup precisava de regexp_replace toda vez (não indexável). Pior: facilitava
// inconsistência (mesma pessoa cadastrada com dois formatos diferentes
// aparecia como dois usuários distintos pro WhatsApp).
//
// Estratégia em três passos:
//   1. UPDATE in-place strip de não-dígitos no que já está gravado
//   2. CHECK constraint pra rejeitar qualquer escrita futura com não-dígito
//   3. Index parcial em phone (deletedAt IS NULL) pra acelerar match
//
// O hook @beforeSave no model User garante normalização antes de gravar, mas
// o CHECK constraint é a rede de segurança — qualquer SQL crú que tente
// gravar lixo falha no banco.
export default class extends BaseSchema {
  async up() {
    // 1. Normaliza dados existentes. WHERE evita reescrever rows que já estão
    // limpas (não polui o autovacuum à toa).
    this.schema.raw(`
      UPDATE "User"
      SET phone = regexp_replace(phone, '\\D', '', 'g')
      WHERE phone IS NOT NULL
        AND phone <> regexp_replace(phone, '\\D', '', 'g')
    `)

    // 2. CHECK constraint: aceita NULL e string só com dígitos (inclui vazia
    // — algumas escolas gravam '' em vez de NULL, não vamos quebrar isso).
    this.schema.raw(`
      ALTER TABLE "User"
      ADD CONSTRAINT user_phone_digits_only
      CHECK (phone IS NULL OR phone ~ '^[0-9]*$')
    `)

    // 3. Index parcial pra lookup do WhatsApp/cadastro. Não é UNIQUE porque
    // casais que dividem celular são caso legítimo (ambos cadastros, mesmo
    // filho via StudentHasResponsible).
    this.schema.raw(`
      CREATE INDEX IF NOT EXISTS idx_user_phone_active
      ON "User" (phone)
      WHERE "deletedAt" IS NULL AND phone IS NOT NULL AND phone <> ''
    `)
  }

  async down() {
    this.schema.raw(`DROP INDEX IF EXISTS idx_user_phone_active`)
    this.schema.raw(`ALTER TABLE "User" DROP CONSTRAINT IF EXISTS user_phone_digits_only`)
    // Não dá pra reverter a normalização — os formatos originais foram
    // perdidos quando rodamos o UPDATE acima. Reverter aqui só desfaz o
    // schema, o conteúdo permanece digits-only.
  }
}
