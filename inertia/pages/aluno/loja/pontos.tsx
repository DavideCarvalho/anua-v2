import { useState } from 'react'
import type React from 'react'
import { Head, usePage } from '@inertiajs/react'
import { motion } from 'framer-motion'
import { AlunoLayout } from '../../../components/layouts/aluno-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Star, Sparkles, Shirt, Gem, Eye, Coins } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { AvatarComposed } from '../../../components/avatar/avatar-composed'
import { DiceBearAvatar } from '../../../components/avatar/dicebear-avatar'
import { AvatarPreviewPanel } from '../../../components/avatar/avatar-preview-panel'
import { TreasureCard } from '../../../components/gamificacao/treasure-card'
import { staggerContainer } from '../../../lib/gamified-animations'
import { firePurchaseConfetti } from '../../../lib/confetti'
import type { SharedProps } from '../../../lib/types'

interface AvatarItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl?: string | null
  metadata?: Record<string, unknown> | null
}

function getStringMetadata(
  metadata: Record<string, unknown> | null | undefined,
  key: string
): string {
  const value = metadata?.[key]
  return typeof value === 'string' ? value : ''
}

interface PontosPageProps {
  gamified?: boolean
  items: AvatarItem[]
  itemsByCategory: {
    AVATAR_HAIR: AvatarItem[]
    AVATAR_OUTFIT: AvatarItem[]
    AVATAR_ACCESSORY: AvatarItem[]
  }
  avatar: {
    id: string
    skinTone: string
    hairStyle: string
    hairColor: string
    outfit: string
    accessories: string[]
  }
  points: number
}

const categoryLabels: Record<string, { label: string; icon: React.ElementType }> = {
  AVATAR_HAIR: { label: 'Cabelo', icon: Sparkles },
  AVATAR_OUTFIT: { label: 'Roupa', icon: Shirt },
  AVATAR_ACCESSORY: { label: 'Acessórios', icon: Gem },
}

