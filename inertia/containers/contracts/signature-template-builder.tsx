import { useEffect, useState, useCallback } from 'react'
import type { Template } from '@pdfme/common'
import { FileText, Upload, ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { PdfTemplateDesigner } from '../../components/signature/pdf-template-designer'
import { api } from '~/lib/api'

interface SignatureTemplateBuilderProps {
  contractId: string
}

type SignatureFieldType = 'signature' | 'date'

interface SerializedField {
  name: string
  type: SignatureFieldType
  position: { x: number; y: number }
  width: number
  height: number
  rotate?: number
  format?: string
  fontSize?: number
  alignment?: string
  fontColor?: string
  backgroundColor?: string
  locale?: string
  opacity?: number
  required?: boolean
  readOnly?: boolean
  content?: string
}

function isSignatureFieldType(value: string): value is SignatureFieldType {
  return value === 'signature' || value === 'date'
}

function narrowSchemas(schemas: Template['schemas']): SerializedField[][] {
  return schemas.map((page) =>
    page.flatMap((field) => {
      if (!isSignatureFieldType(field.type)) return []
      const narrowed: SerializedField = {
        name: field.name,
        type: field.type,
        position: field.position,
        width: field.width,
        height: field.height,
      }
      if ('rotate' in field && typeof field.rotate === 'number') narrowed.rotate = field.rotate
      if ('format' in field && typeof field.format === 'string') narrowed.format = field.format
      if ('fontSize' in field && typeof field.fontSize === 'number')
        narrowed.fontSize = field.fontSize
      if ('alignment' in field && typeof field.alignment === 'string')
        narrowed.alignment = field.alignment
      if ('fontColor' in field && typeof field.fontColor === 'string')
        narrowed.fontColor = field.fontColor
      if ('backgroundColor' in field && typeof field.backgroundColor === 'string')
        narrowed.backgroundColor = field.backgroundColor
      if ('locale' in field && typeof field.locale === 'string') narrowed.locale = field.locale
      if ('opacity' in field && typeof field.opacity === 'number') narrowed.opacity = field.opacity
      if (typeof field.required === 'boolean') narrowed.required = field.required
      if (typeof field.readOnly === 'boolean') narrowed.readOnly = field.readOnly
      if (typeof field.content === 'string') narrowed.content = field.content
      return [narrowed]
    })
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Falha ao ler o arquivo'))
        return
      }
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Falha ao ler PDF'))
        return
      }
      resolve(result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler PDF'))
    reader.readAsDataURL(blob)
  })
}

export function SignatureTemplateBuilder({ contractId }: SignatureTemplateBuilderProps) {
  const queryClient = useQueryClient()
  const isNewContract = contractId === 'new'

  const { data: templateData, isLoading } = useQuery({
    ...api.api.v1.contracts.getSignatureTemplate.queryOptions({
      params: { contractId },
    }),
    enabled: !isNewContract,
  })

  const uploadTemplate = useMutation(
    api.api.v1.contracts.uploadSignatureTemplate.mutationOptions()
  )
  const deleteTemplate = useMutation(
    api.api.v1.contracts.deleteSignatureTemplate.mutationOptions()
  )

  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [initialTemplate, setInitialTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const existing = templateData?.template
    if (!existing) return
    let cancelled = false
    ;(async () => {
      try {
        const dataUrl = await urlToBase64(existing.pdfUrl)
        if (cancelled) return
        setPdfBase64(dataUrl)
        setInitialTemplate({ basePdf: dataUrl, schemas: existing.schemas })
      } catch {
        toast.error('Falha ao carregar template existente')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [templateData?.template])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const result = reader.result
      if (typeof result !== 'string') return
      setPdfBase64(result)
      setPdfName(file.name)
      setInitialTemplate(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = useCallback(
    async (template: Template) => {
      if (isNewContract) {
        toast.error('Salve o contrato primeiro antes de configurar o template de assinatura')
        return
      }

      try {
        const needsPdfUpload = !templateData?.template
        let fileBase64: string | undefined
        let fileName: string | undefined

        if (needsPdfUpload) {
          const inputEl = document.querySelector<HTMLInputElement>('#signature-pdf-input')
          const file = inputEl?.files?.[0]
          if (!file && !pdfBase64) {
            toast.error('Selecione o PDF do contrato primeiro')
            return
          }
          if (file) {
            fileBase64 = await fileToBase64(file)
            fileName = file.name
          }
        }

        const promise = uploadTemplate.mutateAsync({
          params: { contractId },
          body: {
            schemas: narrowSchemas(template.schemas),
            ...(fileBase64 ? { fileBase64, fileName } : {}),
          },
        })

        await toast.promise(promise, {
          loading: 'Salvando template...',
          success: 'Template de assinatura salvo',
          error: 'Erro ao salvar template',
        }).unwrap()

        queryClient.invalidateQueries({
          queryKey: api.api.v1.contracts.getSignatureTemplate.queryOptions({
            params: { contractId },
          }).queryKey,
        })
      } catch {
        // toast já mostra erro
      }
    },
    [contractId, isNewContract, pdfBase64, queryClient, templateData?.template, uploadTemplate]
  )

  const handleDelete = async () => {
    if (!templateData?.template) return
    try {
      const promise = deleteTemplate.mutateAsync({ params: { contractId } })
      await toast.promise(promise, {
        loading: 'Removendo template...',
        success: 'Template removido',
        error: 'Erro ao remover template',
      }).unwrap()

      setPdfBase64(null)
      setPdfName(null)
      setInitialTemplate(null)
      queryClient.invalidateQueries({
        queryKey: api.api.v1.contracts.getSignatureTemplate.queryOptions({
          params: { contractId },
        }).queryKey,
      })
    } catch {
      // toast já mostra erro
    }
  }

  const handleBack = () => {
    setPdfBase64(null)
    setPdfName(null)
    setInitialTemplate(null)
  }

  if (isNewContract) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Salve as informações básicas do contrato primeiro pra liberar o template de assinatura.
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const hasPdf = !!pdfBase64 || !!initialTemplate

  if (hasPdf) {
    const template: Template = initialTemplate ?? {
      basePdf: pdfBase64 ?? '',
      schemas: [[]],
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {!templateData?.template && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Configurar campos de assinatura</h2>
            {pdfName && <p className="text-sm text-muted-foreground">{pdfName}</p>}
            {templateData?.template && !pdfName && (
              <p className="text-sm text-muted-foreground">Template salvo</p>
            )}
          </div>
          {templateData?.template && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteTemplate.isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Remover
            </Button>
          )}
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
            id="signature-pdf-input"
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
            <li>Arraste campos de assinatura e data no documento</li>
            <li>Salve — as posições ficam vinculadas ao contrato</li>
            <li>Na matrícula, o responsável recebe o documento pra assinar</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
