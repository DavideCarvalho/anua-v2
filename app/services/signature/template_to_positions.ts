import type { SignatureTemplateSchemas, SignatureTemplateField } from '#models/contract'
import type { SignerFieldPosition } from './signature_provider.js'

interface PageSize {
  width: number
  height: number
}

const A4: PageSize = { width: 210, height: 297 }

function fieldToElement(field: SignatureTemplateField): SignerFieldPosition['element'] | null {
  if (field.type === 'signature') return 'SIGNATURE'
  if (field.type === 'date') return 'DATE'
  return null
}

/**
 * Converte schemas do pdfme (mm a partir do topo-esquerda) → posições do Autentique
 * (porcentagem do centro do campo).
 */
export function templateSchemasToPositions(
  schemas: SignatureTemplateSchemas,
  pageSize: PageSize = A4
): SignerFieldPosition[] {
  const positions: SignerFieldPosition[] = []

  for (let pageIndex = 0; pageIndex < schemas.length; pageIndex++) {
    const page = schemas[pageIndex]
    if (!Array.isArray(page)) continue

    for (const field of page) {
      const element = fieldToElement(field)
      if (!element) continue

      const centerX = field.position.x + field.width / 2
      const centerY = field.position.y + field.height / 2

      positions.push({
        x: ((centerX / pageSize.width) * 100).toFixed(1),
        y: ((centerY / pageSize.height) * 100).toFixed(1),
        z: pageIndex + 1,
        element,
      })
    }
  }

  return positions
}
