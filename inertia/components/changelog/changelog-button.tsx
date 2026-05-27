import { useState } from 'react'
import { Gift } from 'lucide-react'

import { Button } from '../ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  changelog,
  filterChangelog,
  type ChangelogAudience,
  type ChangelogEntry,
} from '../../lib/changelog'

const CHANGELOG_SEEN_KEY = 'anua:changelog-seen'

function getLastSeenId(): string | null {
  return localStorage.getItem(CHANGELOG_SEEN_KEY)
}

function markSeen(id: string) {
  localStorage.setItem(CHANGELOG_SEEN_KEY, id)
}

function EntryList({ entries }: { entries: ChangelogEntry[] }) {
  if (entries.length === 0) {
    return <p className="py-4 text-center text-xs text-muted-foreground">Nenhuma novidade.</p>
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{entry.date}</p>
          <ul className="space-y-1">
            {entry.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

interface ChangelogButtonProps {
  audience?: ChangelogAudience
}

export function ChangelogButton({ audience = 'all' }: ChangelogButtonProps) {
  const latestEntry = changelog[0]
  if (!latestEntry) return null

  const lastSeen = getLastSeenId()
  const filtered = filterChangelog(changelog, audience)
  const hasNew = lastSeen !== latestEntry.id && filtered.length > 0
  const [open, setOpen] = useState(false)

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen && hasNew) {
      markSeen(latestEntry.id)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Novidades">
          <Gift className="h-4 w-4" />
          {hasNew && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Novidades</p>
            <p className="text-xs text-muted-foreground">O que há de novo no Anuá</p>
          </div>

          <Tabs defaultValue="pra-voce">
            <TabsList className="w-full">
              <TabsTrigger value="pra-voce" className="flex-1 text-xs">
                Pra você
              </TabsTrigger>
              <TabsTrigger value="tudo" className="flex-1 text-xs">
                Tudo
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pra-voce" className="mt-3">
              <EntryList entries={filtered.slice(0, 3)} />
            </TabsContent>
            <TabsContent value="tudo" className="mt-3">
              <EntryList entries={changelog.slice(0, 3)} />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
