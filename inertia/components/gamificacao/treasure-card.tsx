import { motion } from 'framer-motion'
import { Coins, Eye } from 'lucide-react'
import { Button } from '../ui/button'
import { fadeUp } from '../../lib/gamified-animations'

interface TreasureCardProps {
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  icon: React.ReactNode
  canAfford: boolean
  isPurchasing: boolean
  onPreview: () => void
  onBuy: () => void
}

export function TreasureCard({
  name,
  description,
  price,
  imageUrl,
  icon,
  canAfford,
  isPurchasing,
  onPreview,
  onBuy,
}: TreasureCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <div className="group overflow-hidden rounded-2xl border-2 border-gf-gold/30 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gf-gold-dark/30 dark:bg-gf-navy/60">
        <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gf-gold/10 to-gf-secondary-light dark:from-gf-gold-dark/10 dark:to-gf-navy/40">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="size-full object-cover" />
          ) : (
            <div className="text-gf-secondary">{icon}</div>
          )}
        </div>
        <div className="space-y-2 p-3">
          <h4 className="font-display text-sm font-bold">{name}</h4>
          {description && (
            <p className="font-body text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}
          <div className="flex items-center gap-1 font-display text-sm font-bold text-gf-gold-dark">
            <Coins className="size-4" />
            {price} pts
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-xl border-gf-primary/30 font-body text-gf-primary hover:bg-gf-primary/10"
              onClick={onPreview}
            >
              <Eye className="mr-1 size-3" />
              Ver
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-xl bg-gf-accent font-body text-white hover:bg-gf-accent/90"
              disabled={!canAfford || isPurchasing}
              onClick={onBuy}
            >
              {isPurchasing ? 'Comprando...' : 'Comprar'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
