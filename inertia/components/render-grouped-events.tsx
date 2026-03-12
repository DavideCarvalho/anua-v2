import type { ReactElement } from 'react'
import { getEventBlockStyle } from '~/components/helpers'
import type { IEvent } from '~/components/interfaces'
import { EventBlock } from '~/components/event-block'

interface RenderGroupedEventsProps {
  groupedEvents: IEvent[][]
  day: Date
}

const MAX_VISIBLE_EVENTS_PER_TIME = 2
const COLUMN_GAP_PX = 4

export function RenderGroupedEvents({ groupedEvents, day }: RenderGroupedEventsProps) {
  const eventsByStartTime = new Map<string, Array<{ event: IEvent; groupIndex: number }>>()

  groupedEvents.forEach((group, groupIndex) => {
    group.forEach((event) => {
      const existing = eventsByStartTime.get(event.startDate) ?? []
      existing.push({ event, groupIndex })
      eventsByStartTime.set(event.startDate, existing)
    })
  })

  const renderedBlocks: ReactElement[] = []

  eventsByStartTime.forEach((items, startDateKey) => {
    const sortedItems = [...items].sort((a, b) => a.groupIndex - b.groupIndex)
    const visibleItems = sortedItems.slice(0, MAX_VISIBLE_EVENTS_PER_TIME)
    const hiddenCount = sortedItems.length - visibleItems.length

    visibleItems.forEach(({ event }, visibleIndex) => {
      const style = getEventBlockStyle(event, day, visibleIndex, visibleItems.length)
      const groupSize = visibleItems.length

      const spacedStyle =
        groupSize > 1
          ? {
              ...style,
              width: `calc(${100 / groupSize}% - ${(COLUMN_GAP_PX * (groupSize - 1)) / groupSize}px)`,
              left: `calc(${(visibleIndex * 100) / groupSize}% + ${visibleIndex * COLUMN_GAP_PX}px)`,
            }
          : style

      renderedBlocks.push(
        <div
          key={`${event.id}-${event.startDate}`}
          className="absolute box-border p-1"
          style={spacedStyle}
        >
          <EventBlock
            event={event}
            className={groupSize > 1 ? 'gap-0 px-1 py-1 text-[11px]' : undefined}
          />
        </div>
      )
    })

    if (hiddenCount > 0) {
      const badgeAnchor = visibleItems[visibleItems.length - 1]?.event

      if (!badgeAnchor) return

      const anchorStyle = getEventBlockStyle(
        badgeAnchor,
        day,
        Math.max(0, visibleItems.length - 1),
        visibleItems.length
      )

      renderedBlocks.push(
        <div
          key={`more-${startDateKey}`}
          className="pointer-events-none absolute box-border p-1"
          style={{
            ...anchorStyle,
            top: `calc(${anchorStyle.top} + 2px)`,
          }}
        >
          <div className="w-fit max-w-full rounded border bg-background/95 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground">
            +{hiddenCount}
          </div>
        </div>
      )
    }
  })

  return renderedBlocks
}
