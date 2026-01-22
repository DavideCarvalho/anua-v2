# Design: Sidebar Dinâmica com Cursos e Turmas

**Data:** 2026-01-22
**Status:** Aprovado

## Objetivo

Migrar a funcionalidade de sidebar dinâmica do projeto `school-super-app` para o `anua-v2`. A sidebar exibirá cursos e turmas dos períodos letivos ativos, permitindo navegação rápida para as páginas de gestão de turmas.

## Decisões de Design

1. **Visibilidade:** Sidebar aparece em TODAS as páginas `/escola/*`
2. **Filtro de Períodos:** Mostrar períodos onde `isActive = true` E `startDate <= hoje`
3. **Estrutura:** Agrupado por período letivo, expandido por padrão
4. **Hierarquia:** Período → Curso → (Visão Geral, Turmas, turmas individuais)

---

## Backend

### Endpoint

**Rota:** `GET /api/v1/escola/sidebar/classes`

**Controller:** `app/controllers/classes/get_classes_for_sidebar_controller.ts`

**Query:**
- Busca turmas dos períodos ativos do usuário
- Filtros:
  - `AcademicPeriod.isActive = true`
  - `AcademicPeriod.startDate <= hoje`
  - Escola do usuário (via `UserHasSchool`)

**Retorno por turma:**
```typescript
{
  id: string
  name: string
  slug: string
  course: { id: string, name: string, slug: string }
  academicPeriod: { id: string, name: string, slug: string }
}
```

### DTO

**Arquivo:** `app/dtos/sidebar_class_dto.ts`

```typescript
interface SidebarClassData {
  id: string
  name: string
  slug: string
  course: { id: string; name: string; slug: string }
  academicPeriod: { id: string; name: string; slug: string }
}

export class SidebarClassDto extends BaseDto {
  declare id: string
  declare name: string
  declare slug: string
  declare course: { id: string; name: string; slug: string }
  declare academicPeriod: { id: string; name: string; slug: string }
}

export class SidebarClassListDto extends BaseDto {
  declare data: SidebarClassDto[]
}
```

---

## Frontend

### Hook: `useSidebarClasses`

**Arquivo:** `inertia/hooks/use-sidebar-classes.ts`

Busca as turmas do endpoint e agrupa em estrutura hierárquica:

```typescript
interface SidebarData {
  [academicPeriodSlug: string]: {
    period: { id: string; name: string; slug: string }
    courses: {
      [courseSlug: string]: {
        course: { id: string; name: string; slug: string }
        classes: Array<{ id: string; name: string; slug: string }>
      }
    }
  }
}
```

### Componente: `SidebarAcademicPeriods`

**Arquivo:** `inertia/components/sidebar/sidebar-academic-periods.tsx`

Estrutura visual:
```
▼ Período Letivo 2025
  ▼ Ensino Fundamental
    • Visão Geral
    • Turmas
    ────────────
    • 6º Ano A
    • 6º Ano B
    • 7º Ano A
  ▼ Ensino Médio
    • Visão Geral
    • Turmas
    ────────────
    • 1º Ano A
    • 2º Ano A
```

### Integração no `EscolaLayout`

O componente `SidebarAcademicPeriods` será adicionado no sidebar existente (`inertia/components/layouts/escola-layout.tsx`), abaixo da navegação principal, separado por um divisor.

---

## Rotas

### Estrutura de URLs

```
/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/visao-geral
/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas
/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/atividades
/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/provas
/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/presencas
/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/notas
/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/situacao
```

### Rotas no AdonisJS

```typescript
// start/routes.ts
router.group(() => {
  router.get('visao-geral', [CourseOverviewController])
  router.get('turmas', [CourseClassesController])

  router.group(() => {
    router.get('atividades', [ClassActivitiesController])
    router.get('provas', [ClassExamsController])
    router.get('presencas', [ClassAttendanceController])
    router.get('notas', [ClassGradesController])
    router.get('situacao', [ClassStatusController])
  }).prefix(':turmaSlug')
}).prefix('escola/periodos-letivos/:slug/cursos/:cursoSlug/turmas')
```

---

## Páginas

### Arquivos a Criar

| Página | Arquivo |
|--------|---------|
| Visão Geral do Curso | `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/visao-geral.tsx` |
| Lista de Turmas | `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/index.tsx` |
| Turma - Atividades | `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/atividades.tsx` |
| Turma - Provas | `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/provas.tsx` |
| Turma - Presenças | `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/presencas.tsx` |
| Turma - Notas | `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/notas.tsx` |
| Turma - Situação | `inertia/pages/escola/periodos-letivos/[slug]/cursos/[cursoSlug]/turmas/[turmaSlug]/situacao.tsx` |

### Layout da Turma

As páginas de turma individual usarão um layout compartilhado `TurmaLayout` com tabs:

```
┌─────────────────────────────────────────────────────┐
│ 6º Ano A - Ensino Fundamental                       │
├───────────┬────────┬───────────┬────────┬──────────┤
│ Atividades│ Provas │ Presenças │ Notas  │ Situação │
└───────────┴────────┴───────────┴────────┴──────────┘
```

**Arquivo:** `inertia/components/layouts/turma-layout.tsx`

---

## Referência

Baseado na implementação do `school-super-app`:
- Hook: `apps/anua/src/app/escola/hooks/useSideBarRoutes.tsx` (linhas 494-576)
- Endpoint: `packages/api/src/router/class/endpoints/get-classes-for-sidebar.ts`

---

## Ordem de Implementação

1. Backend: DTO e Controller para `/api/v1/escola/sidebar/classes`
2. Frontend: Hook `useSidebarClasses`
3. Frontend: Componente `SidebarAcademicPeriods`
4. Integração no `EscolaLayout`
5. Rotas no AdonisJS
6. Layout `TurmaLayout` com tabs
7. Páginas de curso (visão-geral, turmas)
8. Páginas de turma (atividades, provas, presenças, notas, situação)
