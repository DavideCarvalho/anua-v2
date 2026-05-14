import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'

type DuplicateRow = {
  digits: string
  users_count: string
  schools_count: string
  user_ids: string[]
  schools: string[] | null
  roles: string[] | null
}

export default class CheckPhoneDuplicates extends BaseCommand {
  static commandName = 'check:phone-duplicates'
  static description =
    'Verifica se há números de celular duplicados entre usuários — relevante pro WhatsApp do assistente'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { rows } = await db.rawQuery<{ rows: DuplicateRow[] }>(`
      SELECT
        regexp_replace(coalesce(u.phone, ''), '\\D', '', 'g') AS digits,
        COUNT(*)::bigint AS users_count,
        COUNT(DISTINCT u."schoolId")::bigint AS schools_count,
        array_agg(DISTINCT u.id) AS user_ids,
        array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS schools,
        array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) AS roles
      FROM "User" u
      LEFT JOIN "School" s ON s.id = u."schoolId"
      LEFT JOIN "Role" r ON r.id = u."roleId"
      WHERE u.phone IS NOT NULL
        AND u.phone <> ''
        AND u."deletedAt" IS NULL
        AND regexp_replace(coalesce(u.phone, ''), '\\D', '', 'g') <> ''
        AND length(regexp_replace(coalesce(u.phone, ''), '\\D', '', 'g')) >= 8
      GROUP BY digits
      HAVING COUNT(*) > 1
      ORDER BY users_count DESC
      LIMIT 50
    `)

    const totalSets = rows.length
    let totalUsers = 0
    let crossSchool = 0
    for (const r of rows) {
      totalUsers += Number(r.users_count)
      if (Number(r.schools_count) > 1) crossSchool++
    }

    this.logger.info('\n=== Telefones duplicados (mais de 1 usuário com o mesmo número) ===\n')
    this.logger.info(`Grupos com número repetido: ${totalSets}`)
    this.logger.info(`Total de usuários afetados:  ${totalUsers}`)
    this.logger.info(`Grupos que cruzam escola:    ${crossSchool} (mesma pessoa em escolas diferentes)\n`)

    if (rows.length === 0) {
      this.logger.success('Nenhum número duplicado. Match por phone no WhatsApp resolve sozinho.')
      return
    }

    this.logger.info('Top 20:\n')
    for (const r of rows.slice(0, 20)) {
      const schoolsLabel = (r.schools ?? []).join(', ') || '—'
      const rolesLabel = (r.roles ?? []).join(', ') || '—'
      this.logger.info(
        `  ${r.digits.padEnd(15)} · ${String(r.users_count).padStart(2)} users · ${String(
          r.schools_count
        ).padStart(2)} school(s) · roles: ${rolesLabel} · escolas: ${schoolsLabel}`
      )
    }

    if (crossSchool > 0) {
      this.logger.warning(
        `\n⚠ ${crossSchool} grupo(s) com o mesmo número em escolas diferentes. ` +
          'O findUserByPhone do WhatsappChatService faz `.first()`, então quem o sistema ' +
          'escolhe é arbitrário (ordem natural do banco). Roteamento errado entre escolas ' +
          'é o sintoma mais provável.'
      )
    } else {
      this.logger.warning(
        '\n⚠ Há duplicatas dentro da mesma escola. Provável: responsável também é staff, ' +
          'pai com 2 filhos cada um registrando o mesmo contato, ou cadastros antigos não limpos. ' +
          'Pra WhatsApp, decidir a regra de match (priorizar role responsavel? a conta mais recente?).'
      )
    }
  }
}
