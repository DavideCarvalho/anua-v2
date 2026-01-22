# Migração: Páginas de Períodos Letivos

Data: 2026-01-21

## Objetivo

Migrar as páginas de detalhes e edição de períodos letivos do app Next.js antigo (`school-super-app`) para o novo app AdonisJS + Inertia (`anua-v2`).

## Decisões de Design

1. **Página de detalhes**: Visão geral do período (nome, datas, segmento) + lista de cursos com seus níveis, sem sub-rotas
2. **Página de edição**: Formulário multi-step completo (calendário + cursos/níveis)
3. **Data fetching**: Client-side com React Query (não server-side via Inertia props)
4. **API**: Endpoint único com `?include=courses` para carregar dados relacionados

## Endpoints de API

### Novos endpoints a criar

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/academic-periods/by-slug/:slug` | Busca período pelo slug, suporta `?include=courses` |
| GET | `/api/v1/academic-periods/:id/courses` | Lista cursos e níveis do período |
| PUT | `/api/v1/academic-periods/:id/courses` | Atualiza cursos e níveis do período |

### Endpoints existentes

| Método | Rota | Alteração |
|--------|------|-----------|
| GET | `/api/v1/academic-periods/:id` | Adicionar suporte a `?include=courses` |
| PUT | `/api/v1/academic-periods/:id` | Já existe, sem alterações |

## Estrutura de Arquivos

### Frontend (inertia/)

```
pages/escola/
├── periodos-letivos/
│   └── detalhes.tsx                    # Página de detalhes (atualizar)
└── administrativo/periodos-letivos/
    └── editar.tsx                      # Página de edição (atualizar)

containers/academic-periods/
├── periodo-letivo-header.tsx           # Header com nome, status, ações
├── periodo-letivo-info-card.tsx        # Card com datas e segmento
├── cursos-do-periodo-list.tsx          # Lista de cursos do período
├── edit-academic-period-form/
│   ├── index.tsx                       # Form principal com stepper
│   ├── calendar-form.tsx               # Step 1: dados do calendário
│   ├── courses-form.tsx                # Step 2: cursos e níveis
│   ├── course-levels.tsx               # Níveis com drag-and-drop
│   └── stepper.tsx                     # Indicador visual de passos
└── schemas/
    └── edit-academic-period.schema.ts  # Schema Zod para validação

hooks/queries/
├── use-academic-period-by-slug.ts      # Query hook para buscar por slug
└── use-academic-period-courses.ts      # Query hook para cursos do período
```

### Backend (app/)

```
controllers/academic_periods/
├── show_academic_period_by_slug_controller.ts  # GET by slug
├── list_academic_period_courses_controller.ts  # GET courses
└── update_academic_period_courses_controller.ts # PUT courses
```

## Estrutura de Dados

### Resposta do endpoint GET by-slug com include=courses

```typescript
interface AcademicPeriodWithCourses {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  enrollmentStartDate: string | null
  enrollmentEndDate: string | null
  isActive: boolean
  isClosed: boolean
  segment: 'KINDERGARTEN' | 'ELEMENTARY' | 'HIGHSCHOOL' | 'TECHNICAL' | 'UNIVERSITY' | 'OTHER'
  courses: Array<{
    id: string
    courseId: string
    name: string
    levels: Array<{
      id: string
      levelId: string
      name: string
      order: number
      contractId: string | null
    }>
  }>
}
```

### Schema do formulário de edição

```typescript
const editAcademicPeriodSchema = z.object({
  calendar: z.object({
    name: z.string().min(1),
    segment: z.enum(['KINDERGARTEN', 'ELEMENTARY', 'HIGHSCHOOL', 'TECHNICAL', 'UNIVERSITY', 'OTHER']),
    startDate: z.date(),
    endDate: z.date(),
    enrollmentStartDate: z.date().nullable().optional(),
    enrollmentEndDate: z.date().nullable().optional(),
  }),
  courses: z.array(z.object({
    id: z.string().optional(),
    courseId: z.string(),
    name: z.string(),
    levels: z.array(z.object({
      id: z.string().optional(),
      levelId: z.string(),
      name: z.string(),
      order: z.number(),
      contractId: z.string().nullable().optional(),
    })),
  })),
})
```

## Dependências

### Já existentes
- React Hook Form
- Zod
- React Query (@tanstack/react-query)
- shadcn/ui components
- date-fns

### A instalar
- @dnd-kit/core
- @dnd-kit/sortable

## Fora do Escopo (v1)

- Gestão de feriados e dias letivos especiais
- Gestão de turmas dentro dos níveis
- Promoção automática de alunos do período anterior
- Criação de contratos inline

## Ordem de Implementação

1. Criar endpoints de API (backend)
2. Criar hooks de React Query (frontend)
3. Implementar página de detalhes
4. Implementar formulário de edição (step 1 - calendário)
5. Implementar formulário de edição (step 2 - cursos/níveis)
6. Testar fluxo completo
