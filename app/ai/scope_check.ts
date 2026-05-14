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

export function denyIfStudentOutOfScope(scope: ChatScope, studentId: string): string | null {
  if (scope.role === 'gestor') return null
  if (scope.studentIds.includes(studentId)) return null
  return 'Você não tem acesso a esse aluno.'
}
