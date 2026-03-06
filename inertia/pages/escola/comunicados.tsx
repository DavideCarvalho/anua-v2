import { Head } from '@inertiajs/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Megaphone, Plus, Send } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'

import { EscolaLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

type Announcement = {
  id: string
  title: string
  body: string
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
  createdAt: string
  audiences?: Array<{
    scopeType: 'ACADEMIC_PERIOD' | 'COURSE' | 'LEVEL' | 'CLASS'
    scopeId: string
  }>
}

type AnnouncementsResponse = {
  data: Announcement[]
}

async function listAnnouncements(): Promise<AnnouncementsResponse> {
  const response = await fetch('/api/v1/school-announcements', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao carregar comunicados')
  }

  return response.json()
}

export default function EscolaComunicadosPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['school-announcements'],
    queryFn: listAnnouncements,
  })

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/school-announcements/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Falha ao publicar comunicado')
      }

      return response.json()
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['school-announcements'] })
    },
  })

  const announcements = data?.data ?? []

  return (
    <EscolaLayout>
      <Head title="Comunicados" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Megaphone className="h-6 w-6" />
            Comunicados
          </h1>
          <Link href="/escola/comunicados/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo comunicado
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Carregando comunicados...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              Nao foi possivel carregar os comunicados.
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && announcements.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhum comunicado criado ainda.</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{announcement.title}</CardTitle>
                    <CardDescription>
                      Criado em {new Date(announcement.createdAt).toLocaleString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Badge variant={announcement.status === 'PUBLISHED' ? 'default' : 'outline'}>
                    {announcement.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm text-muted-foreground">{announcement.body}</p>

                <div className="flex items-center gap-2">
                  {announcement.status === 'DRAFT' && (
                    <>
                      <Link href={`/escola/comunicados/${announcement.id}/editar`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => publishMutation.mutate(announcement.id)}
                        disabled={
                          publishMutation.isPending || (announcement.audiences ?? []).length === 0
                        }
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Publicar
                      </Button>
                      {(announcement.audiences ?? []).length === 0 && (
                        <p className="text-xs text-amber-600">
                          Defina o publico-alvo antes de publicar.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </EscolaLayout>
  )
}
