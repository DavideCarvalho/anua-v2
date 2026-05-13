import { BaseCommand } from '@adonisjs/core/ace'
import { getAraraService } from '#services/arara_service'

const TEMPLATES = [
  {
    name: 'payment_due_reminder',
    category: 'UTILITY' as const,
    language: 'pt_BR',
    body: 'Olá {{1}}, a mensalidade de {{2}} vence em {{3}}. Valor: R${{4}}',
    headerType: 'text' as const,
    header: 'Lembrete de Pagamento',
  },
  {
    name: 'payment_overdue',
    category: 'UTILITY' as const,
    language: 'pt_BR',
    body: 'Olá {{1}}, a mensalidade de {{2}} no valor de R${{3}} está vencida desde {{4}}. Acesse: {{5}}',
  },
  {
    name: 'grade_published',
    category: 'UTILITY' as const,
    language: 'pt_BR',
    body: 'Olá {{1}}, a nota de {{2}} do(a) {{3}} já está disponível no portal.',
  },
  {
    name: 'school_announcement',
    category: 'UTILITY' as const,
    language: 'pt_BR',
    body: '{{1}} - Comunicado: {{2}}. Acesse {{3}} para mais detalhes.',
  },
  {
    name: 'occurrence_alert',
    category: 'UTILITY' as const,
    language: 'pt_BR',
    body: 'Olá {{1}}, foi registrada uma ocorrência para {{2}} em {{3}}. Acesse: {{4}}',
  },
  {
    name: 'new_assignment',
    category: 'UTILITY' as const,
    language: 'pt_BR',
    body: 'Olá {{1}}, o(a) {{2}} recebeu um novo trabalho de {{3}}. Entrega: {{4}}',
  },
  {
    name: 'inquiry_message',
    category: 'UTILITY' as const,
    language: 'pt_BR',
    body: 'Você recebeu uma nova mensagem sobre {{1}} no Anuá.',
  },
]

export default class SetupWhatsAppTemplates extends BaseCommand {
  static commandName = 'setup:whatsapp-templates'
  static description = 'Create all WhatsApp message templates in Arara'

  async run() {
    const arara = getAraraService()
    let created = 0
    let skipped = 0

    this.logger.info('Setting up WhatsApp templates...')

    for (const template of TEMPLATES) {
      try {
        const result = await arara.createTemplate(template)
        this.logger.info(`✓ Template "${template.name}" created (status: ${result.status})`)
        created++
      } catch (error) {
        this.logger.warning(`Template "${template.name}" may already exist: ${error instanceof Error ? error.message : 'Unknown error'}`)
        skipped++
      }
    }

    this.logger.info(`Done! ${created} templates created, ${skipped} skipped`)
  }
}
