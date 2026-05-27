import { Job } from '@adonisjs/queue'
import { generateText } from 'ai'
import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import ChangelogDigestMail from '#mails/changelog_digest_mail'
import { getModel } from '#ai/ai_provider'
import logger from '@adonisjs/core/services/logger'

type Audience = 'responsavel' | 'escola' | 'admin'

interface ChangelogItem {
  text: string
  audience: string
}

interface SendChangelogDigestPayload {
  entries: Array<{ title: string; items: ChangelogItem[] }>
}

const AUDIENCE_ROLE_MAP: Record<Audience, string[]> = {
  responsavel: ['STUDENT_RESPONSIBLE'],
  escola: ['SCHOOL_DIRECTOR', 'SCHOOL_ADMIN', 'COORDINATOR', 'SCHOOL_TEACHER', 'SCHOOL_CANTEEN'],
  admin: ['SUPER_ADMIN', 'ADMIN'],
}

const AUDIENCE_LABEL: Record<Audience, string> = {
  responsavel: 'responsável (pai/mãe de aluno)',
  escola: 'coordenador ou diretor de escola',
  admin: 'administrador da plataforma',
}

function filterItemsForAudience(items: ChangelogItem[], audience: Audience): string[] {
  return items
    .filter((i) => i.audience === audience || i.audience === 'all')
    .map((i) => i.text)
}

async function generateEmailForAudience(
  audience: Audience,
  items: string[]
): Promise<{ subject: string; body: string }> {
  try {
    const result = await generateText({
      model: getModel(),
      system: `Você é o redator do Anuá, sistema de gestão escolar brasileiro. Escreva emails curtos, diretos, acolhedores. Sem formalidade excessiva. Tom: como um colega que entende a rotina escolar. Nunca use em-dash. Use vírgulas e pontos.`,
      prompt: `Escreva um email de novidades do Anuá pra um ${AUDIENCE_LABEL[audience]}.

As novidades são:
${items.map((i) => `- ${i}`).join('\n')}

Retorne em JSON: { "subject": "assunto do email (curto)", "body": "corpo do email em texto simples, com quebras de linha. Use NOME como placeholder pro nome do destinatário." }

Regras de formato:
- Comece com "Oi, NOME!"
- Se tiver até 3 novidades: escreva um texto corrido curto (2-3 frases) explicando cada uma naturalmente
- Se tiver mais de 3: destaque as 3 mais importantes em texto corrido, depois liste o resto em bullet points (• item)
- Se tiver ajustes pequenos ou fixes, não liste. Termine com "e muito mais. Veja todas as novidades na aba Novidades dentro do app."
- Máximo 120 palavras no body
- Termine com "Equipe Anuá"
- Não use "Prezado", "Informamos", ou tom formal`,
      maxOutputTokens: 300,
    })

    const parsed = JSON.parse(result.text)
    return { subject: parsed.subject, body: parsed.body }
  } catch (error) {
    logger.warn({ error, audience }, 'AI text generation failed, using fallback')
    return {
      subject: 'Novidades do Anuá',
      body: `Oi, NOME!\n\nConfira as melhorias que fizemos:\n\n${items.map((i) => `• ${i}`).join('\n')}\n\ne muito mais. Veja todas as novidades na aba Novidades dentro do app.\n\nEquipe Anuá`,
    }
  }
}

export default class SendChangelogDigestJob extends Job<SendChangelogDigestPayload> {
  static readonly jobName = 'SendChangelogDigestJob'

  static options = {
    queue: 'default',
    maxRetries: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
  }

  async execute(): Promise<void> {
    const { entries } = this.payload

    const users = await User.query()
      .whereNotNull('email')
      .where('active', true)
      .preload('role')

    const audiences: Audience[] = ['responsavel', 'escola', 'admin']
    let totalSent = 0
    let totalFailed = 0

    for (const audience of audiences) {
      const roles = AUDIENCE_ROLE_MAP[audience]
      const audienceUsers = users.filter((u) => roles.includes(u.role?.name ?? ''))
      if (audienceUsers.length === 0) continue

      const allItems = entries.flatMap((e) => filterItemsForAudience(e.items, audience))
      if (allItems.length === 0) continue

      const generated = await generateEmailForAudience(audience, allItems)
      logger.info(
        { audience, userCount: audienceUsers.length, subject: generated.subject },
        'Generated changelog email for audience'
      )

      for (const user of audienceUsers) {
        if (!user.email) continue
        try {
          const firstName = user.name?.split(' ')[0] ?? 'Usuário'
          const personalBody = generated.body.replace(/NOME/g, firstName)

          await mail.send(
            new ChangelogDigestMail(user, [
              { title: generated.subject, items: [personalBody] },
            ])
          )
          totalSent++
        } catch (error) {
          totalFailed++
          logger.error({ userId: user.id, error }, 'Failed to send changelog digest')
        }
      }
    }

    logger.info({ sent: totalSent, failed: totalFailed }, 'Changelog digest job completed')
  }
}
