import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

type CommunicationRow = {
  id: string
  title: string
  body: string
  publishedAt: string | null
  requiresAcknowledgement: boolean
  acknowledgedAt: string | null
  scopeType: string | null
  studentName: string | null
}

const DESCRIPTION = `Comunicados publicados pela escola.

Parâmetros:
- limit (1-50, opcional, default 10): quantos retornar.
- onlyUnacknowledged (boolean, opcional): se true, traz só comunicados que ainda não foram confirmados (apenas relevante para responsável).

Retorna { communications: [{ id, title, body, publishedAt, requiresAcknowledgement, acknowledgedAt, scopeType, studentName }] }.

Comportamento por papel:
- Gestor/coordenador/professor: comunicados school-wide PUBLISHED no escola (não filtra por turma — use a página de comunicados pra isso).
- Responsável: comunicados endereçados especificamente a ele/seus filhos. scopeType pode ser SCHOOL/CLASS/STUDENT/LEVEL/COURSE indicando quem foi o público-alvo. studentName preenchido quando o comunicado é específico de um filho.

acknowledgedAt indica quando o responsável confirmou leitura — null se requiresAcknowledgement=true e ainda não foi confirmado.`

export function createGetCommunications(ctx: ToolContext) {
  return defineTool({
    name: 'getCommunications',
    description: DESCRIPTION,
    parameters: z.object({
      limit: z.number().int().min(1).max(50).optional().describe('Quantidade a retornar (default 10)'),
      onlyUnacknowledged: z.boolean().optional().describe('Só pendentes de leitura (responsável)'),
    }),
    execute: async ({ limit, onlyUnacknowledged }) => {
      const finalLimit = limit ?? 10

      if (ctx.scope.role === 'responsavel') {
        const { rows } = await db.rawQuery<{ rows: CommunicationRow[] }>(
          `
            SELECT sa.id,
              sa.title,
              sa.body,
              sa."publishedAt"::text AS "publishedAt",
              sa."requiresAcknowledgement",
              sar."acknowledgedAt"::text AS "acknowledgedAt",
              saa."scopeType" AS "scopeType",
              u.name AS "studentName"
            FROM "SchoolAnnouncementRecipient" sar
            JOIN "SchoolAnnouncement" sa ON sa.id = sar."announcementId"
            LEFT JOIN "SchoolAnnouncementAudience" saa
              ON saa."announcementId" = sa.id
              AND saa."scopeId" = COALESCE(sar."studentId"::text, '')
            LEFT JOIN "Student" s ON s.id = sar."studentId"
            LEFT JOIN "User" u ON u.id = s.id
            WHERE sar."responsibleId" = :userId
              AND sa.status = 'PUBLISHED'
              ${onlyUnacknowledged ? `AND sar."acknowledgedAt" IS NULL AND sa."requiresAcknowledgement" = true` : ''}
            ORDER BY sa."publishedAt" DESC NULLS LAST
            LIMIT :limit
          `,
          { userId: ctx.userId, limit: finalLimit }
        )
        return { communications: rows }
      }

      // gestor/coord/professor — comunicados school-wide PUBLISHED da escola
      const { rows } = await db.rawQuery<{ rows: CommunicationRow[] }>(
        `
          SELECT sa.id,
            sa.title,
            sa.body,
            sa."publishedAt"::text AS "publishedAt",
            sa."requiresAcknowledgement",
            NULL::text AS "acknowledgedAt",
            NULL::text AS "scopeType",
            NULL::text AS "studentName"
          FROM "SchoolAnnouncement" sa
          WHERE sa."schoolId" = :schoolId
            AND sa.status = 'PUBLISHED'
          ORDER BY sa."publishedAt" DESC NULLS LAST
          LIMIT :limit
        `,
        { schoolId: ctx.schoolId, limit: finalLimit }
      )
      return { communications: rows }
    },
  })
}

toolRegistry.register('gestor', createGetCommunications)
toolRegistry.register('coordenador', createGetCommunications)
toolRegistry.register('professor', createGetCommunications)
toolRegistry.register('responsavel', createGetCommunications)
