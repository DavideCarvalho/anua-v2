import type { ChatScope } from './chat_scope.js'

/**
 * Helpers que toda tool deve usar antes de executar a query. Gestor passa
 * direto (sem filtro). Para os outros papéis, retorna uma mensagem de erro
 * (em PT-BR, formato amigável pro modelo passar adiante) ou null se autorizado.
 *
 * Importante: o modelo NÃO controla esses checks. Mesmo que ele invente um
 * UUID, o check rejeita antes do banco ser tocado.
 */
export function denyIfClassOutOfScope(scope: ChatScope, classId: string): string | null {
  if (scope.role === 'gestor') return null
  if (scope.classIds.includes(classId)) return null
  return 'Você não tem acesso a essa turma.'
}

/**
 * Check de identidade: o aluno está no escopo geral do usuário?
 * Útil pra tools que só listam dados do filho sem distinguir papel
 * (ex: getMyChildren).
 */
export function denyIfStudentOutOfScope(scope: ChatScope, studentId: string): string | null {
  if (scope.role === 'gestor') return null
  if (scope.studentIds.includes(studentId)) return null
  return 'Você não tem acesso a esse aluno.'
}

/**
 * Check pedagógico ESPECÍFICO PRO RESPONSÁVEL: a flag isPedagogical do vínculo
 * StudentHasResponsible tem que estar marcada. Responsável só-financeiro é
 * bloqueado com mensagem clara.
 *
 * Para gestor/professor/coordenador, a noção "pedagógico vs financeiro" não
 * existe (eles não têm flags) — então o check vira o scope geral (passa pra
 * gestor, valida studentIds pra os outros). O nome só destaca o caso que
 * o flag matters.
 */
export function denyIfResponsavelLacksPedagogicalAccess(
  scope: ChatScope,
  studentId: string
): string | null {
  if (scope.role === 'gestor') return null
  if (scope.role === 'responsavel') {
    if (scope.studentIdsPedagogical.includes(studentId)) return null
    if (scope.studentIds.includes(studentId)) {
      // Tem vínculo com o aluno, mas é só financeiro.
      return 'Você está cadastrado apenas como responsável financeiro desse aluno — informações pedagógicas (notas, frequência, atividades, comunicados) ficam com o responsável pedagógico.'
    }
    return 'Você não tem acesso a esse aluno.'
  }
  return denyIfStudentOutOfScope(scope, studentId)
}

/**
 * Check financeiro ESPECÍFICO PRO RESPONSÁVEL: a flag isFinancial tem que
 * estar marcada. Responsável só-pedagógico é bloqueado. Para outros papéis,
 * cai no scope geral.
 */
export function denyIfResponsavelLacksFinancialAccess(
  scope: ChatScope,
  studentId: string
): string | null {
  if (scope.role === 'gestor') return null
  if (scope.role === 'responsavel') {
    if (scope.studentIdsFinancial.includes(studentId)) return null
    if (scope.studentIds.includes(studentId)) {
      return 'Você está cadastrado apenas como responsável pedagógico desse aluno — boletos e pagamentos ficam com o responsável financeiro.'
    }
    return 'Você não tem acesso a esse aluno.'
  }
  return denyIfStudentOutOfScope(scope, studentId)
}
