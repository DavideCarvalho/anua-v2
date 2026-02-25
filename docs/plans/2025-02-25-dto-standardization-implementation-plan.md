# DTO Standardization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Padronizar todos os endpoints para retornar DTOs em vez de modelos Lucid diretamente, garantindo consistência, segurança e manutenibilidade da API.

**Architecture:** Criar DTOs usando `@adocasts.com/dto/base` para cada modelo, seguindo o padrão já existente no projeto. Migrar controllers gradualmente por domínio, garantindo que cada endpoint retorne um DTO apropriado.

**Tech Stack:** AdonisJS v6, Lucid ORM, @adocasts.com/dto, TypeScript

---

## Fase 1: Domínio Canteen (Semana 1)

### Task 1.1: Criar DTOs para CanteenPurchase

**Files:**

- Create: `app/models/dto/canteen_purchase_with_relations.dto.ts`
- Modify: `app/controllers/canteen_purchases/show_canteen_purchase_controller.ts`
- Modify: `app/controllers/canteen_purchases/create_canteen_purchase_controller.ts`
- Modify: `app/controllers/canteen_purchases/update_canteen_purchase_status_controller.ts`
- Modify: `app/controllers/canteen_purchases/cancel_canteen_purchase_controller.ts`

**Step 1: Criar DTO para CanteenPurchase com relações**

```typescript
// app/models/dto/canteen_purchase_with_relations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenPurchase from '#models/canteen_purchase'
import type CanteenPurchaseStatus from '#models/canteen_purchase'
import UserMinimalDto from '#models/dto/user_minimal.dto'
import CanteenMinimalDto from '#models/dto/canteen_minimal.dto'
import CanteenItemPurchasedDto from '#models/dto/canteen_item_purchased.dto'

export default class CanteenPurchaseWithRelationsDto extends BaseModelDto {
  declare id: string
  declare status: CanteenPurchaseStatus
  declare totalAmount: number
  declare notes: string | null
  declare canteenId: string
  declare userId: string
  declare processedBy: string | null
  declare processedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  // Relações
  declare user?: UserMinimalDto
  declare canteen?: CanteenMinimalDto
  declare itemsPurchased?: CanteenItemPurchasedDto[]

  constructor(purchase?: CanteenPurchase) {
    super()
    if (!purchase) return

    this.id = purchase.id
    this.status = purchase.status
    this.totalAmount = purchase.totalAmount
    this.notes = purchase.notes
    this.canteenId = purchase.canteenId
    this.userId = purchase.userId
    this.processedBy = purchase.processedBy
    this.processedAt = purchase.processedAt ? purchase.processedAt.toJSDate() : null
    this.createdAt = purchase.createdAt.toJSDate()
    this.updatedAt = purchase.updatedAt.toJSDate()

    if (purchase.$preloaded.user) {
      this.user = new UserMinimalDto(purchase.$preloaded.user)
    }
    if (purchase.$preloaded.canteen) {
      this.canteen = new CanteenMinimalDto(purchase.$preloaded.canteen)
    }
    if (purchase.$preloaded.itemsPurchased) {
      this.itemsPurchased = (purchase.$preloaded.itemsPurchased as any[]).map(
        (item) => new CanteenItemPurchasedDto(item)
      )
    }
  }
}
```

**Step 2: Verificar se UserMinimalDto existe, se não criar**

```typescript
// app/models/dto/user_minimal.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type User from '#models/user'

export default class UserMinimalDto extends BaseModelDto {
  declare id: string
  declare email: string
  declare fullName: string | null
  declare avatarUrl: string | null

  constructor(user?: User) {
    super()
    if (!user) return

    this.id = user.id
    this.email = user.email
    this.fullName = user.fullName
    this.avatarUrl = user.avatarUrl
  }
}
```

**Step 3: Verificar se CanteenMinimalDto existe, se não criar**

```typescript
// app/models/dto/canteen_minimal.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Canteen from '#models/canteen'

export default class CanteenMinimalDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare status: string

  constructor(canteen?: Canteen) {
    super()
    if (!canteen) return

    this.id = canteen.id
    this.name = canteen.name
    this.status = canteen.status
  }
}
```

**Step 4: Verificar se CanteenItemPurchasedDto existe, se não criar**

