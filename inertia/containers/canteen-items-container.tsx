import { useMemo, useState } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import {
  MoreHorizontal,
  Plus,
  Search,
  UtensilsCrossed,
  Pencil,
  Trash2,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import type { Route } from '@tuyau/core/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, tuyau } from '~/lib/api'

type CanteenItemsResponse = Route.Response<'api.v1.canteenItems.index'>

function buildCreateFormData(data: {
  canteenId: string
  name: string
  description?: string
  price: number
  category?: string
  isActive?: boolean
  image?: File | null
}): FormData {
  const formData = new FormData()
  formData.append('canteenId', data.canteenId)
  formData.append('name', data.name)
  if (data.description) formData.append('description', data.description)
  formData.append('price', String(data.price))
  if (data.category) formData.append('category', data.category)
  formData.append('isActive', String(data.isActive))
  if (data.image) formData.append('image', data.image)
  return formData
}

function buildUpdateFormData(data: {
  name?: string
  description?: string
  price?: number
  category?: string
  isActive?: boolean
  removeImage?: boolean
  image?: File | null
}): FormData {
  const formData = new FormData()
  if (data.name !== undefined) formData.append('name', data.name)
  if (data.description !== undefined) formData.append('description', data.description)
  if (data.price !== undefined) formData.append('price', String(data.price))
  if (data.category !== undefined) formData.append('category', data.category)
  if (data.isActive !== undefined) formData.append('isActive', String(data.isActive))
  if (data.removeImage !== undefined) formData.append('removeImage', String(data.removeImage))
  if (data.image) formData.append('image', data.image)
  return formData
}
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Switch } from '../components/ui/switch'
import { formatCurrency } from '../lib/utils'

type CanteenItem = CanteenItemsResponse['data'][number]

interface CanteenItemsContainerProps {
  canteenId?: string
}

interface ItemFormValues {
  name: string
  description: string
  category: string
  priceReais: string
  isActive: boolean
  imageFile: File | null
  imagePreviewUrl: string | null
  removeImage: boolean
}

const defaultItemForm: ItemFormValues = {
  name: '',
  description: '',
  category: '',
  priceReais: '',
  isActive: true,
  imageFile: null,
  imagePreviewUrl: null,
  removeImage: false,
}

function parsePriceToCents(priceReais: string) {
  const normalized = Number(priceReais.replace(',', '.'))
  if (!Number.isFinite(normalized) || normalized < 0) {
    return null
  }
  return Math.round(normalized * 100)
}

function CanteenItemsErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <UtensilsCrossed className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar itens</h3>
          <p className="text-sm text-muted-foreground">{error.message || 'Erro inesperado'}</p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

