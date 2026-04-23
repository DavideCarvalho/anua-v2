import { Head } from '@inertiajs/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Bell, Megaphone, Plus, Send, Trash2 } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { toast } from 'sonner'

import { SimplifiedBasicList } from '../../components/escola/simplified-basic-list'
import { SimplifiedPageShell } from '../../components/escola/simplified-page-shell'
import { EscolaLayout } from '../../components/layouts'
import { EscolaLayoutSimplificado } from '../../components/layouts/escola-layout-simplificado'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../stores/auth_store'

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
  const user = useAuthUser()
  const [viewMode, setViewMode] = useState<EscolaDashboardViewMode>('full')
  const [draftToDelete, setDraftToDelete] = useState<Announcement | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    setViewMode(readEscolaDashboardViewMode(user?.id))
  }, [user?.id])

  const onViewModeChange = (mode: EscolaDashboardViewMode) => {
    setViewMode(mode)
    writeEscolaDashboardViewMode(user?.id, mode)
  }

  const viewModeToggle = (
    <>
      <Button
        type="button"
        size="sm"
        variant={viewMode === 'full' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('full')}
      >
        Visão completa
      </Button>
      <Button
        type="button"
        size="sm"
        variant={viewMode === 'simple' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('simple')}
      >
        Visão simplificada
      </Button>
    </>
  )

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

  const deleteDraftMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/school-announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir comunicado')
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['school-announcements'] })
    },
  })

  const handleDeleteDraft = async (announcementId: string) => {
    try {
      await deleteDraftMutation.mutateAsync(announcementId)
      setDraftToDelete(null)
      toast.success('Rascunho excluído com sucesso')
    } catch {
      toast.error('Não foi possível excluir o rascunho')
    }
  }

  const handlePublishDraft = async (announcementId: string) => {
    try {
      await publishMutation.mutateAsync(announcementId)
      toast.success('Comunicado publicado com sucesso')
    } catch {
      toast.error('Não foi possível publicar o comunicado')
    }
  }

  const announcements = data?.data ?? []

  if (viewMode === 'simple') {
    return (
      <EscolaLayoutSimplificado
        title="Comunicados"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      >
        <Head title="Comunicados" />

        <SimplifiedPageShell
          title="Comunicados"
          description="Gerencie os comunicados e publique mensagens importantes rapidamente."
          actions={
            <>
              <Link href="/escola/comunicados/novo">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo comunicado
                </Button>
              </Link>
              <Link href="/escola/comunicados">
                <Button size="sm" variant="outline">
                  Atualizar lista
                </Button>
              </Link>
            </>
          }
        >
          <SimplifiedBasicList>
            <div className="space-y-3">
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
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nenhum comunicado criado ainda.
                    </p>
                  </CardContent>
                </Card>
              )}

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
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {announcement.body}
                    </p>

                    {announcement.status === 'DRAFT' && (
                      <div className="flex items-center gap-2">
                        <Link href={`/escola/comunicados/${announcement.id}/editar`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDraftToDelete(announcement)}
                          disabled={deleteDraftMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => void handlePublishDraft(announcement.id)}
                          disabled={
                            publishMutation.isPending ||
                            deleteDraftMutation.isPending ||
                            (announcement.audiences ?? []).length === 0
                          }
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Publicar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </SimplifiedBasicList>
        </SimplifiedPageShell>
      </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
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
                        variant="outline"
                        size="sm"
                        onClick={() => setDraftToDelete(announcement)}
                        disabled={deleteDraftMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => void handlePublishDraft(announcement.id)}
                        disabled={
                          publishMutation.isPending ||
                          deleteDraftMutation.isPending ||
                          (announcement.audiences ?? []).length === 0
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

      <AlertDialog
        open={Boolean(draftToDelete)}
        onOpenChange={(open) => !open && setDraftToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir rascunho?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o comunicado "{draftToDelete?.title}" permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDraftMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteDraftMutation.isPending || !draftToDelete}
              onClick={() => draftToDelete && void handleDeleteDraft(draftToDelete.id)}
            >
              {deleteDraftMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EscolaLayout>
  )
}