```typescript
// app/models/dto/canteen_item_purchased.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenItemPurchased from '#models/canteen_item_purchased'
import CanteenItemDto from '#models/dto/canteen_item.dto'

export default class CanteenItemPurchasedDto extends BaseModelDto {
  declare id: string
  declare quantity: number
  declare unitPrice: number
  declare totalPrice: number
  declare canteenPurchaseId: string
  declare canteenItemId: string
  declare item?: CanteenItemDto

  constructor(itemPurchased?: CanteenItemPurchased) {
    super()
    if (!itemPurchased) return

    this.id = itemPurchased.id
    this.quantity = itemPurchased.quantity
    this.unitPrice = itemPurchased.unitPrice
    this.totalPrice = itemPurchased.totalPrice
    this.canteenPurchaseId = itemPurchased.canteenPurchaseId
    this.canteenItemId = itemPurchased.canteenItemId

    if ((itemPurchased as any).$preloaded?.item) {
      this.item = new CanteenItemDto((itemPurchased as any).$preloaded.item)
    }
  }
}
```

**Step 5: Verificar se CanteenItemDto existe, se não criar**

```typescript
// app/models/dto/canteen_item.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenItem from '#models/canteen_item'

export default class CanteenItemDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare description: string | null
  declare price: number
  declare isActive: boolean
  declare canteenId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(item?: CanteenItem) {
    super()
    if (!item) return

    this.id = item.id
    this.name = item.name
    this.description = item.description
    this.price = item.price
    this.isActive = item.isActive
    this.canteenId = item.canteenId
    this.createdAt = item.createdAt.toJSDate()
    this.updatedAt = item.updatedAt.toJSDate()
  }
}
```

**Step 6: Atualizar show_canteen_purchase_controller.ts**

```typescript
// app/controllers/canteen_purchases/show_canteen_purchase_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import CanteenPurchase from '#models/canteen_purchase'
import CanteenPurchaseWithRelationsDto from '#models/dto/canteen_purchase_with_relations.dto'
import AppException from '#exceptions/app_exception'

export default class ShowCanteenPurchaseController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const purchase = await CanteenPurchase.query()
      .where('id', id)
      .preload('user')
      .preload('canteen')
      .preload('itemsPurchased', (query) => {
        query.preload('item')
      })
      .first()

    if (!purchase) {
      throw AppException.notFound('Compra da cantina não encontrada')
    }

    return response.ok(new CanteenPurchaseWithRelationsDto(purchase))
  }
}
```

**Step 7: Atualizar create_canteen_purchase_controller.ts**

```typescript
// app/controllers/canteen_purchases/create_canteen_purchase_controller.ts
// ... imports existentes ...
import CanteenPurchaseWithRelationsDto from '#models/dto/canteen_purchase_with_relations.dto'

// ... no final do método handle:
return response.ok(new CanteenPurchaseWithRelationsDto(purchase))
```

**Step 8: Atualizar update_canteen_purchase_status_controller.ts**

```typescript
// app/controllers/canteen_purchases/update_canteen_purchase_status_controller.ts
// ... imports existentes ...
import CanteenPurchaseWithRelationsDto from '#models/dto/canteen_purchase_with_relations.dto'

// ... no final do método handle:
return response.ok(new CanteenPurchaseWithRelationsDto(purchase))
```

**Step 9: Atualizar cancel_canteen_purchase_controller.ts**

```typescript
// app/controllers/canteen_purchases/cancel_canteen_purchase_controller.ts
// ... imports existentes ...
import CanteenPurchaseWithRelationsDto from '#models/dto/canteen_purchase_with_relations.dto'

// ... no final do método handle:
return response.ok(new CanteenPurchaseWithRelationsDto(purchase))
```

**Step 10: Commit**

```bash
git add app/models/dto/
git add app/controllers/canteen_purchases/
git commit -m "feat: add DTOs for canteen purchases with relations"
```

---

### Task 1.2: Criar DTOs para CanteenMeal

**Files:**

- Create: `app/models/dto/canteen_meal.dto.ts` (verificar se já existe)
- Create: `app/models/dto/canteen_meal_with_reservations.dto.ts`
- Modify: `app/controllers/canteen_meals/show_canteen_meal_controller.ts`
- Modify: `app/controllers/canteen_meals/create_canteen_meal_controller.ts`
- Modify: `app/controllers/canteen_meals/update_canteen_meal_controller.ts`

**Step 1: Verificar e criar CanteenMealDto se necessário**

```typescript
// app/models/dto/canteen_meal.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMeal from '#models/canteen_meal'

export default class CanteenMealDto extends BaseModelDto {
  declare id: string
  declare date: Date
  declare menuDescription: string | null
  declare canteenId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(meal?: CanteenMeal) {
    super()
    if (!meal) return

    this.id = meal.id
    this.date = meal.date.toJSDate()
    this.menuDescription = meal.menuDescription
    this.canteenId = meal.canteenId
    this.createdAt = meal.createdAt.toJSDate()
    this.updatedAt = meal.updatedAt.toJSDate()
  }
}
```

