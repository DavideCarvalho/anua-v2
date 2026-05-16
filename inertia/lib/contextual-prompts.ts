// Tipos espelham o estado de filtros em /escola/index.tsx. Mantém em sync
// se aparecer um filtro novo lá.
export type TabFilterState = {
  academicPeriodId: string
  subPeriodId: string
  courseId: string
  levelId: string
  classId: string
}

export type FilterLabels = {
  academicPeriodName?: string
  courseName?: string
  levelName?: string
  className?: string
}

const MAX_LABEL_LENGTH = 50

function isSet(value: string): boolean {
  return value !== 'all' && value.length > 0
}

export function formatContextLabel(filters: TabFilterState, labels: FilterLabels): string {
  if (!isSet(filters.academicPeriodId)) return 'Visão geral da escola'

  const parts: string[] = []
  if (labels.academicPeriodName) parts.push(labels.academicPeriodName)
  if (isSet(filters.courseId) && labels.courseName) parts.push(labels.courseName)
  if (isSet(filters.levelId) && !isSet(filters.classId) && labels.levelName) {
    parts.push(labels.levelName)
  }
  if (isSet(filters.classId) && labels.className) parts.push(labels.className)

  const label = parts.join(' · ')
  if (label.length <= MAX_LABEL_LENGTH) return label
  return label.slice(0, MAX_LABEL_LENGTH - 1) + '…'
}

const GENERAL_PROMPTS = [
  'Quais turmas têm mais alunos em risco esse ano?',
  'Mostra a frequência média por curso no último mês',
  'Quais professores têm mais notas pendentes pra lançar?',
  'Resumo da inadimplência atual',
]

function periodPrompts(periodName: string): string[] {
  return [
    `Como está o desempenho geral em ${periodName}?`,
    `Quais alunos estão em risco no ${periodName}?`,
    `Compara a frequência entre cursos no ${periodName}`,
    `Resumo da inadimplência no ${periodName}`,
  ]
}

function classPrompts(className: string): string[] {
  return [
    `Como está a frequência da turma ${className}?`,
    `Quais alunos da turma ${className} estão em risco?`,
    `Distribuição de notas em ${className}`,
    `Lança presença da turma ${className} hoje`,
  ]
}

export function buildContextualPrompts(filters: TabFilterState, labels: FilterLabels): string[] {
  if (isSet(filters.classId) && labels.className) {
    return classPrompts(labels.className)
  }
  if (isSet(filters.academicPeriodId) && labels.academicPeriodName) {
    return periodPrompts(labels.academicPeriodName)
  }
  return GENERAL_PROMPTS
}
