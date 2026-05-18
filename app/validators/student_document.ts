import vine from '@vinejs/vine'

/**
 * Validador para parâmetros de path da rota de upload de documento.
 * O arquivo em si (multipart) é validado dentro do controller
 * (tamanho, magic number, extensão) via `lib/file_security`.
 */
export const uploadStudentDocumentParamsValidator = vine.compile(
  vine.object({
    studentId: vine.string(),
    submissionId: vine.string(),
  })
)