**Step 2: Criar DTO com reservas**

```typescript
// app/models/dto/canteen_meal_with_reservations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMeal from '#models/canteen_meal'
import CanteenMealDto from '#models/dto/canteen_meal.dto'
import CanteenMealReservationDto from '#models/dto/canteen_meal_reservation.dto'

export default class CanteenMealWithReservationsDto extends BaseModelDto {
  declare id: string
  declare date: Date
  declare menuDescription: string | null
  declare canteenId: string
  declare createdAt: Date
  declare updatedAt: Date
  declare reservations?: CanteenMealReservationDto[]
  declare reservationCount?: number

  constructor(meal?: CanteenMeal) {
    super()
    if (!meal) return

    this.id = meal.id
    this.date = meal.date.toJSDate()
    this.menuDescription = meal.menuDescription
    this.canteenId = meal.canteenId
    this.createdAt = meal.createdAt.toJSDate()
    this.updatedAt = meal.updatedAt.toJSDate()

    if (meal.$preloaded.reservations) {
      this.reservations = (meal.$preloaded.reservations as any[]).map(
        (r) => new CanteenMealReservationDto(r)
      )
    }

    if ((meal as any).$extras?.reservationCount !== undefined) {
      this.reservationCount = (meal as any).$extras.reservationCount
    }
  }
}
```

**Step 3: Atualizar controllers**

Atualizar `show_canteen_meal_controller.ts`, `create_canteen_meal_controller.ts`, e `update_canteen_meal_controller.ts` para usar o DTO apropriado.

**Step 4: Commit**

```bash
git add app/models/dto/
git add app/controllers/canteen_meals/
git commit -m "feat: add DTOs for canteen meals with reservations"
```

---

### Task 1.3: Criar DTOs para CanteenMonthlyTransfer

**Files:**

- Create: `app/models/dto/canteen_monthly_transfer_with_relations.dto.ts`
- Modify: `app/controllers/canteen_monthly_transfers/show_canteen_monthly_transfer_controller.ts`
- Modify: `app/controllers/canteen_monthly_transfers/create_canteen_monthly_transfer_controller.ts`
- Modify: `app/controllers/canteen_monthly_transfers/update_canteen_monthly_transfer_status_controller.ts`

**Step 1: Criar DTO com relações**

```typescript
// app/models/dto/canteen_monthly_transfer_with_relations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMonthlyTransfer from '#models/canteen_monthly_transfer'
import type CanteenMonthlyTransferStatus from '#models/canteen_monthly_transfer'
import CanteenMinimalDto from '#models/dto/canteen_minimal.dto'
import UserMinimalDto from '#models/dto/user_minimal.dto'

export default class CanteenMonthlyTransferWithRelationsDto extends BaseModelDto {
  declare id: string
  declare yearMonth: string
  declare totalAmount: number
  declare transferAmount: number
  declare feeAmount: number
  declare status: CanteenMonthlyTransferStatus
  declare transferDate: Date | null
  declare notes: string | null
  declare canteenId: string
  declare processedBy: string | null
  declare createdAt: Date
  declare updatedAt: Date

  declare canteen?: CanteenMinimalDto
  declare processedByUser?: UserMinimalDto

  constructor(transfer?: CanteenMonthlyTransfer) {
    super()
    if (!transfer) return

    this.id = transfer.id
    this.yearMonth = transfer.yearMonth
    this.totalAmount = transfer.totalAmount
    this.transferAmount = transfer.transferAmount
    this.feeAmount = transfer.feeAmount
    this.status = transfer.status
    this.transferDate = transfer.transferDate ? transfer.transferDate.toJSDate() : null
    this.notes = transfer.notes
    this.canteenId = transfer.canteenId
    this.processedBy = transfer.processedBy
    this.createdAt = transfer.createdAt.toJSDate()
    this.updatedAt = transfer.updatedAt.toJSDate()

    if (transfer.$preloaded.canteen) {
      this.canteen = new CanteenMinimalDto(transfer.$preloaded.canteen)
    }
    if (transfer.$preloaded.processedByUser) {
      this.processedByUser = new UserMinimalDto(transfer.$preloaded.processedByUser)
    }
  }
}
```

**Step 2: Atualizar controllers**

Atualizar os 3 controllers de canteen_monthly_transfers para usar o novo DTO.

