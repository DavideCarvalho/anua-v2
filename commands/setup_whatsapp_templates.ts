import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { getAraraService, AraraApiError, type TemplateParams } from '#services/arara_service'

/**
 * Templates de notificação do Anuá. Regras Meta/Arara que o body precisa
 * respeitar:
 *  - NÃO começar e NÃO terminar com {{var}} (precisa de texto fixo nos
 *    extremos — ponto final no fim costuma bastar)
 *  - Toda variável precisa de exemplo em `variableExamples` (posicional,
 *    index 0 → {{1}}, etc)
 *  - Meta exige proporção de texto fixo > texto variável — bodies curtos
 *    com muitas vars são rejeitados ("too many variables for its length")
 *  - Arara tem moderação própria: certas combinações disparam
 *    `BYPASS_ATTEMPT`. Reformule a sentença até passar (vimos isso com
 *    "Olá {{1}}, mensalidade de {{2}} vence em {{3}}..." — exato disparou,
 *    versão com "Lembramos que..." passou)
 *
 * Ordem das vars aqui DEVE bater com NOTIFICATION_TEMPLATE_MAP em
 * arara_service.ts — o buildVariables monta o array nessa mesma sequência.
 */
const TEMPLATES: TemplateParams[] = [
  {
    name: 'payment_due_reminder',
    category: 'UTILITY',
    language: 'pt_BR',
    headerType: 'text',
    header: 'Anuá · Lembrete de pagamento',
    body: 'Olá {{1}}, lembramos que a mensalidade do(a) aluno(a) {{2}} tem vencimento próximo no dia {{3}}, no valor de R$ {{4}} reais. Acesse o portal do Anuá pra realizar o pagamento e ver mais detalhes.',
    variableExamples: ['Maria', 'João', '15/05/2026', '850.00'],
  },
  {
    name: 'payment_overdue',
    category: 'UTILITY',
    language: 'pt_BR',
    headerType: 'text',
    header: 'Anuá · Boleto em atraso',
    body: 'Anuá: aviso de boleto em atraso. Responsável {{1}}, há um boleto do(a) aluno(a) {{2}} no valor de R$ {{3}} reais, com vencimento original em {{4}}. Confira no portal pelo endereço {{5}} no app do Anuá.',
    variableExamples: [
      'Maria',
      'João',
      '850.00',
      '15/04/2026',
      'https://app.anuaapp.com.br/pagar/abc',
    ],
  },
  {
    name: 'grade_published',
    category: 'UTILITY',
    language: 'pt_BR',
    headerType: 'text',
    header: 'Anuá · Nova nota disponível',
    // Nota: a frase "pra o(a) aluno(a) {{X}}" dispara o moderador da Arara
    // (BYPASS_ATTEMPT). Por isso o nome do aluno aparece nu, sem prefixo.
    body: 'Olá {{1}}, está disponível no Anuá uma nota da matéria {{2}} pra {{3}}. Veja o detalhe no portal.',
    variableExamples: ['Maria', 'Matemática', 'João'],
  },
  {
    name: 'school_announcement',
    category: 'UTILITY',
    language: 'pt_BR',
    headerType: 'text',
    header: 'Anuá · Comunicado da escola',
    body: 'Comunicado da escola {{1}}: {{2}}. Pra ver mais detalhes e as instruções completas, acesse o link a seguir no seu navegador {{3}} no portal do Anuá.',
    variableExamples: [
      'Escola Anuá',
      'Reunião de pais sexta às 19h',
      'https://app.anuaapp.com.br/comunicados',
    ],
  },
  {
    name: 'occurrence_alert',
    category: 'UTILITY',
    language: 'pt_BR',
    headerType: 'text',
    header: 'Anuá · Nova ocorrência',
    body: 'Olá {{1}}, registramos uma nova ocorrência referente ao(à) aluno(a) {{2}} no dia {{3}}. Pra ver os detalhes completos e poder responder, acesse o link {{4}} dentro do portal do Anuá.',
    variableExamples: ['Maria', 'João', '10/05/2026', 'https://app.anuaapp.com.br/ocorrencias/abc'],
  },
  {
    name: 'new_assignment',
    category: 'UTILITY',
    language: 'pt_BR',
    headerType: 'text',
    header: 'Anuá · Novo trabalho',
    // Idem grade_published — sem "pra o(a) aluno(a)" pra escapar do moderador.
    body: 'Olá {{1}}, está disponível no Anuá um novo trabalho da matéria {{3}} pra {{2}}, com entrega em {{4}}. Confira no portal.',
    variableExamples: ['Maria', 'João', 'Matemática', '15/05/2026'],
  },
  {
    name: 'inquiry_message',
    category: 'UTILITY',
    language: 'pt_BR',
    headerType: 'text',
    header: 'Anuá · Nova mensagem',
    // BYPASS_ATTEMPT da Arara é teimoso aqui — provavelmente porque o
    // template tem só 1 var e qualquer frase do tipo "nova mensagem
    // sobre/relacionada a {{X}}" bate com padrão de phishing. Tentando
    // estrutura totalmente diferente: nominal + sem verbo de "mensagem".
    body: 'Atualização no portal do Anuá referente ao(à) estudante {{1}}. Acesse o portal para ler o conteúdo completo.',
    variableExamples: ['João Silva'],
  },
]

export default class SetupWhatsAppTemplates extends BaseCommand {
  static commandName = 'setup:whatsapp-templates'
  static description = 'Cria/atualiza os templates de WhatsApp na Arara'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({
    description:
      'Apaga templates existentes antes de recriar — necessário pra mudar body/header (re-aprovação Meta)',
  })
  declare force: boolean

  async run() {
    const arara = getAraraService()
    let created = 0
    let alreadyExisted = 0
    let moderated = 0
    let failed = 0

    if (this.force) {
      this.logger.warning('--force: apagando templates existentes que vamos recriar...')
      const existing = await arara.listTemplates()
      const ourNames = new Set(TEMPLATES.map((t) => t.name))
      let deleted = 0
      for (const t of existing) {
        if (ourNames.has(t.name)) {
          try {
            await arara.deleteTemplate(t.id)
            this.logger.info(`× "${t.name}" apagado`)
            deleted++
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            this.logger.warning(`⚠ falha ao apagar "${t.name}": ${msg}`)
          }
        }
      }
      this.logger.info(`${deleted} templates apagados.`)
    }

    this.logger.info('Criando templates na Arara...')

    for (const template of TEMPLATES) {
      try {
        const result = await arara.createTemplate(template)
        this.logger.success(`✓ "${template.name}" criado (status: ${result.status})`)
        created++
      } catch (error) {
        if (error instanceof AraraApiError && error.status === 409) {
          // Arara devolve 409 pra dois casos diferentes — distinguir pela
          // mensagem pra o operador saber se precisa reformular o body.
          if (/moderacao de conteudo|BYPASS_ATTEMPT/i.test(error.message)) {
            this.logger.warning(
              `⚠ "${template.name}" bloqueado pela moderação Arara — reformule o body. (${error.message})`
            )
            moderated++
          } else {
            this.logger.info(`= "${template.name}" já existe — ignorado`)
            alreadyExisted++
          }
        } else {
          const msg = error instanceof Error ? error.message : String(error)
          this.logger.error(`✗ "${template.name}" falhou: ${msg}`)
          failed++
        }
      }
    }

    this.logger.info('---')
    this.logger.info(
      `Total: ${created} criados, ${alreadyExisted} já existiam, ${moderated} bloqueados pela moderação, ${failed} falhas`
    )

    if (failed > 0 || moderated > 0) {
      this.exitCode = 1
    }
  }
}
