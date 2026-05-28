import { generate } from '@pdfme/generator'
import { signature, date } from '@pdfme/schemas'
import { format as formatDate } from 'date-fns'
import drive from '@adonisjs/drive/services/main'
import type { Template } from '@pdfme/common'
import type { SignatureTemplateSchemas, SignatureTemplateField } from '#models/contract'

interface GenerateInput {
  /** Key do PDF base no storage (Contract.signatureTemplatePdfKey) */
  pdfKey: string
  /** Schemas posicionados pelo Designer (Contract.signatureTemplateSchemas) */
  schemas: SignatureTemplateSchemas
  /** Data de referência usada pra preencher campos de data (default: agora) */
  referenceDate?: Date
}

function buildInputsForFields(
  schemas: SignatureTemplateSchemas,
  referenceDate: Date
): Record<string, string>[] {
  const isoForPdfme = formatDate(referenceDate, 'yyyy/MM/dd')

  const input: Record<string, string> = {}

  for (const page of schemas) {
    for (const field of page) {
      if (field.type === 'date') {
        input[field.name] = isoForPdfme
      } else if (field.type === 'signature') {
        // Autentique vai estampar a assinatura — deixamos vazio
        input[field.name] = ''
      }
    }
  }

  return [input]
}

function fieldToPdfmeSchema(field: SignatureTemplateField) {
  return {
    name: field.name,
    type: field.type,
    position: field.position,
    width: field.width,
    height: field.height,
    rotate: field.rotate ?? 0,
    opacity: field.opacity ?? 1,
    ...(field.format ? { format: field.format } : {}),
    ...(field.fontSize !== undefined ? { fontSize: field.fontSize } : {}),
    ...(field.alignment ? { alignment: field.alignment } : {}),
    ...(field.fontColor ? { fontColor: field.fontColor } : {}),
    ...(field.backgroundColor ? { backgroundColor: field.backgroundColor } : {}),
    ...(field.locale ? { locale: field.locale } : {}),
  }
}

export async function generateSignaturePdf(input: GenerateInput): Promise<Buffer> {
  const pdfBytes = await drive.use().getBytes(input.pdfKey)
  const basePdfBase64 = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`

  const template: Template = {
    basePdf: basePdfBase64,
    schemas: input.schemas.map((page) => page.map(fieldToPdfmeSchema)),
  }

  const inputs = buildInputsForFields(input.schemas, input.referenceDate ?? new Date())

  const generated = await generate({
    template,
    inputs,
    plugins: { signature, date },
  })

  return Buffer.from(generated)
}