**Step 3: Commit**

```bash
git add app/models/dto/
git add app/controllers/canteen_monthly_transfers/
git commit -m "feat: add DTOs for canteen monthly transfers with relations"
```

---

### Task 1.4: Criar DTOs para CanteenItem

**Files:**

- Verify: `app/models/dto/canteen_item.dto.ts` (já criado na Task 1.1)
- Modify: `app/controllers/canteen_items/show_canteen_item_controller.ts`
- Modify: `app/controllers/canteen_items/toggle_canteen_item_active_controller.ts`
- Modify: `app/controllers/canteen_items/list_items_by_canteen_controller.ts`

**Step 1: Verificar DTO existente**

O DTO `canteen_item.dto.ts` já foi criado na Task 1.1. Verificar se precisa de ajustes.

**Step 2: Atualizar controllers**

```typescript
// app/controllers/canteen_items/show_canteen_item_controller.ts
// ... imports ...
import CanteenItemDto from '#models/dto/canteen_item.dto'

// ... no final:
return response.ok(new CanteenItemDto(canteenItem))
```

**Step 3: Commit**

```bash
git add app/controllers/canteen_items/
git commit -m "feat: use DTO for canteen items responses"
```

---

### Task 1.5: Criar DTOs para CanteenMealReservation

**Files:**

- Verify: `app/models/dto/canteen_meal_reservation.dto.ts` (já existe)
- Modify: `app/controllers/canteen_meal_reservations/show_canteen_meal_reservation_controller.ts`
- Modify: `app/controllers/canteen_meal_reservations/create_canteen_meal_reservation_controller.ts`
- Modify: `app/controllers/canteen_meal_reservations/update_canteen_meal_reservation_status_controller.ts`
- Modify: `app/controllers/canteen_meal_reservations/delete_canteen_meal_reservation_controller.ts`

**Step 1: Verificar DTO existente**

O DTO `canteen_meal_reservation.dto.ts` já existe. Verificar se atende às necessidades.

**Step 2: Criar DTO com relações se necessário**

Se o controller precisar de mais dados, criar:

```typescript
// app/models/dto/canteen_meal_reservation_with_relations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type CanteenMealReservation from '#models/canteen_meal_reservation'
import StudentMinimalDto from '#models/dto/student_minimal.dto'
import CanteenMealDto from '#models/dto/canteen_meal.dto'

export default class CanteenMealReservationWithRelationsDto extends BaseModelDto {
  declare id: string
  declare status: string
  declare studentId: string
  declare canteenMealId: string
  declare createdAt: Date
  declare updatedAt: Date

  declare student?: StudentMinimalDto
  declare canteenMeal?: CanteenMealDto

  constructor(reservation?: CanteenMealReservation) {
    super()
    if (!reservation) return

    this.id = reservation.id
    this.status = reservation.status
    this.studentId = reservation.studentId
    this.canteenMealId = reservation.canteenMealId
    this.createdAt = reservation.createdAt.toJSDate()
    this.updatedAt = reservation.updatedAt.toJSDate()

    if (reservation.$preloaded.student) {
      this.student = new StudentMinimalDto(reservation.$preloaded.student)
    }
    if (reservation.$preloaded.canteenMeal) {
      this.canteenMeal = new CanteenMealDto(reservation.$preloaded.canteenMeal)
    }
  }
}
```

**Step 3: Atualizar controllers**

**Step 4: Commit**

```bash
git add app/models/dto/
git add app/controllers/canteen_meal_reservations/
git commit -m "feat: use DTOs for canteen meal reservations"
```

---

## Fase 2: Domínio Events (Semana 1-2)

### Task 2.1: Verificar e Atualizar Event Controllers

**Files:**

- Verify: `app/models/dto/event.dto.ts` (já existe)
- Modify: `app/controllers/events/complete_event_controller.ts`

**Note:** A maioria dos controllers de events já usa DTO. Verificar `complete_event_controller.ts`.

```typescript
// app/controllers/events/complete_event_controller.ts
// ... imports ...
import EventDto from '#models/dto/event.dto'

// ... no final:
return response.ok(new EventDto(event))
```

**Commit:**

```bash
git add app/controllers/events/
git commit -m "feat: use EventDto in complete_event_controller"
```

---

### Task 2.2: Criar DTOs para EventParticipant

**Files:**

- Create: `app/models/dto/event_participant.dto.ts`
- Create: `app/models/dto/event_participant_with_user.dto.ts`
- Modify: `app/controllers/event_participants/list_event_participants_controller.ts`
- Modify: `app/controllers/event_participants/register_participant_controller.ts`
- Modify: `app/controllers/event_participants/confirm_attendance_controller.ts`
- Modify: `app/controllers/event_participants/update_participant_status_controller.ts`

