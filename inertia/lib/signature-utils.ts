import type { Template } from '@pdfme/common'
import type { SignerFieldPosition } from '../../app/services/signature/signature_provider'

interface PageSize {
  width: number
  height: number
}

const A4: PageSize = { width: 210, height: 297 }

const ELEMENT_MAP: Record<string, SignerFieldPosition['element']> = {
  signature: 'SIGNATURE',
  Assinatura: 'SIGNATURE',
  Nome: 'NAME',
  name: 'NAME',
  Data: 'DATE',
  date: 'DATE',
  cpf: 'CPF',
  initials: 'INITIALS',
}

export function templateToAutentiquePositions(
  template: Template,
  pageSize: PageSize = A4
): SignerFieldPosition[] {
  const positions: SignerFieldPosition[] = []

  for (let pageIndex = 0; pageIndex < template.schemas.length; pageIndex++) {
    const page = template.schemas[pageIndex]
    if (!Array.isArray(page)) continue

    for (const field of page) {
      const element = ELEMENT_MAP[field.type] ?? ELEMENT_MAP[field.name]
      if (!element) continue

      const centerX = Number(field.position.x) + Number(field.width) / 2
      const centerY = Number(field.position.y) + Number(field.height) / 2

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