export function CanteenItemsContainer({ canteenId }: CanteenItemsContainerProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <CanteenItemsErrorFallback
              error={error as Error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <CanteenItemsContent canteenId={canteenId} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function CanteenItemsContent({ canteenId }: CanteenItemsContainerProps) {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CanteenItem | null>(null)
  const [createForm, setCreateForm] = useState<ItemFormValues>(defaultItemForm)
  const [editForm, setEditForm] = useState<ItemFormValues>(defaultItemForm)

  const queryClient = useQueryClient()
  const createItem = useMutation({
    ...api.api.v1.canteenItems.store.mutationOptions(),
    mutationFn: async (data: Parameters<typeof buildCreateFormData>[0]) => {
      const formData = buildCreateFormData(data)
      return tuyau.api.api.v1.canteenItems.store({ body: formData as any })
    },
  })
  const updateItem = useMutation({
    ...api.api.v1.canteenItems.update.mutationOptions(),
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      name?: string
      description?: string
      price?: number
      category?: string
      isActive?: boolean
      removeImage?: boolean
      image?: File | null
    }) => {
      const formData = buildUpdateFormData(data)
      return tuyau.api.api.v1.canteenItems.update({ params: { id }, body: formData as any })
    },
  })
  const deleteItem = useMutation(api.api.v1.canteenItems.destroy.mutationOptions())
  const toggleItem = useMutation(api.api.v1.canteenItems.toggleActive.mutationOptions())

  const { search, page, limit } = filters

  const { data, isLoading, error, refetch } = useQuery({
    ...api.api.v1.canteenItems.index.queryOptions({
      query: {
        canteenId: canteenId!,
        search: search || undefined,
        page,
        limit,
      },
    }),
    enabled: !!canteenId,
  })

  const items = data?.data ?? []
  const meta = data?.metadata ?? null

  const openEditDialog = (item: CanteenItem) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      description: item.description ?? '',
      category: item.category ?? '',
      priceReais: (item.price / 100).toFixed(2),
      isActive: item.isActive,
      imageFile: null,
      imagePreviewUrl: item.imageUrl ?? null,
      removeImage: false,
    })
  }

  const canSaveCreate = useMemo(() => {
    return (
      !!createForm.name.trim() && parsePriceToCents(createForm.priceReais) !== null && !!canteenId
    )
  }, [createForm.name, createForm.priceReais, canteenId])

  const canSaveEdit = useMemo(() => {
    return (
      !!editForm.name.trim() && parsePriceToCents(editForm.priceReais) !== null && !!editingItem
    )
  }, [editForm.name, editForm.priceReais, editingItem])

  const handleCreate = async () => {
    if (!canteenId) {
      toast.error('Cantina não encontrada no contexto atual')
      return
    }

    const price = parsePriceToCents(createForm.priceReais)
    if (price === null) {
      toast.error('Preço inválido')
      return
    }

    await toast.promise(
      createItem.mutateAsync({
        canteenId,
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        category: createForm.category.trim() || undefined,
        price,
        isActive: createForm.isActive,
        image: createForm.imageFile,
      }),
      {
        loading: 'Criando item...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
          setCreateOpen(false)
          setCreateForm(defaultItemForm)
          return 'Item criado com sucesso'
        },
        error: (err) => (err instanceof Error ? err.message : 'Erro ao criar item'),
      }
    )
  }

  async function handleEdit() {
    if (!editingItem) {
      return
    }

    const price = parsePriceToCents(editForm.priceReais)
    if (price === null) {
      toast.error('Preço inválido')
      return
    }

    toast.promise(
      updateItem.mutateAsync({
        id: editingItem.id,
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        category: editForm.category.trim() || undefined,
        price,
        isActive: editForm.isActive,
        image: editForm.imageFile,
        removeImage: editForm.removeImage,
      }),
      {
        loading: 'Salvando item...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
          setEditingItem(null)
          return 'Item atualizado com sucesso'
        },
        error: (err) => (err instanceof Error ? err.message : 'Erro ao salvar item'),
      }
    )
  }

  const handleDelete = async (item: CanteenItem) => {
    if (!confirm(`Excluir o item "${item.name}"?`)) {
      return
    }

    await toast.promise(deleteItem.mutateAsync({ params: { id: item.id } }), {
      loading: 'Excluindo item...',
      success: () => {
        queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
        return 'Item excluído com sucesso'
      },
      error: (err) => (err instanceof Error ? err.message : 'Erro ao excluir item'),
    })
  }

  const handleToggle = async (item: CanteenItem) => {
    await toast.promise(toggleItem.mutateAsync({ params: { id: item.id } }), {
      loading: item.isActive ? 'Desativando item...' : 'Ativando item...',
      success: () => {
        queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
        return 'Status atualizado'
      },
      error: (err) => (err instanceof Error ? err.message : 'Erro ao atualizar status'),
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar itens..."
              className="pl-9"
              value={search || ''}
              onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
            />
          </div>
          <Button className="ml-auto" onClick={() => setCreateOpen(true)} disabled={!canteenId}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Carregando itens...
            </CardContent>
          </Card>
        )}

        {error && <CanteenItemsErrorFallback error={error} resetErrorBoundary={() => refetch()} />}

        {!isLoading && !error && items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Nenhum item cadastrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cadastre o primeiro item da cantina
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-2">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-24 w-full rounded-md object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-24 w-full items-center justify-center rounded-md bg-muted">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(item.price)}
                        </p>
                        {item.category && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Categoria: {item.category}
                          </p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.isActive ? 'Disponível' : 'Indisponível'}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Ativo</span>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleToggle(item)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {items.length} de {meta.total} itens
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setFilters({ page: page - 1 })}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {page} de {meta.lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.lastPage}
                    onClick={() => setFilters({ page: page + 1 })}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Item da Cantina</DialogTitle>
            <DialogDescription>Cadastre um item para venda no PDV.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="create-item-name">Nome</Label>
              <Input
                id="create-item-name"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="create-item-description">Descrição</Label>
              <Textarea
                id="create-item-description"
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="create-item-category">Categoria</Label>
                <Input
                  id="create-item-category"
                  value={createForm.category}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-item-price">Preço (R$)</Label>
                <Input
                  id="create-item-price"
                  placeholder="0,00"
                  value={createForm.priceReais}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, priceReais: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="create-item-image">Imagem (opcional)</Label>
              <Input
                id="create-item-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setCreateForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imagePreviewUrl: file ? URL.createObjectURL(file) : null,
                  }))
                }}
              />
              {createForm.imagePreviewUrl ? (
                <img
                  src={createForm.imagePreviewUrl}
                  alt="Pré-visualização da imagem"
                  className="h-28 w-full rounded-md object-cover"
                />
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!canSaveCreate || createItem.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>Ajuste os dados do item da cantina.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="edit-item-name">Nome</Label>
              <Input
                id="edit-item-name"
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-item-description">Descrição</Label>
              <Textarea
                id="edit-item-description"
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-item-category">Categoria</Label>
                <Input
                  id="edit-item-category"
                  value={editForm.category}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-item-price">Preço (R$)</Label>
                <Input
                  id="edit-item-price"
                  value={editForm.priceReais}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, priceReais: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-item-image">Imagem</Label>
              <Input
                id="edit-item-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setEditForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imagePreviewUrl: file ? URL.createObjectURL(file) : prev.imagePreviewUrl,
                    removeImage: false,
                  }))
                }}
              />
              {editForm.imagePreviewUrl ? (
                <img
                  src={editForm.imagePreviewUrl}
                  alt="Imagem do item"
                  className="h-28 w-full rounded-md object-cover"
                />
              ) : null}
              {editingItem?.imageUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditForm((prev) => ({
                      ...prev,
                      imageFile: null,
                      imagePreviewUrl: null,
                      removeImage: true,
                    }))
                  }
                >
                  Remover imagem atual
                </Button>
              ) : null}
            </div>

            <div className="flex items-center justify-between border rounded-md px-3 py-2">
              <span className="text-sm">Disponível para venda</span>
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={!canSaveEdit || updateItem.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