**Step 1: Criar DTO base**

```typescript
// app/models/dto/event_participant.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventParticipant from '#models/event_participant'
import type EventParticipantStatus from '#models/event_participant'

export default class EventParticipantDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare userId: string
  declare status: EventParticipantStatus
  declare registrationDate: Date
  declare attendanceConfirmedAt: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(participant?: EventParticipant) {
    super()
    if (!participant) return

    this.id = participant.id
    this.eventId = participant.eventId
    this.userId = participant.userId
    this.status = participant.status
    this.registrationDate = participant.registrationDate.toJSDate()
    this.attendanceConfirmedAt = participant.attendanceConfirmedAt
      ? participant.attendanceConfirmedAt.toJSDate()
      : null
    this.notes = participant.notes
    this.createdAt = participant.createdAt.toJSDate()
    this.updatedAt = participant.updatedAt.toJSDate()
  }
}
```

**Step 2: Criar DTO com usuário**

```typescript
// app/models/dto/event_participant_with_user.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type EventParticipant from '#models/event_participant'
import EventParticipantDto from '#models/dto/event_participant.dto'
import UserMinimalDto from '#models/dto/user_minimal.dto'

export default class EventParticipantWithUserDto extends BaseModelDto {
  declare id: string
  declare eventId: string
  declare userId: string
  declare status: string
  declare registrationDate: Date
  declare attendanceConfirmedAt: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare user?: UserMinimalDto

  constructor(participant?: EventParticipant) {
    super()
    if (!participant) return

    this.id = participant.id
    this.eventId = participant.eventId
    this.userId = participant.userId
    this.status = participant.status
    this.registrationDate = participant.registrationDate.toJSDate()
    this.attendanceConfirmedAt = participant.attendanceConfirmedAt
      ? participant.attendanceConfirmedAt.toJSDate()
      : null
    this.notes = participant.notes
    this.createdAt = participant.createdAt.toJSDate()
    this.updatedAt = participant.updatedAt.toJSDate()

    if (participant.$preloaded.user) {
      this.user = new UserMinimalDto(participant.$preloaded.user)
    }
  }
}
```

**Step 3: Atualizar controllers**

**Step 4: Commit**

```bash
git add app/models/dto/
git add app/controllers/event_participants/
git commit -m "feat: add DTOs for event participants"
```

---

## Fase 3: Domínio Students (Semana 2-3)

### Task 3.1: Criar DTOs para Student

**Files:**

- Verify: `app/models/dto/student.dto.ts` (já existe)
- Create: `app/models/dto/student_with_relations.dto.ts`
- Modify: `app/controllers/students/show.ts`
- Modify: `app/controllers/students/update.ts`
- Modify: `app/controllers/students/store.ts`

**Step 1: Verificar DTO existente**

O DTO `student.dto.ts` já existe. Verificar se atende às necessidades dos controllers.

**Step 2: Criar DTO com relações se necessário**

```typescript
// app/models/dto/student_with_relations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Student from '#models/student'
import StudentDto from '#models/dto/student.dto'
import UserMinimalDto from '#models/dto/user_minimal.dto'
import SchoolMinimalDto from '#models/dto/school_minimal.dto'
import StudentHasResponsibleDto from '#models/dto/student_has_responsible.dto'

export default class StudentWithRelationsDto extends BaseModelDto {
  // Campos base do StudentDto
  declare id: string
  declare fullName: string
  declare registrationNumber: string | null
  declare birthDate: Date | null
  declare gender: string | null
  declare avatarUrl: string | null
  declare status: string
  declare userId: string | null
  declare schoolId: string
  declare createdAt: Date
  declare updatedAt: Date

  // Relações
  declare user?: UserMinimalDto
  declare school?: SchoolMinimalDto
  declare responsibles?: StudentHasResponsibleDto[]

  constructor(student?: Student) {
    super()
    if (!student) return

    // Campos base
    this.id = student.id
    this.fullName = student.fullName
    this.registrationNumber = student.registrationNumber
    this.birthDate = student.birthDate ? student.birthDate.toJSDate() : null
    this.gender = student.gender
    this.avatarUrl = student.avatarUrl
    this.status = student.status
    this.userId = student.userId
    this.schoolId = student.schoolId
    this.createdAt = student.createdAt.toJSDate()
    this.updatedAt = student.updatedAt.toJSDate()

    // Relações
    if (student.$preloaded.user) {
      this.user = new UserMinimalDto(student.$preloaded.user)
    }
    if (student.$preloaded.school) {
      this.school = new SchoolMinimalDto(student.$preloaded.school)
    }
    if (student.$preloaded.responsibles) {
      this.responsibles = (student.$preloaded.responsibles as any[]).map(
        (r) => new StudentHasResponsibleDto(r)
      )
    }
  }
}
```

