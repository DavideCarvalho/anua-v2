import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Achievement from '#models/achievement'

interface AchievementTemplate {
  name: string
  description: string
  category: 'ACADEMIC' | 'ATTENDANCE' | 'BEHAVIOR' | 'SOCIAL' | 'SPECIAL'
  criteria: { eventType: string; [key: string]: unknown }
  points: number
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  recurrencePeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null
  isSecret?: boolean
}

const GLOBAL_ACHIEVEMENTS: AchievementTemplate[] = [
  // ===== ATTENDANCE =====
  {
    name: 'Primeira Presença',
    description: 'Esteve presente na primeira vez',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT' },
    points: 10,
    rarity: 'COMMON',
    recurrencePeriod: null,
  },
  {
    name: 'Presença de Ferro',
    description: 'Esteve presente 10 vezes',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT', count: 10 },
    points: 80,
    rarity: 'COMMON',
    recurrencePeriod: null,
    isSecret: false,
  },
  {
    name: 'Presença de Ouro',
    description: 'Esteve presente 30 vezes',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT', count: 30 },
    points: 200,
    rarity: 'RARE',
    recurrencePeriod: null,
  },
  {
    name: 'Lenda da Presença',
    description: 'Esteve presente 100 vezes',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT', count: 100 },
    points: 500,
    rarity: 'LEGENDARY',
    recurrencePeriod: null,
  },
  {
    name: 'Nunca Falta!',
    description: 'Esteve presente em todos os dias de aula por uma semana',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT', streak: 5 },
    points: 100,
    rarity: 'RARE',
    recurrencePeriod: 'WEEKLY',
  },
  // ===== GRADES =====
  {
    name: 'Nota-show',
    description: 'Tirou uma nota boa (7 ou mais)',
    category: 'ACADEMIC',
    criteria: { eventType: 'GRADE_GOOD' },
    points: 50,
    rarity: 'COMMON',
    recurrencePeriod: null,
  },
  {
    name: 'Aluno Exemplar',
    description: 'Tirou uma nota excelente (9 ou mais)',
    category: 'ACADEMIC',
    criteria: { eventType: 'GRADE_EXCELLENT' },
    points: 100,
    rarity: 'COMMON',
    recurrencePeriod: null,
  },
  {
    name: 'Mestre das Notas',
    description: 'Tirou 5 notas excelentes',
    category: 'ACADEMIC',
    criteria: { eventType: 'GRADE_EXCELLENT', count: 5 },
    points: 300,
    rarity: 'RARE',
    recurrencePeriod: null,
  },
  {
    name: 'Gênio da Escola',
    description: 'Tirou 10 notas excelentes',
    category: 'ACADEMIC',
    criteria: { eventType: 'GRADE_EXCELLENT', count: 10 },
    points: 500,
    rarity: 'LEGENDARY',
    recurrencePeriod: null,
  },
  {
    name: 'Primeira Tarefa',
    description: 'Entregou a primeira tarefa',
    category: 'ACADEMIC',
    criteria: { eventType: 'ASSIGNMENT_COMPLETED' },
    points: 20,
    rarity: 'COMMON',
    recurrencePeriod: null,
  },
  {
    name: 'Tarefeiro',
    description: 'Entregou 10 tarefas',
    category: 'ACADEMIC',
    criteria: { eventType: 'ASSIGNMENT_COMPLETED', count: 10 },
    points: 100,
    rarity: 'COMMON',
    recurrencePeriod: null,
  },
  {
    name: 'Estrela da Escola',
    description: 'Entregou 50 tarefas',
    category: 'ACADEMIC',
    criteria: { eventType: 'ASSIGNMENT_COMPLETED', count: 50 },
    points: 400,
    rarity: 'EPIC',
    recurrencePeriod: null,
  },
  // ===== STORE =====
  {
    name: 'Primeira Compra',
    description: 'Realizou a primeira compra na cantina',
    category: 'SPECIAL',
    criteria: { eventType: 'STORE_PURCHASE' },
    points: 0,
    rarity: 'COMMON',
    recurrencePeriod: null,
  },
  {
    name: 'Cliente Fiel',
    description: 'Comprou 10 vezes na cantina',
    category: 'SPECIAL',
    criteria: { eventType: 'STORE_PURCHASE', count: 10 },
    points: 0,
    rarity: 'COMMON',
    recurrencePeriod: null,
  },
  {
    name: 'Comprador Master',
    description: 'Comprou 50 vezes na cantina',
    category: 'SPECIAL',
    criteria: { eventType: 'STORE_PURCHASE', count: 50 },
    points: 0,
    rarity: 'RARE',
    recurrencePeriod: null,
  },
  // ===== STREAK =====
  {
    name: 'Início de Tudo',
    description: 'Sequência de 3 dias com atividades',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT', streak: 3 },
    points: 30,
    rarity: 'COMMON',
    recurrencePeriod: 'WEEKLY',
  },
  {
    name: 'Semana Perfeita',
    description: 'Sequência de 5 dias com presença',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT', streak: 5 },
    points: 75,
    rarity: 'COMMON',
    recurrencePeriod: 'WEEKLY',
  },
  {
    name: 'Mês de Ouro',
    description: 'Sequência de 20 dias com presença',
    category: 'ATTENDANCE',
    criteria: { eventType: 'ATTENDANCE_PRESENT', streak: 20 },
    points: 300,
    rarity: 'EPIC',
    recurrencePeriod: 'MONTHLY',
  },
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default class CreateGlobalAchievements extends BaseCommand {
  static commandName = 'create:global-achievements'
  static description = 'Cria achievements globais para gamificação (sem schoolId)'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({
    description: 'Simula a criação sem fazer alterações',
    alias: 'd',
  })
  declare dryRun?: boolean

  async run() {
    if (this.dryRun) {
      this.logger.warning('🔍 Modo DRY RUN - nenhuma alteração será feita')
    }

    this.logger.info(`📋 Criando ${GLOBAL_ACHIEVEMENTS.length} achievements globais...`)

    let created = 0
    let updated = 0

    for (const template of GLOBAL_ACHIEVEMENTS) {
      const slug = generateSlug(template.name)

      const existing = await Achievement.query()
        .where('slug', slug)
        .whereNull('schoolId')
        .whereNull('schoolChainId')
        .first()

      if (existing) {
        if (!this.dryRun) {
          await existing
            .merge({
              name: template.name,
              description: template.description,
              category: template.category,
              criteria: template.criteria,
              points: template.points,
              rarity: template.rarity,
              recurrencePeriod: template.recurrencePeriod,
              isSecret: template.isSecret ?? false,
              isActive: true,
              deletedAt: null,
            })
            .save()
        }
        updated++
        this.logger.info(`  ${this.colors.yellow('↻')} ${template.name} (atualizado)`)
      } else {
        if (!this.dryRun) {
          await Achievement.create({
            slug,
            name: template.name,
            description: template.description,
            category: template.category,
            criteria: template.criteria,
            points: template.points,
            rarity: template.rarity,
            recurrencePeriod: template.recurrencePeriod,
            isSecret: template.isSecret ?? false,
            isActive: true,
            schoolId: null,
            schoolChainId: null,
          })
        }
        created++
        this.logger.info(`  ${this.colors.green('✓')} ${template.name}`)
      }
    }

    this.logger.success(`
✅ Concluído!
   - Criados: ${created}
   - Atualizados: ${updated}
   - Total: ${created + updated}
    `)

    if (this.dryRun) {
      this.logger.warning('🔍 Execute novamente sem --dry-run para aplicar')
    }
  }
}
