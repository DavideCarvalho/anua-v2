/**
 * Magic numbers para validação de tipo de arquivo
 */
export const FILE_MAGIC_NUMBERS = {
  'image/jpeg': ['FF D8 FF', 'FF D8 FF E0', 'FF D8 FF E1', 'FF D8 FF E8'],
  'image/png': ['89 50 4E 47'],
  'image/webp': ['52 49 46 46'],
  'image/gif': ['47 49 46 38'],
} as const

export type AllowedMimeType = keyof typeof FILE_MAGIC_NUMBERS

/**
 * Verifica o magic number do arquivo
 */
export function validateFileMagicNumber(
  buffer: Buffer,
  allowedTypes: AllowedMimeType[]
): AllowedMimeType | null {
  const header = buffer.subarray(0, 8).toString('hex').toUpperCase()

  for (const [mimeType, signatures] of Object.entries(FILE_MAGIC_NUMBERS)) {
    if (allowedTypes.includes(mimeType as AllowedMimeType)) {
      for (const signature of signatures) {
        const normalizedSignature = signature.replace(/\s/g, '')
        if (header.startsWith(normalizedSignature)) {
          return mimeType as AllowedMimeType
        }
      }
    }
  }

  return null
}

/**
 * Sanitiza nome de arquivo para prevenir path traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const sanitized = filename
    .replace(/\.{2,}[\\/]/g, '') // ../ ou ..\
    .replace(/[\\/]/g, '-') // Substitui / e \ por -
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove caracteres especiais

  return sanitized || 'file'
}

/**
 * Extrai extensão segura do arquivo
 */
export function getSafeExtension(filename: string): string | null {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1].toLowerCase() : null
}

/**
 * Verifica se extensão é permitida
 */
export function isAllowedExtension(ext: string | null, allowed: string[]): boolean {
  if (!ext) return false
  return allowed.includes(ext.toLowerCase())
}

/**
 * Tipos MIME permitidos para upload
 */
export const ALLOWED_IMAGE_TYPES: AllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

/**
 * Tamanho máximo por tipo de arquivo (em bytes)
 */
export const MAX_FILE_SIZES = {
  image: 2 * 1024 * 1024, // 2MB
  document: 5 * 1024 * 1024, // 5MB
} as const
