import { useState, useCallback } from 'react'
import type { Template } from '@pdfme/common'
import { FileText, Upload, ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { PdfTemplateDesigner } from '../../components/signature/pdf-template-designer'

interface SignatureTemplateBuilderProps {
  contractId: string
  existingTemplate?: Template | null
  onSave: (template: Template) => void
  isSaving?: boolean
}

export function SignatureTemplateBuilder({
  contractId,
  existingTemplate,
  onSave,
  isSaving,
}: SignatureTemplateBuilderProps) {
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [isDesignerOpen, setIsDesignerOpen] = useState(!!existingTemplate)

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPdfBase64(result)
      setPdfName(file.name)
      setIsDesignerOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = useCallback(
    (template: Template) => {
      onSave(template)
    },
    [onSave]
  )

  function handleBack() {
    setIsDesignerOpen(false)
    setPdfBase64(null)
    setPdfName(null)
  }

  if (isDesignerOpen && (pdfBase64 || existingTemplate)) {
    const template: Template = existingTemplate ?? {
      basePdf: pdfBase64!,
      schemas: [[]],
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Configurar campos de assinatura</h2>
            {pdfName && (
              <p className="text-sm text-muted-foreground">{pdfName}</p>
            )}
          </div>
        </div>

        <PdfTemplateDesigner
          basePdf={template.basePdf}
          initialTemplate={template}
          onSave={handleSave}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Contrato de Assinatura Digital
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Faça upload do PDF do contrato e posicione os campos de assinatura visualmente.
        </p>

        <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-foreground/20 bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground group-hover:text-primary" />
          <span className="text-sm font-medium">Clique para selecionar o PDF</span>
          <span className="mt-1 text-xs text-muted-foreground">PDF até 10MB</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium">Como funciona:</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Faça upload do PDF do contrato</li>
            <li>Arraste campos de assinatura, nome e data no documento</li>
            <li>Salve o template — as posições ficam vinculadas ao contrato</li>
            <li>Na matrícula, o responsável recebe o documento pra assinar</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