**Step 3: Criar SchoolMinimalDto se necessário**

```typescript
// app/models/dto/school_minimal.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type School from '#models/school'

export default class SchoolMinimalDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string

  constructor(school?: School) {
    super()
    if (!school) return

    this.id = school.id
    this.name = school.name
    this.slug = school.slug
  }
}
```

**Step 4: Atualizar controllers de students**

```typescript
// app/controllers/students/show.ts
// ... imports ...
import StudentWithRelationsDto from '#models/dto/student_with_relations.dto'

// ... no final:
return response.ok(new StudentWithRelationsDto(student))
```

**Step 5: Commit**

```bash
git add app/models/dto/
git add app/controllers/students/
git commit -m "feat: add StudentWithRelationsDto and update student controllers"
```

---

### Task 3.2: Criar DTOs para Enrollment

**Files:**

- Create: `app/models/dto/student_has_level.dto.ts` (verificar se existe)
- Create: `app/models/dto/student_has_level_with_relations.dto.ts`
- Modify: `app/controllers/students/list_enrollments_controller.ts`
- Modify: `app/controllers/students/update_enrollment_controller.ts`
- Modify: `app/controllers/students/cancel_enrollment_controller.ts`

**Note:** `student_has_level.dto.ts` pode já existir. Verificar e estender se necessário.

**Step 1: Verificar DTO existente**

**Step 2: Atualizar controllers**

**Step 3: Commit**

---

## Fase 4: Domínio Academic (Semana 3-4)

### Task 4.1: Criar DTOs para Level

**Files:**

- Verify: `app/models/dto/level.dto.ts` (já existe)
- Create: `app/models/dto/level_with_relations.dto.ts`
- Modify: `app/controllers/levels/show_level_controller.ts`
- Modify: `app/controllers/levels/create_level_controller.ts`
- Modify: `app/controllers/levels/update_level_controller.ts`

**Step 1: Criar DTO com relações**

```typescript
// app/models/dto/level_with_relations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Level from '#models/level'
import SchoolMinimalDto from '#models/dto/school_minimal.dto'
import ClassDto from '#models/dto/class.dto'

export default class LevelWithRelationsDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare code: string | null
  declare order: number
  declare isActive: boolean
  declare schoolId: string
  declare createdAt: Date
  declare updatedAt: Date

  declare school?: SchoolMinimalDto
  declare classes?: ClassDto[]

  constructor(level?: Level) {
    super()
    if (!level) return

    this.id = level.id
    this.name = level.name
    this.code = level.code
    this.order = level.order
    this.isActive = level.isActive
    this.schoolId = level.schoolId
    this.createdAt = level.createdAt.toJSDate()
    this.updatedAt = level.updatedAt.toJSDate()

    if (level.$preloaded.school) {
      this.school = new SchoolMinimalDto(level.$preloaded.school)
    }
    if (level.$preloaded.classes) {
      this.classes = (level.$preloaded.classes as any[]).map((c) => new ClassDto(c))
    }
  }
}
```

**Step 2: Criar ClassDto se necessário**

```typescript
// app/models/dto/class.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Class from '#models/class'

export default class ClassDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare capacity: number | null
  declare isActive: boolean
  declare levelId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(classEntity?: Class) {
    super()
    if (!classEntity) return

    this.id = classEntity.id
    this.name = classEntity.name
    this.slug = classEntity.slug
    this.capacity = classEntity.capacity
    this.isActive = classEntity.isActive
    this.levelId = classEntity.levelId
    this.createdAt = classEntity.createdAt.toJSDate()
    this.updatedAt = classEntity.updatedAt.toJSDate()
  }
}
```

**Step 3: Atualizar show_level_controller.ts**

```typescript
// app/controllers/levels/show_level_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import LevelWithRelationsDto from '#models/dto/level_with_relations.dto'
import AppException from '#exceptions/app_exception'

export default class ShowLevelController {
  async handle({ params, response }: HttpContext) {
    const level = await Level.query()
      .where('id', params.id)
      .preload('school')
      .preload('classes')
      .first()

    if (!level) {
      throw AppException.notFound('Nível não encontrado')
    }

    return response.ok(new LevelWithRelationsDto(level))
  }
}
```

