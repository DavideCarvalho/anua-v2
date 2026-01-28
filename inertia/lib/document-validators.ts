/**
 * Validates a CPF number using the standard algorithm
 * @param cpf - The CPF string (can contain dots and dashes)
 * @returns true if valid, false otherwise
 */
export function validateCpf(cpf: string): boolean {
  // Remove non-digits
  const cleanCpf = cpf.replace(/\D/g, '')

  // CPF must have 11 digits
  if (cleanCpf.length !== 11) {
    return false
  }

  // Check for known invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false
  }

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cleanCpf.charAt(9))) {
    return false
  }

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {
    remainder = 0
  }
  if (remainder !== parseInt(cleanCpf.charAt(10))) {
    return false
  }

  return true
}

/**
 * Validates a CNPJ number using the standard algorithm
 * @param cnpj - The CNPJ string (can contain dots, dashes, and slashes)
 * @returns true if valid, false otherwise
 */
export function validateCnpj(cnpj: string): boolean {
  // Remove non-digits
  const cleanCnpj = cnpj.replace(/\D/g, '')

  // CNPJ must have 14 digits
  if (cleanCnpj.length !== 14) {
    return false
  }

  // Check for known invalid patterns (all same digits)
  if (/^(\d)\1{13}$/.test(cleanCnpj)) {
    return false
  }

  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (digit1 !== parseInt(cleanCnpj.charAt(12))) {
    return false
  }

  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  if (digit2 !== parseInt(cleanCnpj.charAt(13))) {
    return false
  }

  return true
}

/**
 * Validates a document based on its type
 * @param documentType - 'CPF', 'CNPJ', 'RG', or 'PASSPORT'
 * @param documentNumber - The document number
 * @returns { valid: boolean, error?: string }
 */
export function validateDocument(
  documentType: string,
  documentNumber: string
): { valid: boolean; error?: string } {
  const cleanNumber = documentNumber.replace(/\D/g, '')

  if (!cleanNumber) {
    return { valid: false, error: 'Número do documento é obrigatório' }
  }

  switch (documentType) {
    case 'CPF':
      if (cleanNumber.length !== 11) {
        return { valid: false, error: 'CPF deve ter 11 dígitos' }
      }
      if (!validateCpf(cleanNumber)) {
        return { valid: false, error: 'CPF inválido' }
      }
      return { valid: true }

    case 'CNPJ':
      if (cleanNumber.length !== 14) {
        return { valid: false, error: 'CNPJ deve ter 14 dígitos' }
      }
      if (!validateCnpj(cleanNumber)) {
        return { valid: false, error: 'CNPJ inválido' }
      }
      return { valid: true }

    case 'RG':
      // RG doesn't have a standard format across states, just check if it has at least some digits
      if (cleanNumber.length < 5) {
        return { valid: false, error: 'RG deve ter pelo menos 5 dígitos' }
      }
      return { valid: true }

    case 'PASSPORT':
      // Passport can contain letters and numbers
      if (documentNumber.trim().length < 5) {
        return { valid: false, error: 'Passaporte deve ter pelo menos 5 caracteres' }
      }
      return { valid: true }

    default:
      return { valid: true }
  }
}

/**
 * Formats a CPF number
 * @param cpf - The CPF string
 * @returns Formatted CPF (XXX.XXX.XXX-XX)
 */
export function formatCpf(cpf: string): string {
  const cleanCpf = cpf.replace(/\D/g, '')
  if (cleanCpf.length !== 11) return cpf
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formats a CNPJ number
 * @param cnpj - The CNPJ string
 * @returns Formatted CNPJ (XX.XXX.XXX/XXXX-XX)
 */
export function formatCnpj(cnpj: string): string {
  const cleanCnpj = cnpj.replace(/\D/g, '')
  if (cleanCnpj.length !== 14) return cnpj
  return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}
