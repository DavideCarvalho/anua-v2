import { useRef, useEffect, useCallback } from 'react'
import type { Template } from '@pdfme/common'
import { Designer } from '@pdfme/ui'
import { text, image, signature, date } from '@pdfme/schemas'

const plugins = {
  Assinatura: signature,
  Nome: text,
  Data: date,
  Texto: text,
  Imagem: image,
}

const THEME = {
  token: {
    colorPrimary: '#7c3aed',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
}

const LABELS: Record<string, string> = {
  cancel: 'Cancelar',
  fieldName: 'Nome do campo',
  require: 'Obrigatório',
  uniq: 'Único',
  inputExample: 'Exemplo',
  edit: 'Editar',
  plsInputName: 'Nome do campo',
  fieldsList: 'Campos',
  addNewField: 'Adicionar campo',
  editField: 'Editar campo',
  type: 'Tipo',
  width: 'Largura',
  height: 'Altura',
  opacity: 'Opacidade',
  rotate: 'Rotação',
  alignment: 'Alinhamento',
  fontSize: 'Tamanho da fonte',
  color: 'Cor',
  'heading.borderWidth': 'Borda',
  'heading.borderColor': 'Cor da borda',
}

interface PdfTemplateDesignerProps {
  basePdf: string | ArrayBuffer
  initialTemplate?: Template
  onSave: (template: Template) => void
  className?: string
}

export function PdfTemplateDesigner({
  basePdf,
  initialTemplate,
  onSave,
  className,
}: PdfTemplateDesignerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const designerRef = useRef<Designer | null>(null)

  const template: Template = initialTemplate ?? {
    basePdf,
    schemas: [[]],
  }

  useEffect(() => {
    if (!containerRef.current) return

    const designer = new Designer({
      domContainer: containerRef.current,
      template,
      plugins,
      options: {
        theme: THEME,
        labels: LABELS,
      },
    })

    designer.onSaveTemplate((saved) => {
      onSave(saved)
    })

    designerRef.current = designer

    return () => {
      designer.destroy()
      designerRef.current = null
    }
  }, [])

  const handleSave = useCallback(() => {
    const current = designerRef.current?.getTemplate()
    if (current) onSave(current)
  }, [onSave])

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Arraste os campos da barra lateral para posicionar onde cada signatário deve assinar no documento.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Salvar template
        </button>
      </div>
      <div
        ref={containerRef}
        className="rounded-lg ring-1 ring-foreground/10 overflow-hidden"
        style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
      />
    </div>
  )
}
