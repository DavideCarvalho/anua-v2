import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import StudentHasResponsible from '#models/student_has_responsible'
import Student from '#models/student'
import db from '@adonisjs/lucid/services/db'

export default class CheckStudentResponsibles extends BaseCommand {
  static commandName = 'check:student-responsibles'
  static description = 'Verifica responsáveis pedagógicos de um aluno pelo nome'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Nome do aluno (busca parcial)', required: true })
  declare studentName: string

  async run() {
    const student = await Student.query()
      .whereHas('user', (q) => q.where('name', 'ilike', `%${this.studentName}%`))
      .preload('user')
      .first()

    if (!student) {
      this.logger.error(`Aluno "${this.studentName}" não encontrado.`)
      return
    }

    this.logger.info(`\nAluno: ${student.user?.name} (id: ${student.id})\n`)

    const responsibles = await StudentHasResponsible.query()
      .where('studentId', student.id)
      .preload('responsible')

    this.logger.info(`Total de vínculos (StudentHasResponsible): ${responsibles.length}`)
    this.logger.info('\nDetalhes:')
    for (const r of responsibles) {
      this.logger.info(
        `  - ${r.responsible?.name ?? 'N/A'} | isPedagogical: ${r.isPedagogical} | isFinancial: ${r.isFinancial}`
      )
    }

    const pedagogicalCount = responsibles.filter((r) => r.isPedagogical).length
    this.logger.info(`\nResponsáveis pedagógicos (isPedagogical=true): ${pedagogicalCount}`)

    const raw = await db.from('StudentHasResponsible').where('studentId', student.id).select('*')
    this.logger.info('\nQuery raw (StudentHasResponsible):')
    this.logger.info(JSON.stringify(raw, null, 2))
  }
}
