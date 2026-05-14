/**
 * Strip everything non-digit. Telefones na User.phone são guardados só com
 * dígitos (CHECK constraint no banco rejeita o contrário). Quando precisar
 * exibir formatado pra usuário, use um formatter na camada de view.
 *
 * - null/undefined → null
 * - string vazia depois do strip → null (não vamos guardar '' já que NULL é
 *   semanticamente mais correto pra "não tem telefone")
 */
export function normalizePhone(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null
  const digits = input.replace(/\D/g, '')
  return digits === '' ? null : digits
}
