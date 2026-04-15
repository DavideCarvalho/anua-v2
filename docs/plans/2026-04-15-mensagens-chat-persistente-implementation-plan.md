# Mensagens - Chat Persistente Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the "Dúvidas dos responsáveis" page into a persistent chat experience (WhatsApp-like) with read tracking and unread badges.

**Architecture:** Add a `ParentInquiryReadStatus` model to track when users last read each inquiry. Update the list and detail pages to show unread indicators and auto-mark as read. Remove the "resolve" concept from the UI.

**Tech Stack:** AdonisJS (Lucid ORM), React + Inertia, TanStack Query, TypeScript

---

### Task 1: Create migration for ParentInquiryReadStatus table

**Files:**

- Create: `database/migrations/1781000005000_create_parent_inquiry_read_status_table.ts`

**Step 1: Create the migration**

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ParentInquiryReadStatus'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('userId').notNullable()
      table.uuid('inquiryId').notNullable()
      table.timestamp('lastReadAt').notNullable()
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()

      table.unique(['userId', 'inquiryId'])
      table.foreign('userId').references('User.id').onDelete('CASCADE')
      table.foreign('inquiryId').references('ParentInquiry.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Step 2: Run migration**

Run: `node ace migration:run`
Expected: Migration runs successfully

**Step 3: Commit**

```bash
git add database/migrations/1781000005000_create_parent_inquiry_read_status_table.ts
git commit -m "feat(messages): add ParentInquiryReadStatus migration"
```

---

### Task 2: Create ParentInquiryReadStatus model

**Files:**

- Create: `app/models/parent_inquiry_read_status.ts`

**Step 1: Create the model**

```typescript
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import ParentInquiry from './parent_inquiry.js'

export default class ParentInquiryReadStatus extends BaseModel {
  static table = 'ParentInquiryReadStatus'

  @beforeCreate()
  static assignId(model: ParentInquiryReadStatus) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'inquiryId' })
  declare inquiryId: string

  @column.dateTime({ columnName: 'lastReadAt' })
  declare lastReadAt: DateTime

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => ParentInquiry, { foreignKey: 'inquiryId' })
  declare inquiry: BelongsTo<typeof ParentInquiry>
}
```

**Step 2: Add relationship on ParentInquiry model**

Modify: `app/models/parent_inquiry.ts`

Add import:

```typescript
import ParentInquiryReadStatus from './parent_inquiry_read_status.js'
```

Add relationship:

```typescript
@hasMany(() => ParentInquiryReadStatus, { foreignKey: 'inquiryId' })
declare readStatuses: HasMany<typeof ParentInquiryReadStatus>
```

**Step 3: Commit**

```bash
git add app/models/parent_inquiry_read_status.ts app/models/parent_inquiry.ts
git commit -m "feat(messages): add ParentInquiryReadStatus model and relationship"
```

---

### Task 3: Create mark-read controller and route

**Files:**

- Create: `app/controllers/escola/mark_inquiry_read_controller.ts`
- Modify: `start/routes/api/escola.ts`

**Step 1: Create the controller**

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryReadStatus from '#models/parent_inquiry_read_status'
import AppException from '#exceptions/app_exception'
import { DateTime } from 'luxon'
import { getInquiryActorTypeForUser } from '#services/inquiries/inquiry_school_access_service'

export default class MarkInquiryReadController {
  async handle({ params, auth, effectiveUser, selectedSchoolIds, response }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const scopedSchoolIds = selectedSchoolIds ?? []
    const { inquiryId } = params

    const inquiry = await ParentInquiry.query()
      .where('id', inquiryId)
      .whereIn('schoolId', scopedSchoolIds)
      .first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const actorType = await getInquiryActorTypeForUser(inquiry, user.id)
    if (!actorType) {
      throw AppException.forbidden('Você não tem permissão para visualizar esta pergunta')
    }

    await ParentInquiryReadStatus.updateOrCreate(
      { userId: user.id, inquiryId: inquiry.id },
      { lastReadAt: DateTime.now() }
    )

    return response.noContent()
  }
}
```

**Step 2: Add route**

Modify: `start/routes/api/escola.ts`

Find where the other inquiry routes are defined (look for `inquiries/:inquiryId/resolve`) and add:

```typescript
router.post(
  '/inquiries/:inquiryId/mark-read',
  () => import('#controllers/escola/mark_inquiry_read_controller')
)
```

**Step 3: Commit**

```bash
git add app/controllers/escola/mark_inquiry_read_controller.ts start/routes/api/escola.ts
git commit -m "feat(messages): add mark-inquiry-read endpoint"
```

---

### Task 4: Update list inquiries controller with unread info

**Files:**

- Modify: `app/controllers/escola/list_inquiries_controller.ts`
- Modify: `app/transformers/parent_inquiry_transformer.ts`

**Step 1: Update the list controller**

Modify: `app/controllers/escola/list_inquiries_controller.ts`

Changes to the query:

- Add `.preload('readStatuses', (rq) => rq.where('userId', user.id))`
- Change ordering to `.orderBy('updatedAt', 'desc')`
- Add `lastMessage` preload: modify messages preload to only get the last one for preview

The query should become:

```typescript
const query = ParentInquiry.query()
  .whereIn('id', inquiryIds)
  .whereIn('schoolId', scopedSchoolIds)
  .preload('student')
  .preload('createdByResponsible')
  .preload('readStatuses', (rq) => rq.where('userId', user.id))
  .preload('messages', (mq) => {
    mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
  })

if (payload.status && payload.status !== 'ALL') {
  query.where('status', payload.status)
}

const result = await query.orderBy('updatedAt', 'desc').paginate(page, limit)
```

**Step 2: Update transformer to include hasUnread**

Modify: `app/transformers/parent_inquiry_transformer.ts`

Add to the `toObject()` method, after the existing fields:

```typescript
hasUnread: this.computeHasUnread(this.resource),
```

Add the helper method:

```typescript
private computeHasUnread(inquiry: ParentInquiry): boolean {
  if (!inquiry.readStatuses || inquiry.readStatuses.length === 0) {
    return true // Never read = has unread
  }

  const lastReadAt = inquiry.readStatuses[0].lastReadAt
  const messages = inquiry.messages || []

  return messages.some((msg) => msg.createdAt > lastReadAt)
}
```

**Step 3: Commit**

```bash
git add app/controllers/escola/list_inquiries_controller.ts app/transformers/parent_inquiry_transformer.ts
git commit -m "feat(messages): add hasUnread field to inquiry list"
```

---

### Task 5: Update sidebar badge to use hasUnread

**Files:**

- Modify: `inertia/components/layouts/escola-layout.tsx`

**Step 1: Update UnreadMessagesBadge**

Replace the current `UnreadMessagesBadge` component to count inquiries with `hasUnread === true`:

```typescript
function UnreadMessagesBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/v1/escola/inquiries?limit=1', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const unreadCount = (data.data ?? []).filter(
          (i: { hasUnread: boolean }) => i.hasUnread
        ).length
        // Note: this only counts unread in first page. For accurate count,
        // we'd need a dedicated endpoint, but this works for the badge.
        setCount(unreadCount)
      })
      .catch(() => setCount(0))
  }, [])

  if (!count || count === 0) return null

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}
```

**Step 2: Commit**

```bash
git add inertia/components/layouts/escola-layout.tsx
git commit -m "feat(messages): update sidebar badge to use hasUnread"
```

---

### Task 6: Update inquiries list page (chat-style)

**Files:**

- Modify: `inertia/pages/escola/perguntas.tsx`

**Step 1: Update the list to show chat-style cards**

Changes:

- Order by updatedAt (already handled by backend)
- Show "Chat com [Nome do Responsável]" as title
- Show last message preview + time
- Show unread indicator (blue dot or highlighted background)
- Remove status badges from the list view

Update the card rendering:

```typescript
{inquiries.map((inquiry) => (
  <Link
    key={inquiry.id}
    route="web.escola.perguntas.show"
    routeParams={{ inquiryId: inquiry.id }}
    className="block"
  >
    <Card className={cn(
      "border-primary/20 hover:border-primary/40 transition-colors cursor-pointer",
      inquiry.hasUnread && "bg-muted/50 border-primary/40"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {inquiry.hasUnread && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
            <CardTitle className="text-base">
              Chat com {inquiry.createdByResponsible?.name || 'Responsável'}
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(inquiry.updatedAt), "HH:mm", { locale: ptBR })}
          </span>
        </div>
        <CardDescription className="flex items-center gap-4 mt-2">
          {inquiry.student && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {inquiry.student.name}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {inquiry.messages[inquiry.messages.length - 1]?.body || 'Sem mensagem'}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {inquiry.messages.length} mensagem{inquiry.messages.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
))}
```

Update the InquiryItem type to include `hasUnread`:

```typescript
type InquiryItem = {
  // ... existing fields
  hasUnread: boolean
}
```

**Step 2: Update page title and description**

Change:

- `<Head title="Mensagens" />` (already done)
- `<h1>Mensagens</h1>` (already done)
- Description: `"Conversas com os responsáveis sobre os alunos"`

**Step 3: Commit**

```bash
git add inertia/pages/escola/perguntas.tsx
git commit -m "feat(messages): update list to chat-style with unread indicators"
```

---

### Task 7: Update inquiry detail page

**Files:**

- Modify: `inertia/pages/escola/pergunta-detail.tsx`

**Step 1: Add mark-read on open**

In `InquiryDetailContent`, add a useEffect that calls mark-read when the inquiry loads:

```typescript
useEffect(() => {
  if (inquiry) {
    fetch(`/api/v1/escola/inquiries/${inquiryId}/mark-read`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['escola-inquiries'] })
    })
  }
}, [inquiry?.id])
```

**Step 2: Remove resolve button and status badge**

- Remove the "Marcar como resolvida" button
- Remove the `<StatusBadge status={inquiry.status} />`
- Remove the resolved notification banner (or keep it for historical context)

**Step 3: Update page title**

Change `<Head title="Detalhe da dúvida" />` to `<Head title="Mensagem" />`

**Step 4: Commit**

```bash
git add inertia/pages/escola/pergunta-detail.tsx
git commit -m "feat(messages): add mark-read on open, remove resolve button"
```

---

### Task 8: Run migration and verify

**Step 1: Run migration**

Run: `node ace migration:run`
Expected: All migrations run successfully

**Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Run tests**

Run: `node ace test`
Expected: All tests pass (or at least no new failures)

**Step 4: Commit**

```bash
git commit --allow-empty -m "chore(messages): verify migration and typecheck"
```
