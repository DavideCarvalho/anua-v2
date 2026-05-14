import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'
import db from '@adonisjs/lucid/services/db'

type ToolCtx = { schoolId: string; userId: string }

const ALLOWED_TABLES = [
  'Student',
  'User',
  'Class',
  'Course',
  'Level',
  'Subject',
  'Teacher',
  'Attendance',
  'Assignment',
  'StudentPayment',
  'Invoice',
  'Contract',
  'StudentGamification',
  'Achievement',
  'PointTransaction',
  'Leaderboard',
  'CanteenPurchase',
  'CanteenMeal',
  'CanteenMealReservation',
  'Event',
  'Notification',
  'Occurence',
  'SchoolAnnouncement',
]

const FORBIDDEN_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'CREATE',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'EXECUTE',
  'COPY',
] as const
const FORBIDDEN_LITERALS = ['--', '/*', '$$'] as const

export function createGetSchema(_ctx: ToolCtx) {
  return defineTool({
    name: 'getSchema',
    description:
      'Retorna a estrutura das tabelas do banco de dados da escola (nome da tabela, colunas, tipos). Use antes de queryDatabase para saber quais colunas existem.',
    parameters: z.object({}),
    execute: async () => {
      const tables = await db.rawQuery(`
        SELECT table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN (${ALLOWED_TABLES.map((t) => `'${t}'`).join(',')})
        ORDER BY table_name, ordinal_position
      `)

      const schema: Record<string, Array<{ column: string; type: string; nullable: boolean }>> = {}
      for (const row of tables.rows ?? []) {
        if (!schema[row.table_name]) schema[row.table_name] = []
        schema[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
        })
      }
      return { tables: schema }
    },
  })
}

export function createQueryDatabase(ctx: ToolCtx) {
  return defineTool({
    name: 'queryDatabase',
    description: `Executa uma consulta SQL SELECT no banco da escola. Máximo 100 resultados.
Use getSchema primeiro pra descobrir colunas reais. Sempre filtre pela escola usando o placeholder :currentSchoolId (com dois-pontos no início, exatamente como mostrado) — NÃO use o nome literal da coluna "schoolId".
Exemplo correto:   SELECT * FROM "Student" s JOIN "User" u ON u.id = s.id WHERE u."schoolId" = :currentSchoolId
Exemplo INCORRETO: SELECT * FROM "Student" WHERE schoolId = schoolId   (não use a palavra schoolId solta — sempre use :currentSchoolId)`,
    parameters: z.object({
      sql: z
        .string()
        .describe(
          'SELECT SQL. Filtre por escola usando :currentSchoolId (placeholder literal, com dois-pontos).'
        ),
      limit: z.number().default(20).describe('Máximo de resultados (max 100)'),
    }),
    execute: async ({ sql, limit }) => {
      const upper = sql.toUpperCase().trim()
      if (!upper.startsWith('SELECT')) {
        return { error: 'Apenas consultas SELECT são permitidas' }
      }

      for (const kw of FORBIDDEN_KEYWORDS) {
        if (new RegExp(`\\b${kw}\\b`, 'i').test(sql)) {
          return { error: `Palavra-chave ${kw} não é permitida` }
        }
      }
      for (const lit of FORBIDDEN_LITERALS) {
        if (sql.includes(lit)) {
          return { error: `Sequência ${lit} não é permitida` }
        }
      }

      const safeSql = sql.replace(/:currentSchoolId\b/g, `'${ctx.schoolId}'`)
      const limitedSql = safeSql.replace(/;\s*$/, '') + ` LIMIT ${Math.min(limit ?? 20, 100)}`

      try {
        const result = await db.rawQuery(limitedSql)
        return {
          rows: result.rows ?? [],
          rowCount: (result.rows ?? []).length,
        }
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : 'Erro desconhecido na consulta',
          sql: limitedSql,
        }
      }
    },
  })
}

toolRegistry.register('gestor', createGetSchema)
toolRegistry.register('gestor', createQueryDatabase)
toolRegistry.register('comunicador', createGetSchema)
toolRegistry.register('comunicador', createQueryDatabase)
