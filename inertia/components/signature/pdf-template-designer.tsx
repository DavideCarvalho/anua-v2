import { useRef, useEffect, useCallback } from 'react'
import type { Template } from '@pdfme/common'
import { Designer } from '@pdfme/ui'
import { signature, date } from '@pdfme/schemas'
import { format as formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DATE_FORMAT_OPTIONS = [
  { label: 'Data completa (28/05/2026)', value: 'dd/MM/yyyy' },
  { label: 'Dia/Mês (28/05)', value: 'dd/MM' },
  { label: 'Dia (28)', value: 'dd' },
  { label: 'Mês por extenso (maio)', value: 'MMMM' },
  { label: 'Ano (2026)', value: 'yyyy' },
] as const

function previewForFormat(fmt: string): string {
  try {
    return formatDate(new Date(), fmt, { locale: ptBR })
  } catch {
    return 'Data'
  }
}

const signaturePlaceholder = {
  ...signature,
  ui: async (arg: Parameters<typeof signature.ui>[0]) => {
    const { schema, rootElement, mode } = arg
    if (mode === 'designer') {
      const placeholder = document.createElement('div')
      placeholder.style.width = '100%'
      placeholder.style.height = '100%'
      placeholder.style.display = 'flex'
      placeholder.style.flexDirection = 'column'
      placeholder.style.alignItems = 'center'
      placeholder.style.justifyContent = 'center'
      placeholder.style.gap = '4px'
      placeholder.style.background = 'rgba(124, 58, 237, 0.06)'
      placeholder.style.border = '1px dashed rgba(124, 58, 237, 0.5)'
      placeholder.style.borderRadius = '4px'
      placeholder.style.color = 'rgba(124, 58, 237, 0.9)'
      placeholder.style.fontFamily = 'Inter, system-ui, sans-serif'
      placeholder.style.fontSize = '11px'
      placeholder.style.fontWeight = '500'
      placeholder.style.pointerEvents = 'none'
      placeholder.style.userSelect = 'none'
      placeholder.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 19.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-.5"/><path d="M3 17h18"/><path d="M9 13c1.5-1 3.5-3 5-5"/><path d="m14 8 2-2"/></svg>
        <span>${schema.name || 'Assinatura'}</span>
      `
      rootElement.appendChild(placeholder)
      return
    }
    return signature.ui(arg)
  },
}

const datePlaceholder = {
  ...date,
  ui: async (arg: Parameters<typeof date.ui>[0]) => {
    const { schema, rootElement, mode } = arg
    if (mode === 'designer') {
      const fmt = (schema as { format?: string }).format || 'dd/MM/yyyy'
      const preview = previewForFormat(fmt)
      const placeholder = document.createElement('div')
      placeholder.style.width = '100%'
      placeholder.style.height = '100%'
      placeholder.style.display = 'flex'
      placeholder.style.alignItems = 'center'
      placeholder.style.justifyContent = 'center'
      placeholder.style.background = 'rgba(14, 165, 233, 0.06)'
      placeholder.style.border = '1px dashed rgba(14, 165, 233, 0.5)'
      placeholder.style.borderRadius = '4px'
      placeholder.style.color = 'rgba(14, 165, 233, 0.95)'
      placeholder.style.fontFamily = 'Inter, system-ui, sans-serif'
      placeholder.style.fontSize = '12px'
      placeholder.style.fontWeight = '600'
      placeholder.style.pointerEvents = 'none'
      placeholder.style.userSelect = 'none'
      placeholder.textContent = preview
      rootElement.appendChild(placeholder)
      return
    }
    return date.ui(arg)
  },
  propPanel: {
    ...date.propPanel,
    schema: {
      format: {
        title: 'Formato da data',
        type: 'string',
        widget: 'select',
        props: { options: [...DATE_FORMAT_OPTIONS] },
        default: 'dd/MM/yyyy',
        span: 24,
      },
    },
    defaultSchema: {
      ...date.propPanel.defaultSchema,
      format: 'dd/MM/yyyy',
      width: 40,
      height: 8,
      locale: 'pt-Br',
    },
  },
}

const plugins = {
  Assinatura: signaturePlaceholder,
  Data: datePlaceholder,
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
  field: 'Campo',
  fieldName: 'Nome',
  require: 'Obrigatório',
  uniq: 'Único',
  inputExample: 'Exemplo',
  edit: 'Editar',
  plsInputName: 'Informe o nome',
  fieldMustUniq: 'O nome do campo deve ser único',
  notUniq: '(não é único)',
  noKeyName: '(sem nome)',
  fieldsList: 'Campos',
  addNewField: 'Adicionar campo',
  editField: 'Editar campo',
  type: 'Tipo',
  errorOccurred: 'Ocorreu um erro',
  errorBulkUpdateFieldName: 'Não foi possível atualizar os nomes dos campos',
  commitBulkUpdateFieldName: 'Confirmar alterações',
  bulkUpdateFieldName: 'Editar nomes dos campos',
  addPageAfter: 'Adicionar página depois',
  removePage: 'Remover página',
  removePageConfirm: 'Tem certeza que deseja remover esta página?',
  removeField: 'Remover campo',
  duplicateField: 'Duplicar campo',
  bringForward: 'Trazer para frente',
  sendBackward: 'Enviar para trás',
  width: 'Largura',
  height: 'Altura',
  opacity: 'Opacidade',
  rotate: 'Rotação',
  alignment: 'Alinhamento',
  fontName: 'Fonte',
  fontSize: 'Tamanho',
  characterSpacing: 'Espaçamento',
  lineHeight: 'Altura da linha',
  textColor: 'Cor do texto',
  bgColor: 'Cor de fundo',
  borderColor: 'Cor da borda',
  borderWidth: 'Borda',
  color: 'Cor',
  backgroundColor: 'Cor de fundo',
  selectField: 'Selecione um campo',
  zoomIn: 'Ampliar',
  zoomOut: 'Reduzir',
  page: 'Página',
  format: 'Formato',
  placeholder: 'Exemplo',
  'date.format': 'Formato da data',
  'schemas.date.format': 'Formato da data',
}

const DESIGNER_CSS = `
.pdfme-designer-clean .ant-tabs-nav { display: none !important; }
`

function autoNameFields(template: Template): Template {
  const counters: Record<string, number> = {}
  const schemas = template.schemas.map((page) =>
    page.map((field) => {
      const typeLabel = field.type === 'signature' ? 'Assinatura' : field.type === 'date' ? 'Data' : field.type
      counters[typeLabel] = (counters[typeLabel] ?? 0) + 1
      return { ...field, name: `${typeLabel} ${counters[typeLabel]}` }
    })
  )
  return { ...template, schemas }
}

interface PdfTemplateDesignerProps {
  basePdf: Template['basePdf']
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

    designer.onChangeTemplate(() => {
      // intentionally empty — auto-naming happens on save
    })

    designer.onSaveTemplate((saved) => {
      onSave(autoNameFields(saved))
    })

    designerRef.current = designer

    return () => {
      designer.destroy()
      designerRef.current = null
    }
  }, [])

  const handleSave = useCallback(() => {
    const current = designerRef.current?.getTemplate()
    if (current) onSave(autoNameFields(current))
  }, [onSave])

  return (
    <div className={className}>
      <style>{DESIGNER_CSS}</style>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Arraste <span className="font-medium text-foreground">Assinatura</span> ou <span className="font-medium text-foreground">Data</span> da barra lateral pra cima do documento. Selecione uma data pra escolher o formato no painel direito.
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
        className="pdfme-designer-clean rounded-lg ring-1 ring-foreground/10 overflow-hidden"
        style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
      />
    </div>
  )
}
