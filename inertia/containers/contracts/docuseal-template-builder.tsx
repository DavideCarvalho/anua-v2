import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'

import { useContractDocusealTemplateQueryOptions } from '../../hooks/queries/use-contract-docuseal-template'
import { useUploadContractDocusealTemplateMutation } from '../../hooks/mutations/use-upload-contract-docuseal-template'
import { useDeleteContractDocusealTemplateMutation } from '../../hooks/mutations/use-delete-contract-docuseal-template'
import { useQuery } from '@tanstack/react-query'

const schema = z.object({
  file: z
    .custom<File>((file) => file instanceof File, {
      message: 'Selecione um PDF',
    })
    .refine((file) => file?.type === 'application/pdf', {
      message: 'Apenas arquivos PDF são permitidos',
    })
    .refine((file) => (file ? file.size <= 10 * 1024 * 1024 : false), {
      message: 'Arquivo muito grande. Máximo: 10MB',
    }),
})

type FormValues = z.infer<typeof schema>

export function DocusealTemplateBuilder({ contractId }: { contractId: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: templateData, refetch } = useQuery(
    useContractDocusealTemplateQueryOptions(contractId)
  )

  const uploadTemplate = useUploadContractDocusealTemplateMutation()
  const deleteTemplate = useDeleteContractDocusealTemplateMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { file: undefined as any },
  })

  const handleUpload = async () => {
    const file = selectedFile
    if (!file) return

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1] || '')
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const promise = uploadTemplate
      .mutateAsync({
        contractId,
        body: {
          fileName: file.name,
          fileBase64: base64,
        },
      })
      .then(() => {
        toast.success('Template criado com sucesso!')
        setSelectedFile(null)
        form.reset()
        refetch()
      })

    toast.promise(promise, {
      loading: 'Fazendo upload do PDF...',
      error: 'Erro ao criar template',
    })
  }

  const handleDelete = async () => {
    const promise = deleteTemplate.mutateAsync({ contractId }).then(() => {
      toast.success('Template removido com sucesso')
      refetch()
    })

    toast.promise(promise, {
      loading: 'Removendo template...',
      error: 'Erro ao remover template',
    })
  }

  const openDocusealBuilder = () => {
    if (!templateData?.template?.id) return

    const docusealUrl = import.meta.env.VITE_DOCUSEAL_URL || 'https://docuseal.com'
    const builderUrl = `${docusealUrl}/templates/${templateData.template.id}/edit`

    window.open(builderUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      {templateData?.hasTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Template Configurado
              </span>
              <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Nome:</strong> {templateData.template?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>ID:</strong> {templateData.template?.id}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Criado em:</strong>{' '}
                {templateData.template?.createdAt
                  ? new Date(templateData.template?.createdAt).toLocaleDateString('pt-BR')
                  : '-'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={openDocusealBuilder} className="gap-2">
                <FileText className="h-4 w-4" />
                Editar Campos de Assinatura
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const url = `https://docuseal.com/templates/${templateData.template?.id}`
                  window.open(url, '_blank')
                }}
              >
                Ver no DocuSeal
              </Button>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>Dica:</strong> Clique em "Editar Campos de Assinatura" para configurar onde
                os alunos e responsáveis devem assinar.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Fazer Upload do Contrato (PDF)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (values) => {
                  setSelectedFile(values.file)
                  await handleUpload()
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecione o arquivo PDF do contrato</FormLabel>
                      <FormControl>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (!file) return
                            field.onChange(file)
                            setSelectedFile(file)
                          }}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedFile && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-900">Arquivo selecionado:</p>
                    <p className="text-sm text-green-700">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!selectedFile || uploadTemplate.isPending}
                  className="w-full gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploadTemplate.isPending ? 'Fazendo upload...' : 'Criar Template'}
                </Button>

                <div className="space-y-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="font-medium text-yellow-900">Como funciona:</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-yellow-800">
                    <li>Faça upload do PDF do contrato</li>
                    <li>Após o upload, configure os campos de assinatura</li>
                    <li>Adicione campos de assinatura, texto e data</li>
                    <li>Salve o template no DocuSeal</li>
                  </ol>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
