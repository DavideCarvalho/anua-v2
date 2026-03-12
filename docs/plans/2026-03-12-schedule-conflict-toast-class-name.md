# Schedule Conflict Toast with Class Name Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Exibir no toast de conflito de horário o nome exato da turma em que o professor já está ocupado, em vez da mensagem genérica.

**Architecture:** O backend já executa a query que retorna os `classId`s conflitantes, mas descarta essa informação. A mudança é: (1) incluir o `name` da turma (`Class."name"`) no SELECT da query de conflito, (2) usar esse nome para montar a mensagem `reason` dinâmica no controller. Nenhuma alteração no transformer ou frontend é necessária.

**Tech Stack:** AdonisJS (Lucid raw queries), TypeScript

---

### Task 1: Modificar a query SQL para retornar o nome da turma conflitante

**Files:**

- Modify: `app/controllers/schedules/validate_teacher_schedule_conflict_controller.ts:131-154`

**Step 1: Atualizar o type da raw query para incluir `className`**

No método `isTeacherOccupiedInOtherClass`, a segunda query (linhas 131–154) atualmente seleciona só `c."classId"`. Alterar para também selecionar `cl."name" AS "className"`, fazendo JOIN com a tabela `Class`.

Novo tipo de retorno da query:

```typescript
rows: Array<{
  classId: string
  className: string
}>
```

**Step 2: Alterar o SELECT e JOIN na query SQL**

Substituir o bloco da segunda query (linhas 131–154):

```typescript
const conflictingSlots = await db.rawQuery<{
  rows: Array<{
    classId: string
    className: string
  }>
}>(
  `
  SELECT c."classId", cl."name" AS "className"
  FROM "CalendarSlot" cs
  JOIN "Calendar" c ON cs."calendarId" = c.id
  JOIN "Class" cl ON c."classId" = cl.id
  JOIN "TeacherHasClass" thc ON cs."teacherHasClassId" = thc.id
  WHERE c."academicPeriodId" = :academicPeriodId
    AND c."isActive" = true
    AND c."isCanceled" = false
    AND c."classId" != :excludeClassId
    AND thc."teacherId" = :teacherId
    AND cs."isBreak" = false
    AND (
      (cs."startTime" >= :startTime AND cs."startTime" < :endTime) OR
      (cs."endTime" > :startTime AND cs."endTime" <= :endTime) OR
      (cs."startTime" <= :startTime AND cs."endTime" >= :endTime)
    )
  LIMIT 1
  `,
  { academicPeriodId, teacherId, startTime, endTime, excludeClassId }
)
```

Note o `LIMIT 1` adicionado — só precisamos do primeiro conflito.

**Step 3: Alterar o retorno para incluir o nome da turma**

O método `isTeacherOccupiedInOtherClass` atualmente retorna `Promise<boolean>`. Alterar para retornar `Promise<{ occupied: boolean; className?: string }>`:

```typescript
private async isTeacherOccupiedInOtherClass(
  teacherId: string,
  startTime: string,
  endTime: string,
  academicPeriodId: string,
  excludeClassId: string
): Promise<{ occupied: boolean; className?: string }> {
  // primeira query sem excludeClassId permanece igual, retorna { occupied: true } sem nome
  const result = await db.rawQuery<{
    rows: Array<{ classWeekDay: number; startTime: string; endTime: string }>
  }>(/* ... sql original ... */, { academicPeriodId, teacherId, startTime, endTime })

  if (!excludeClassId) {
    return { occupied: result.rows.length > 0 }
  }

  // segunda query com excludeClassId agora retorna className
  const conflictingSlots = await db.rawQuery<{
    rows: Array<{ classId: string; className: string }>
  }>(/* ... sql com JOIN Class e LIMIT 1 ... */, { academicPeriodId, teacherId, startTime, endTime, excludeClassId })

  return {
    occupied: conflictingSlots.rows.length > 0,
    className: conflictingSlots.rows[0]?.className,
  }
}
```

**Step 4: Atualizar o call site no método `handle` para usar o novo retorno**

Substituir (linhas 54–71):

```typescript
const conflictResult = await this.isTeacherOccupiedInOtherClass(
  teacherId,
  startTime,
  endTime,
  academicPeriodId,
  classId || ''
)

if (conflictResult.occupied) {
  const className = conflictResult.className
  const reason = className
    ? `O professor já está ocupado na turma ${className} neste horário`
    : 'O professor já está ocupado em outra turma neste horário'

  return serialize(
    ScheduleConflictValidationTransformer.transform({
      hasConflict: true,
      reason,
      teacherName: teacherHasClass.teacher.user?.name || 'Professor',
    })
  )
}
```

**Step 5: Verificar manualmente no browser**

- Acessar `/escola/pedagogico/horarios`
- Tentar arrastar um professor que já está alocado em outra turma no mesmo horário
- Confirmar que o toast mostra: `"O professor já está ocupado na turma [Nome da Turma] neste horário"`
- Se o nome da turma não estiver disponível (caso edge da primeira query sem excludeClassId), confirmar que cai no fallback genérico

**Step 6: Commit**

```bash
git add app/controllers/schedules/validate_teacher_schedule_conflict_controller.ts
git commit -m "feat: show conflicting class name in teacher schedule conflict toast"
```