**Step 4: Commit**

```bash
git add app/models/dto/
git add app/controllers/levels/
git commit -m "feat: add LevelWithRelationsDto and ClassDto"
```

---

### Task 4.2: Criar DTOs para Class

**Files:**

- Verify: `app/models/dto/class.dto.ts` (criado na Task 4.1)
- Create: `app/models/dto/class_with_relations.dto.ts`
- Modify: `app/controllers/classes/show_class_controller.ts`
- Modify: `app/controllers/classes/show_class_by_slug_controller.ts`
- Modify: `app/controllers/classes/update_class_controller.ts`
- Modify: `app/controllers/classes/create_class_controller.ts`

**Step 1: Criar DTO com relações**

```typescript
// app/models/dto/class_with_relations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Class from '#models/class'
import ClassDto from '#models/dto/class.dto'
import LevelDto from '#models/dto/level.dto'
import SchoolMinimalDto from '#models/dto/school_minimal.dto'
import SubjectDto from '#models/dto/subject.dto'
import UserMinimalDto from '#models/dto/user_minimal.dto'

export default class ClassWithRelationsDto extends BaseModelDto {
  // Campos base
  declare id: string
  declare name: string
  declare slug: string
  declare capacity: number | null
  declare isActive: boolean
  declare levelId: string
  declare schoolId: string
  declare createdAt: Date
  declare updatedAt: Date

  // Relações
  declare level?: LevelDto
  declare school?: SchoolMinimalDto
  declare subjects?: SubjectDto[]
  declare teachers?: UserMinimalDto[]
  declare studentsCount?: number

  constructor(classEntity?: Class) {
    super()
    if (!classEntity) return

    this.id = classEntity.id
    this.name = classEntity.name
    this.slug = classEntity.slug
    this.capacity = classEntity.capacity
    this.isActive = classEntity.isActive
    this.levelId = classEntity.levelId
    this.schoolId = classEntity.schoolId
    this.createdAt = classEntity.createdAt.toJSDate()
    this.updatedAt = classEntity.updatedAt.toJSDate()

    if (classEntity.$preloaded.level) {
      this.level = new LevelDto(classEntity.$preloaded.level)
    }
    if (classEntity.$preloaded.school) {
      this.school = new SchoolMinimalDto(classEntity.$preloaded.school)
    }
    if (classEntity.$preloaded.subjects) {
      this.subjects = (classEntity.$preloaded.subjects as any[]).map((s) => new SubjectDto(s))
    }
    if (classEntity.$preloaded.teachers) {
      this.teachers = (classEntity.$preloaded.teachers as any[]).map((t) => new UserMinimalDto(t))
    }
    if ((classEntity as any).$extras?.studentsCount !== undefined) {
      this.studentsCount = (classEntity as any).$extras.studentsCount
    }
  }
}
```

**Step 2: Criar SubjectDto se necessário**

```typescript
// app/models/dto/subject.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Subject from '#models/subject'

export default class SubjectDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare code: string | null
  declare color: string | null
  declare isActive: boolean
  declare schoolId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(subject?: Subject) {
    super()
    if (!subject) return

    this.id = subject.id
    this.name = subject.name
    this.slug = subject.slug
    this.code = subject.code
    this.color = subject.color
    this.isActive = subject.isActive
    this.schoolId = subject.schoolId
    this.createdAt = subject.createdAt.toJSDate()
    this.updatedAt = subject.updatedAt.toJSDate()
  }
}
```

**Step 3: Atualizar controllers**

**Step 4: Commit**

```bash
git add app/models/dto/
git add app/controllers/classes/
git commit -m "feat: add ClassWithRelationsDto and SubjectDto"
```

---

### Task 4.3: Criar DTOs para Course

**Files:**

- Verify: `app/models/dto/course.dto.ts` (já existe)
- Create: `app/models/dto/course_with_relations.dto.ts`
- Modify: `app/controllers/courses/show_course_controller.ts`
- Modify: `app/controllers/courses/create_course_controller.ts`
- Modify: `app/controllers/courses/update_course_controller.ts`

**Step 1: Criar DTO com relações**

