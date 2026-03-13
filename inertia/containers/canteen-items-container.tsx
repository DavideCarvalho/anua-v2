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
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

import type { Route } from '@tuyau/core/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

type CanteenItemsResponseData = Route.Response<'api.v1.canteen_items.index'>['data']
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
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '../components/ui/command'
import { cn, formatCurrency } from '../lib/utils'
import { CurrencyInput } from '../components/ui/currency-input'

type CanteenItem = CanteenItemsResponseData[number]

interface CanteenItemsContainerProps {
  canteenId?: string
}

interface ItemFormValues {
  name: string
  description: string
  category: string
  price: number
  isActive: boolean
  imagePreviewUrl: string | null
  removeImage: boolean
}

const defaultItemForm: ItemFormValues = {
  name: '',
  description: '',
  category: '',
  price: 0,
  isActive: true,
  imagePreviewUrl: null,
  removeImage: false,
}

function getItemImageUrl(image: CanteenItem['image']): string | null {
  if (!image) return null

  if (typeof image === 'object' && image !== null && 'url' in image) {
    const url = image.url
    if (typeof url === 'string' && url.length > 0) {
      return url
    }
  }

  if (typeof image.getUrl === 'function') {
    const url = image.getUrl()
    if (typeof url === 'string' && url.length > 0) {
      return url
    }
  }

  return null
}

interface CategoryComboboxProps {
  value: string
  onChange: (value: string) => void
  categories: string[]
}

