type DocumentType = 'CPF' | 'RG' | 'PASSPORT' | string | null | undefined

export function normalizeDocumentNumber(documentNumber: string, documentType?: DocumentType) {
  if (!documentNumber) return ''

  if (documentType === 'PASSPORT') {
    return documentNumber.trim()
  }

  return documentNumber.replace(/\D/g, '')
}