```typescript
// app/models/dto/course_with_relations.dto.ts
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Course from '#models/course'
import CourseDto from '#models/dto/course.dto'
import SchoolMinimalDto from '#models/dto/school_minimal.dto'
import ClassDto from '#models/dto/class.dto'

export default class CourseWithRelationsDto extends BaseModelDto {
  // Campos base
  declare id: string
  declare name: string
  declare slug: string
  declare description: string | null
  declare code: string | null
  declare durationMonths: number | null
  declare isActive: boolean
  declare schoolId: string
  declare createdAt: Date
  declare updatedAt: Date

  // Relações
  declare school?: SchoolMinimalDto
  declare classes?: ClassDto[]

  constructor(course?: Course) {
    super()
    if (!course) return

    this.id = course.id
    this.name = course.name
    this.slug = course.slug
    this.description = course.description
    this.code = course.code
    this.durationMonths = course.durationMonths
    this.isActive = course.isActive
    this.schoolId = course.schoolId
    this.createdAt = course.createdAt.toJSDate()
    this.updatedAt = course.updatedAt.toJSDate()

    if (course.$preloaded.school) {
      this.school = new SchoolMinimalDto(course.$preloaded.school)
    }
    if (course.$preloaded.classes) {
      this.classes = (course.$preloaded.classes as any[]).map((c) => new ClassDto(c))
    }
  }
}
```

**Step 2: Atualizar controllers**

**Step 3: Commit**

---

## Fases 5-12: Demais Domínios

As fases seguintes seguem o mesmo padrão:

### Estrutura por Domínio:

**Para cada domínio:**

1. Identificar os modelos principais
2. Criar/verificar DTOs existentes
3. Criar DTOs com relações quando necessário
4. Atualizar controllers
5. Commit

### Domínios Remanescentes:

- **Fase 5:** School Management (schools, school_chains, school_groups, school_partners)
- **Fase 6:** Users (users, user_schools, user_school_groups)
- **Fase 7:** Store/Marketplace (store_owner, store_items, store_orders, marketplace)
- **Fase 8:** Gamification (gamification_events, leaderboards, levels, student_gamifications)
- **Fase 9:** Insurance (insurance/\*)
- **Fase 10:** Assignments, Attendance, Extra Classes
- **Fase 11:** Print Requests, Purchase Requests, Posts/Comments
- **Fase 12:** Scholarships, Subscriptions, Notifications, Teachers, Occurrences

---

## Convenções Importantes

### 1. Nomenclatura

- `[Model]Dto` - DTO completo
- `[Model]MinimalDto` - Campos essenciais
- `[Model]ListDto` - Para listagens
- `[Model]With[Relation]Dto` - Com relações específicas
- `[Model]WithRelationsDto` - Com todas as relações comuns

### 2. Verificar $preloaded

```typescript
if (model.$preloaded.relation) {
  this.relation = new RelatedDto(model.$preloaded.relation)
}
```

### 3. Tratamento de Datas

```typescript
this.createdAt = model.createdAt.toJSDate()
this.dateField = model.dateField ? model.dateField.toJSDate() : null
```

### 4. Tratamento de Arrays

```typescript
this.items = (model.$preloaded.items as any[]).map((item) => new ItemDto(item))
```

### 5. Tratamento de Counts (agregações)

```typescript
if ((model as any).$extras?.count !== undefined) {
  this.count = (model as any).$extras.count
}
```

---

## Checklist por Task

Para cada controller modificado:

- [ ] Identificar o modelo retornado
- [ ] Verificar se DTO existe
- [ ] Criar/estender DTO se necessário
- [ ] Atualizar import no controller
- [ ] Substituir `response.ok(model)` por `response.ok(new Dto(model))`
- [ ] Para listas: `response.ok(models.map(m => new Dto(m)))`
- [ ] Testar endpoint
- [ ] Commit com mensagem descritiva

---

## Comandos Úteis

### Listar controllers de um domínio

```bash
ls -la app/controllers/[domain]/*
```

### Verificar se DTO existe

```bash
ls app/models/dto/ | grep [model]
```

### Buscar controllers que retornam modelo diretamente

```bash
grep -r "return response.ok([a-z]*$" app/controllers/[domain]/
```

### Ver estrutura do modelo

```bash
cat app/models/[model].ts
```

---

## Notas Finais

1. **Sempre verificar** se o DTO já existe antes de criar um novo
2. **Reutilizar DTOs** quando possível (MinimalDto, ListDto)
3. **Manter consistência** com DTOs existentes no projeto
4. **Testar** cada endpoint após modificação
5. **Fazer commits frequentes** e atômicos
6. **Documentar** DTOs complexos com JSDoc quando necessário

---

**Plan saved to:** `docs/plans/2025-02-25-dto-standardization-implementation-plan.md`

**Next step:** Execute this plan using `superpowers:executing-plans` skill.
