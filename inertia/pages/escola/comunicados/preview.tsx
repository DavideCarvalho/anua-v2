import { useEffect, useState } from 'react'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Bell, Calendar, MessageSquare, Paperclip } from 'lucide-react'

import { ResponsavelLayout } from '../../../components/layouts'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'

interface PreviewData {
  title: string
  body: string
  attachments: string[]
  requiresAcknowledgement: boolean
}

function PreviewContent({ data }: { data: PreviewData }) {
  const now = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="max-w-3xl space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{data.title}</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              Comunicado
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {now}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {data.body}
          </p>

          {data.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Anexos</p>
              <div className="space-y-1.5">
                {data.attachments.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.requiresAcknowledgement && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-xs">
                Aguardando ciência
              </Badge>
              <span className="rounded-md border px-3 py-1 text-xs font-medium text-muted-foreground">
                Li e estou ciente
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ComunicadoPreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('anua:comunicado-preview')
      if (raw) {
        setData(JSON.parse(raw))
        sessionStorage.removeItem('anua:comunicado-preview')
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <ResponsavelLayout>
      <Head title="Pré-visualização" />

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 dark:bg-amber-950">
          <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
            Pré-visualização: é assim que o responsável vai ver este comunicado
          </span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => {
              if (window.opener) {
                window.close()
              } else {
                window.history.back()
              }
            }}
          >
            <ArrowLeft className="mr-1.5 h-3 w-3" />
            Voltar pro editor
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Comunicados
          </h1>
          <p className="text-muted-foreground">Comunicados e notificações da escola</p>
        </div>

        {data ? (
          <PreviewContent data={data} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum comunicado pra pré-visualizar. Volte pra página de criação.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsavelLayout>
  )
}