function CategoryCombobox({ value, onChange, categories }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  // Keep inputValue in sync when value prop changes externally
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setInputValue(value)
    setOpen(nextOpen)
  }

  const filtered = categories.filter((c) => c.toLowerCase().includes(inputValue.toLowerCase()))

  const showCreate =
    inputValue.trim().length > 0 &&
    !categories.some((c) => c.toLowerCase() === inputValue.trim().toLowerCase())

  const handleSelect = (selected: string) => {
    onChange(selected)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || 'Selecionar categoria'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar ou criar..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
            {filtered.map((cat) => (
              <CommandItem key={cat} value={cat} onSelect={() => handleSelect(cat)}>
                <Check
                  className={cn('mr-2 h-4 w-4', value === cat ? 'opacity-100' : 'opacity-0')}
                />
                {cat}
              </CommandItem>
            ))}
            {showCreate && (
              <CommandItem
                value={`__create__${inputValue.trim()}`}
                onSelect={() => handleSelect(inputValue.trim())}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar &ldquo;{inputValue.trim()}&rdquo;
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
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
              error={error instanceof Error ? error : new Error('Erro inesperado')}
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
  const createItem = useMutation(api.api.v1.canteenItems.store.mutationOptions())
  const updateItem = useMutation(api.api.v1.canteenItems.update.mutationOptions())
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

  const { data: categoriesData } = useQuery({
    ...api.api.v1.canteenItems.categories.queryOptions({
      query: { canteenId: canteenId ?? undefined },
    }),
    enabled: !!canteenId,
  })
  const existingCategories = categoriesData?.data ?? []

  const items = data?.data ?? []
  const meta = data?.metadata ?? null

  const openEditDialog = (item: CanteenItem) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      description: item.description ?? '',
      category: item.category ?? '',
      price: item.price,
      isActive: item.isActive,
      imagePreviewUrl: getItemImageUrl(item.image),
      removeImage: false,
    })
  }

  const canSaveCreate = useMemo(() => {
    return !!createForm.name.trim() && createForm.price > 0 && !!canteenId
  }, [createForm.name, createForm.price, canteenId])

  const canSaveEdit = useMemo(() => {
    return !!editForm.name.trim() && editForm.price > 0 && !!editingItem
  }, [editForm.name, editForm.price, editingItem])

  async function handleCreate() {
    if (!canteenId) {
      toast.error('Cantina não encontrada no contexto atual')
      return
    }

    await toast.promise(
      createItem.mutateAsync({
        body: {
          canteenId,
          name: createForm.name.trim(),
          description: createForm.description.trim() || undefined,
          category: createForm.category.trim() || undefined,
          price: createForm.price,
          isActive: createForm.isActive,
        },
      }),
      {
        loading: 'Criando item...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: api.api.v1.canteenItems.index.pathKey() })
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

    toast.promise(
      updateItem.mutateAsync({
        params: { id: editingItem.id },
        body: {
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          category: editForm.category.trim() || undefined,
          price: editForm.price,
          isActive: editForm.isActive,
          removeImage: editForm.removeImage,
        },
      }),
      {
        loading: 'Salvando item...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: api.api.v1.canteenItems.index.pathKey() })
          setEditingItem(null)
          return 'Item atualizado com sucesso'
        },
        error: (err) => (err instanceof Error ? err.message : 'Erro ao salvar item'),
      }
    )
  }

  async function handleDelete(item: CanteenItem) {
    if (!confirm(`Excluir o item "${item.name}"?`)) {
      return
    }

    await toast.promise(deleteItem.mutateAsync({ params: { id: item.id } }), {
      loading: 'Excluindo item...',
      success: () => {
        queryClient.invalidateQueries({ queryKey: api.api.v1.canteenItems.index.pathKey() })
        return 'Item excluído com sucesso'
      },
      error: (err) => (err instanceof Error ? err.message : 'Erro ao excluir item'),
    })
  }

  async function handleToggle(item: CanteenItem) {
    await toast.promise(toggleItem.mutateAsync({ params: { id: item.id } }), {
      loading: item.isActive ? 'Desativando item...' : 'Ativando item...',
      success: () => {
        queryClient.invalidateQueries({ queryKey: api.api.v1.canteenItems.index.pathKey() })
        return 'Status atualizado'
      },
      error: (err) => (err instanceof Error ? err.message : 'Erro ao atualizar status'),
    })
  }

  const queryError = error instanceof Error ? error : error ? new Error('Erro inesperado') : null

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

        {queryError ? (
          <CanteenItemsErrorFallback error={queryError} resetErrorBoundary={() => refetch()} />
        ) : null}

        {!isLoading && !queryError && items.length === 0 && (
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

        {!isLoading && !queryError && items.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const imageUrl = getItemImageUrl(item.image)

                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-2">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
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
                )
              })}
            </div>

            {meta && Number(meta.lastPage) > 1 && (
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
                    Página {page} de {Number(meta.lastPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Number(meta.lastPage)}
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
                <Label>Categoria</Label>
                <CategoryCombobox
                  value={createForm.category}
                  onChange={(val) => setCreateForm((prev) => ({ ...prev, category: val }))}
                  categories={existingCategories}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-item-price">Preço</Label>
                <CurrencyInput
                  id="create-item-price"
                  value={createForm.price}
                  onChange={(cents) => setCreateForm((prev) => ({ ...prev, price: cents }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="create-item-image">Imagem (opcional)</Label>
              <p className="text-xs text-muted-foreground">
                Upload de imagem sera habilitado quando o contrato tipado da API incluir arquivo.
              </p>
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
                <Label>Categoria</Label>
                <CategoryCombobox
                  value={editForm.category}
                  onChange={(val) => setEditForm((prev) => ({ ...prev, category: val }))}
                  categories={existingCategories}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-item-price">Preço</Label>
                <CurrencyInput
                  id="edit-item-price"
                  value={editForm.price}
                  onChange={(cents) => setEditForm((prev) => ({ ...prev, price: cents }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-item-image">Imagem</Label>
              <p className="text-xs text-muted-foreground">
                Upload de imagem sera habilitado quando o contrato tipado da API incluir arquivo.
              </p>
              {editForm.imagePreviewUrl ? (
                <img
                  src={editForm.imagePreviewUrl}
                  alt="Imagem do item"
                  className="h-28 w-full rounded-md object-cover"
                />
              ) : null}
              {editingItem && getItemImageUrl(editingItem.image) ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditForm((prev) => ({
                      ...prev,
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
