import { DiceBearAvatar } from './dicebear-avatar'

interface AvatarPreviewPanelProps {
  skinTone?: string
  hairStyle?: string
  hairColor?: string
  outfit?: string
  accessories?: string[]
  label?: string
}

export function AvatarPreviewPanel({
  skinTone,
  hairStyle,
  hairColor,
  outfit,
  accessories,
  label = 'Provador',
}: AvatarPreviewPanelProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gf-primary/30 bg-gradient-to-b from-gf-primary-light/50 to-transparent p-6 dark:border-gf-primary/20 dark:from-gf-primary-dark/20">
      <p className="font-display text-sm font-semibold text-gf-primary">{label}</p>
      <div className="relative">
        <div className="absolute inset-0 animate-[gf-pulse-glow_2s_ease-in-out_infinite] rounded-full" />
        <DiceBearAvatar
          skinTone={skinTone}
          hairStyle={hairStyle}
          hairColor={hairColor}
          outfit={outfit}
          accessories={accessories}
          variant="large"
        />
      </div>
    </div>
  )
}
