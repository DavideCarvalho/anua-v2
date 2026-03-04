import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import * as adventurer from '@dicebear/adventurer'
import * as pixelArt from '@dicebear/pixel-art'
import { cn } from '../../lib/utils'

interface DiceBearAvatarProps {
  skinTone?: string
  hairStyle?: string
  hairColor?: string
  outfit?: string
  accessories?: string[]
  seed?: string
  variant?: 'compact' | 'default' | 'large'
  style?: 'adventurer' | 'pixel-art'
  className?: string
}

const sizeMap = {
  compact: 'size-10',
  default: 'size-32 sm:size-40',
  large: 'size-48 sm:size-56',
}

export function DiceBearAvatar({
  skinTone,
  hairStyle,
  hairColor,
  outfit,
  accessories = [],
  seed,
  variant = 'default',
  style = 'adventurer',
  className,
}: DiceBearAvatarProps) {
  const dataUri = useMemo(() => {
    const safeAccessories = Array.isArray(accessories) ? accessories : []
    const combinedSeed = seed ?? [skinTone, hairStyle, hairColor, outfit, ...safeAccessories].filter(Boolean).join('-')

    const size = variant === 'compact' ? 40 : variant === 'large' ? 224 : 160
    const avatar = style === 'pixel-art'
      ? createAvatar(pixelArt, { seed: combinedSeed, size })
      : createAvatar(adventurer, { seed: combinedSeed, size })

    return avatar.toDataUri()
  }, [skinTone, hairStyle, hairColor, outfit, accessories, seed, variant, style])

  return (
    <img
      src={dataUri}
      alt="Avatar"
      className={cn(
        'rounded-full object-contain',
        sizeMap[variant],
        className
      )}
    />
  )
}
