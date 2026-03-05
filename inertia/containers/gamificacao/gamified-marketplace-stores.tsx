import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ShoppingBag, Store as StoreIcon } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { api } from '~/lib/api'
import { staggerContainer, fadeUp } from '../../lib/gamified-animations'
import type { Route } from '@tuyau/core/types'

type StoresResponse = Awaited<Route.Response<'api.v1.marketplace.stores.index'>>

export function GamifiedMarketplaceStores() {
  const { data, isLoading } = useQuery(api.api.v1.marketplace.stores.index.queryOptions({}))
  const stores: StoresResponse = (data as StoresResponse | undefined) ?? []

  if (isLoading) {
    return <div className="py-12 text-center font-body text-muted-foreground">Carregando...</div>
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gf-secondary/40 py-16 text-center">
        <ShoppingBag className="size-12 text-gf-secondary/50" />
        <h3 className="mt-4 font-display text-lg font-semibold">Nenhuma barraquinha aberta!</h3>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          O mercadinho está fechado no momento. Volte depois!
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {stores.map((store: StoresResponse[number]) => (
        <motion.a key={store.id} href={`/aluno/loja/${store.id}`} variants={fadeUp}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="h-full cursor-pointer overflow-hidden rounded-2xl border border-gf-secondary/30 bg-gf-secondary-light shadow-md transition-shadow hover:shadow-lg dark:border-gf-secondary/20 dark:bg-gf-navy/60"
          >
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gf-primary/10">
                    <StoreIcon className="size-5 text-gf-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{store.name}</h3>
                </div>
                <Badge
                  className={
                    store.type === 'INTERNAL'
                      ? 'bg-gf-primary/10 text-gf-primary hover:bg-gf-primary/10'
                      : 'bg-gf-secondary/20 text-gf-secondary hover:bg-gf-secondary/20'
                  }
                >
                  {store.type === 'INTERNAL' ? 'Interna' : 'Terceirizada'}
                </Badge>
              </div>
              {store.description && (
                <p className="font-body text-sm text-muted-foreground line-clamp-2">
                  {store.description}
                </p>
              )}
              <p className="mt-3 font-body text-xs text-muted-foreground">{store.school?.name}</p>
            </div>
          </motion.div>
        </motion.a>
      ))}
    </motion.div>
  )
}
