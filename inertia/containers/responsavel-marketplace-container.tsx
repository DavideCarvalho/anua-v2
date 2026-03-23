import { usePage } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { AlertCircle, ShoppingBag } from 'lucide-react'
import { useResponsavelStore } from '../stores/responsavel_store'
import type { SharedProps } from '../lib/types'

type MarketplaceStoresResponse = Awaited<Route.Response<'api.v1.marketplace.stores.index'>>
type MarketplaceStore = MarketplaceStoresResponse[number]

function parseAlunoFromPageUrl(pageUrl: string): string | undefined {
  try {
    const urlObj =
      typeof window !== 'undefined'
        ? new URL(pageUrl, window.location.origin)
        : new URL(`http://localhost${pageUrl}`)
    return urlObj.searchParams.get('aluno') ?? undefined
  } catch {
    const match = pageUrl.match(/[?&]aluno=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : undefined
  }
}

export function ResponsavelMarketplaceContainer() {
  const { url } = usePage<SharedProps>()
  const [alunoSlug] = useQueryState('aluno')
  const { students, isLoaded, selectedStudentId } = useResponsavelStore()

  const alunoFromUrl = parseAlunoFromPageUrl(url)
  const slugKey = alunoSlug ?? alunoFromUrl

  const matchedStudent =
    slugKey && students.length > 0 ? students.find((s) => s.slug === slugKey) : undefined

  const studentPk = slugKey ? matchedStudent?.id : (selectedStudentId ?? students[0]?.id)

  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.marketplace.stores.index.queryOptions(
      { query: { studentId: studentPk } },
      { enabled: isLoaded && !!studentPk }
    )
  )

  const stores: MarketplaceStore[] = Array.isArray(data) ? data : []

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">Nenhum aluno vinculado à sua conta</p>
      </div>
    )
  }

  if (slugKey && !matchedStudent) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não encontramos o aluno do parâmetro <span className="font-mono">aluno</span> na sua
          lista. Confira o link ou selecione o aluno no topo da página.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Carregando lojas...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar as lojas.
          {error instanceof Error ? ` ${error.message}` : ''}
        </AlertDescription>
      </Alert>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhuma loja disponível para este aluno
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => (
        <a key={store.id} href={'/responsavel/loja/' + store.id}>
          <Card className="transition-colors hover:border-primary/50 cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <Badge variant={store.type === 'INTERNAL' ? 'default' : 'secondary'}>
                  {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
                </Badge>
              </div>
              {store.description && <CardDescription>{store.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              {store.school?.name && (
                <p className="text-sm text-muted-foreground">{store.school.name}</p>
              )}
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}
