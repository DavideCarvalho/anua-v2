/**
 * Mapeia a role do usuário (User.role.name no banco) para a persona do chat.
 * Roles desconhecidas devolvem null — o chat_controller rejeita com 403.
 *
 * Diretor/admin caem em "gestor" e podem alternar pra "comunicador" via override.
 * Coordenador/professor/responsável têm persona fixa (sem override) porque o
 * escopo de dados depende dessa identidade.
 */
export type ChatPersonaRole = 'gestor' | 'coordenador' | 'professor' | 'responsavel'

const ROLE_TO_PERSONA: Record<string, ChatPersonaRole> = {
  SUPER_ADMIN: 'gestor',
  ADMIN: 'gestor',
  SCHOOL_DIRECTOR: 'gestor',
  SCHOOL_ADMIN: 'gestor',
  SCHOOL_ADMINISTRATIVE: 'gestor',
  SCHOOL_BOARD: 'gestor',
  SCHOOL_COORDINATOR: 'coordenador',
  SCHOOL_TEACHER: 'professor',
  STUDENT_RESPONSIBLE: 'responsavel',
  RESPONSIBLE: 'responsavel',
}

// Quais personas o usuário pode escolher manualmente via body. Só o gestor
// tem opção de variante (comunicador). O resto fica preso na própria.
const PERSONA_OVERRIDES: Record<ChatPersonaRole, string[]> = {
  gestor: ['gestor', 'comunicador'],
  coordenador: ['coordenador'],
  professor: ['professor'],
  responsavel: ['responsavel'],
}

export function personaFromRole(roleName: string | null | undefined): ChatPersonaRole | null {
  if (!roleName) return null
  return ROLE_TO_PERSONA[roleName] ?? null
}

export function resolvePersonaId(
  defaultPersona: ChatPersonaRole,
  requested: string | undefined
): string {
  if (!requested) return defaultPersona
  const allowed = PERSONA_OVERRIDES[defaultPersona]
  return allowed.includes(requested) ? requested : defaultPersona
}

// Gate de screen.id vs persona. O validator aceita a união de todas as
// telas (escola_* + responsavel_*) porque é só um hint pro persona, mas
// um gestor mandando screen.id='responsavel_dashboard' confunde o system
// prompt (e podia ser usado pra inferir comportamento da persona errada).
// Regra: prefixo `responsavel_` exige persona 'responsavel'; prefixo
// `escola_` exige qualquer persona não-responsavel. Não é vetor de leak
// de dado (scope continua vindo do role real), é defesa de integridade.
export function isScreenAllowedForPersona(
  screenId: string,
  persona: ChatPersonaRole
): boolean {
  if (screenId.startsWith('responsavel_')) return persona === 'responsavel'
  if (screenId.startsWith('escola_')) return persona !== 'responsavel'
  // Screens sem prefixo conhecido: o validator não deixa chegar aqui hoje,
  // mas se algum dia adicionarmos uma tela neutra, manter o gate aberto
  // evita 403 falso. Adicione regra explícita acima quando isso mudar.
  return true
}
