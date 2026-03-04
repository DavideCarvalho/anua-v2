import { useCart } from '../../contexts/cart-context'
import { Backpack, ShoppingBag } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { MarketplaceCartContainer } from '../marketplace-cart-container'

export function GamifiedCartContainer({
  backHref = '/aluno/loja',
}: {
  /** Where to go after checkout or when empty (e.g. /aluno when in overlay). */
  backHref?: string
} = {}) {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gf-accent/30 py-16 text-center">
        <Backpack className="size-12 text-gf-accent/40" />
        <h3 className="mt-4 font-display text-lg font-semibold">
          Sua mochila está vazia!
        </h3>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          Visite o mercadinho para encontrar coisas legais
        </p>
        <Link
          href={backHref}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gf-primary px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-gf-primary-dark"
        >
          <ShoppingBag className="size-4" />
          Ir ao Mercadinho
        </Link>
      </div>
    )
  }

  return <MarketplaceCartContainer backHref={backHref} />
}
