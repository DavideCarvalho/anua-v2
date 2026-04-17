import AcademicPeriod from '#models/academic_period'
import AppException from '#exceptions/app_exception'

export async function resolveActiveClassAcademicPeriodId(classId: string): Promise<string> {
  const activeClassPeriods = await AcademicPeriod.query()
    .distinct('AcademicPeriod.id')
    .join('ClassHasAcademicPeriod', 'ClassHasAcademicPeriod.academicPeriodId', 'AcademicPeriod.id')
    .where('ClassHasAcademicPeriod.classId', classId)
    .where('AcademicPeriod.isActive', true)
    .whereNull('AcademicPeriod.deletedAt')
    .limit(2)

  if (activeClassPeriods.length === 0) {
    throw AppException.notFound('Nenhum período letivo ativo vinculado a esta turma')
  }

  if (activeClassPeriods.length > 1) {
    throw AppException.badRequest(
      'Há mais de um período letivo ativo vinculado a esta turma. Ajuste os períodos ativos antes de continuar.'
    )
  }

  return activeClassPeriods[0]!.id
}
