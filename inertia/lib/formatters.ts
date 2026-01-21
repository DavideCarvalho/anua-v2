import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$)
 */
export function brazilianRealFormatter(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma data para o formato brasileiro (dd/MM/yyyy)
 */
export function brazilianDateFormatter(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
}

/**
 * Formata uma data para o formato brasileiro com hora (dd/MM/yyyy HH:mm)
 */
export function brazilianDateTimeFormatter(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

/**
 * Mapa de tradução de nomes de cargos
 */
const roleTranslations: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN: 'Administrador',
  SCHOOL_DIRECTOR: 'Diretor',
  SCHOOL_COORDINATOR: 'Coordenador',
  SCHOOL_ADMIN: 'Administrador Escolar',
  SCHOOL_ADMINISTRATIVE: 'Administrativo',
  SCHOOL_TEACHER: 'Professor',
  SCHOOL_CANTEEN: 'Cantina',
  TEACHER: 'Professor',
  STUDENT: 'Aluno',
  RESPONSIBLE: 'Responsável',
  STUDENT_RESPONSIBLE: 'Responsável',
}

/**
 * Traduz o nome do cargo para português
 */
export function formatRoleName(role: string | null | undefined): string {
  if (!role) return '-'
  return roleTranslations[role] || role
}

// ============================================================================
// Education Nomenclature Helpers
// ============================================================================

export type AcademicPeriodSegment =
  | 'KINDERGARTEN'
  | 'ELEMENTARY'
  | 'HIGHSCHOOL'
  | 'TECHNICAL'
  | 'UNIVERSITY'

export type EducationType = 'formal' | 'technical'

/**
 * Determina o tipo de ensino baseado no segment do período acadêmico
 */
export function getEducationType(segment: AcademicPeriodSegment): EducationType {
  return segment === 'KINDERGARTEN' || segment === 'ELEMENTARY' || segment === 'HIGHSCHOOL'
    ? 'formal'
    : 'technical'
}

/**
 * Retorna o label para "Course" baseado no tipo de ensino
 * - Ensino Formal: "Ano"
 * - Ensino Técnico/Superior: "Curso"
 */
export function getCourseLabel(segment: AcademicPeriodSegment): string {
  return getEducationType(segment) === 'formal' ? 'Ano' : 'Curso'
}

/**
 * Retorna o label para "Level" baseado no tipo de ensino
 * - Ensino Formal: "Ano escolar" (ex: 9º ano, 8º ano)
 * - Ensino Técnico/Superior: "Semestre"
 */
export function getLevelLabel(segment: AcademicPeriodSegment): string {
  return getEducationType(segment) === 'formal' ? 'Ano escolar' : 'Semestre'
}

/**
 * Retorna o label curto para "Level" baseado no tipo de ensino
 * - Ensino Formal: "Ano"
 * - Ensino Técnico/Superior: "Semestre"
 */
export function getLevelLabelShort(segment: AcademicPeriodSegment): string {
  return getEducationType(segment) === 'formal' ? 'Ano' : 'Semestre'
}

/**
 * Retorna labels para "Level" com artigos e plurais
 */
export function getLevelLabels(segment: AcademicPeriodSegment) {
  const isFormal = getEducationType(segment) === 'formal'

  return {
    singular: isFormal ? 'Ano escolar' : 'Semestre',
    plural: isFormal ? 'Anos escolares' : 'Semestres',
    definite: isFormal ? 'o Ano escolar' : 'o Semestre',
    indefinite: isFormal ? 'um Ano escolar' : 'um Semestre',
    pluralDefinite: isFormal ? 'os Anos escolares' : 'os Semestres',
    pluralIndefinite: isFormal ? 'uns Anos escolares' : 'uns Semestres',
    short: isFormal ? 'Ano' : 'Semestre',
    lowercase: isFormal ? 'ano escolar' : 'semestre',
    pluralLowercase: isFormal ? 'anos escolares' : 'semestres',
  }
}

/**
 * Retorna labels para "Course" com artigos e plurais
 */
export function getCourseLabels(segment: AcademicPeriodSegment) {
  const isFormal = getEducationType(segment) === 'formal'

  return {
    singular: isFormal ? 'Ano' : 'Curso',
    plural: isFormal ? 'Anos' : 'Cursos',
    definite: isFormal ? 'o Ano' : 'o Curso',
    indefinite: isFormal ? 'um Ano' : 'um Curso',
    pluralDefinite: isFormal ? 'os Anos' : 'os Cursos',
    pluralIndefinite: isFormal ? 'uns Anos' : 'uns Cursos',
    lowercase: isFormal ? 'ano' : 'curso',
    pluralLowercase: isFormal ? 'anos' : 'cursos',
  }
}

/**
 * Retorna labels para "Class"
 * Nota: Não varia baseado no tipo de ensino
 */
export function getClassLabels(_segment: AcademicPeriodSegment) {
  return {
    singular: 'Turma',
    plural: 'Turmas',
    definite: 'a Turma',
    indefinite: 'uma Turma',
    pluralDefinite: 'as Turmas',
    pluralIndefinite: 'umas Turmas',
    lowercase: 'turma',
    pluralLowercase: 'turmas',
  }
}