const AlunoLojaPontosPage: React.FC<PontosPageProps> = ({
  gamified: gamifiedProp,
  itemsByCategory,
  avatar,
  points,
}) => {
  const { props } = usePage<SharedProps>()
  const gamified = gamifiedProp ?? props.gamified ?? false

  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<AvatarItem | null>(null)
  const [previewCategory, setPreviewCategory] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const purchaseMutation = useMutation({
    mutationFn: async ({
      storeItemId,
      slot,
    }: {
      storeItemId: string
      slot: 'hair' | 'outfit' | 'accessory'
    }) => {
      const res = await fetch('/api/v1/students/me/avatar/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ storeItemId, slot }),
        credentials: 'include',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Erro ao comprar')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
      if (gamified) firePurchaseConfetti()
      toast.success('Item comprado com sucesso!')
      setPurchasingId(null)
      window.location.reload()
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setPurchasingId(null)
    },
  })

  const getSlotForCategory = (category: string): 'hair' | 'outfit' | 'accessory' => {
    if (category === 'AVATAR_HAIR') return 'hair'
    if (category === 'AVATAR_OUTFIT') return 'outfit'
    return 'accessory'
  }

  const getPreviewAvatarProps = () => {
    if (!previewItem || !previewCategory) return { ...avatar }
    const style = getStringMetadata(previewItem.metadata, 'style')
    const color = getStringMetadata(previewItem.metadata, 'color')

    if (previewCategory === 'AVATAR_HAIR') {
      return {
        ...avatar,
        hairStyle: style || previewItem.id,
        hairColor: color || 'brown',
      }
    }
    if (previewCategory === 'AVATAR_OUTFIT') {
      return { ...avatar, outfit: previewItem.id }
    }
    if (previewCategory === 'AVATAR_ACCESSORY') {
      return {
        ...avatar,
        accessories: [...(avatar.accessories ?? []), previewItem.id],
      }
    }
    return { ...avatar }
  }

  const categories = Object.entries(itemsByCategory).filter(([, items]) => items.length > 0)
  const isEmpty = categories.length === 0

  if (gamified) {
    return (
      <AlunoLayout>
        <Head title="Baú de Tesouros" />
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-gf-primary-dark dark:text-gf-primary-light">
                Baú de Tesouros
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Troque seus pontos por itens para o avatar
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-gf-gold/20 px-4 py-2 dark:bg-gf-gold-dark/20">
              <Coins className="size-5 text-gf-gold-dark" />
              <span className="font-display text-lg font-bold text-gf-gold-dark">{points}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Avatar Preview Sidebar */}
            <div className="shrink-0 lg:w-64">
              <div className="sticky top-4">
                <AvatarPreviewPanel
                  skinTone={previewItem ? getPreviewAvatarProps().skinTone : avatar.skinTone}
                  hairStyle={previewItem ? getPreviewAvatarProps().hairStyle : avatar.hairStyle}
                  hairColor={previewItem ? getPreviewAvatarProps().hairColor : avatar.hairColor}
                  outfit={previewItem ? getPreviewAvatarProps().outfit : avatar.outfit}
                  accessories={
                    previewItem ? getPreviewAvatarProps().accessories : avatar.accessories
                  }
                  label={previewItem ? `Provando: ${previewItem.name}` : 'Seu Avatar'}
                />
              </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1">
              {isEmpty ? (
                <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gf-gold/30 py-16 text-center">
                  <Gem className="size-12 text-gf-gold/40" />
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    Baú vazio por enquanto!
                  </h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    A escola ainda não adicionou tesouros. Volte depois!
                  </p>
                </div>
              ) : (
                <Tabs defaultValue={categories[0]?.[0]} className="space-y-4">
                  <TabsList className="bg-gf-primary/5 dark:bg-gf-primary/10">
                    {categories.map(([category]) => {
                      const { label, icon: Icon } = categoryLabels[category] ?? {
                        label: category,
                        icon: Sparkles,
                      }
                      return (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="gap-1.5 font-body data-[state=active]:bg-gf-primary data-[state=active]:text-white"
                        >
                          <Icon className="size-4" />
                          {label}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {categories.map(([category, items]) => (
                    <TabsContent key={category} value={category}>
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {items.map((item) => {
                          const { icon: Icon } = categoryLabels[category] ?? {
                            icon: Sparkles,
                          }
                          return (
                            <TreasureCard
                              key={item.id}
                              name={item.name}
                              description={item.description}
                              price={item.price}
                              imageUrl={item.imageUrl}
                              icon={<Icon className="size-12" />}
                              canAfford={points >= item.price}
                              isPurchasing={purchasingId === item.id}
                              onPreview={() => {
                                setPreviewItem(item)
                                setPreviewCategory(category)
                              }}
                              onBuy={() => {
                                setPurchasingId(item.id)
                                purchaseMutation.mutate({
                                  storeItemId: item.id,
                                  slot: getSlotForCategory(category),
                                })
                              }}
                            />
                          )
                        })}
                      </motion.div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </div>

          {/* Preview Dialog */}
          <Dialog
            open={!!previewItem}
            onOpenChange={(open) => {
              if (!open) {
                setPreviewItem(null)
                setPreviewCategory(null)
              }
            }}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">{previewItem?.name}</DialogTitle>
                <DialogDescription className="font-body">
                  Veja como ficará seu avatar com este item
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-4">
                <DiceBearAvatar {...getPreviewAvatarProps()} variant="large" />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-xl font-body"
                  onClick={() => setPreviewItem(null)}
                >
                  Fechar
                </Button>
                {previewItem && (
                  <Button
                    className="rounded-xl bg-gf-accent font-body text-white hover:bg-gf-accent/90"
                    disabled={points < previewItem.price || purchasingId === previewItem.id}
                    onClick={() => {
                      setPurchasingId(previewItem.id)
                      purchaseMutation.mutate({
                        storeItemId: previewItem.id,
                        slot: getSlotForCategory(previewCategory ?? ''),
                      })
                      setPreviewItem(null)
                    }}
                  >
                    {purchasingId === previewItem.id
                      ? 'Comprando...'
                      : `Comprar por ${previewItem.price} pts`}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AlunoLayout>
    )
  }

  // Non-gamified layout (original)
  return (
    <AlunoLayout>
      <Head title="Loja de Pontos" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loja de Pontos</h1>
            <p className="text-muted-foreground">
              Troque seus pontos por customização do seu boneco
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 text-lg px-4 py-2">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            {points} pontos
          </Badge>
        </div>

        {Object.entries(itemsByCategory).map(([category, items]) => {
          if (items.length === 0) return null
          const { label, icon: Icon } = categoryLabels[category] ?? {
            label: category,
            icon: Sparkles,
          }
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {label}
                </CardTitle>
                <CardDescription>Itens disponíveis para comprar com pontos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {items.map((item) => {
                    const canAfford = points >= item.price
                    const isPurchasing = purchasingId === item.id
                    return (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                          {item.description && (
                            <CardDescription className="text-xs line-clamp-2">
                              {item.description}
                            </CardDescription>
                          )}
                          <div className="flex flex-col gap-2 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-sm font-medium">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                {item.price} pts
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setPreviewItem(item)
                                  setPreviewCategory(category)
                                }}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                disabled={!canAfford || isPurchasing}
                                onClick={() => {
                                  setPurchasingId(item.id)
                                  purchaseMutation.mutate({
                                    storeItemId: item.id,
                                    slot: getSlotForCategory(category),
                                  })
                                }}
                              >
                                {isPurchasing ? 'Comprando...' : 'Comprar'}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {itemsByCategory.AVATAR_HAIR.length === 0 &&
          itemsByCategory.AVATAR_OUTFIT.length === 0 &&
          itemsByCategory.AVATAR_ACCESSORY.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum item disponível</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  A escola ainda não cadastrou itens para customização. Aguarde novidades!
                </p>
              </CardContent>
            </Card>
          )}

        <Dialog
          open={!!previewItem}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewItem(null)
              setPreviewCategory(null)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Preview: {previewItem?.name}</DialogTitle>
              <DialogDescription>Veja como ficará seu boneco com este item</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <AvatarComposed {...getPreviewAvatarProps()} className="max-w-[200px]" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewItem(null)}>
                Fechar
              </Button>
              {previewItem && (
                <Button
                  disabled={points < previewItem.price || purchasingId === previewItem.id}
                  onClick={() => {
                    setPurchasingId(previewItem.id)
                    purchaseMutation.mutate({
                      storeItemId: previewItem.id,
                      slot: getSlotForCategory(previewCategory ?? ''),
                    })
                    setPreviewItem(null)
                  }}
                >
                  {purchasingId === previewItem.id
                    ? 'Comprando...'
                    : `Comprar por ${previewItem.price} pts`}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AlunoLayout>
  )
}

export default AlunoLojaPontosPage
