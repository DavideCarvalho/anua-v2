# Página de Notas Agrupadas por Matéria

## Resumo

Migração da página de notas do school-super-app para anua-v2, com notas agrupadas por matéria usando accordion.

## Arquitetura

### Backend

**Controller:** `app/controllers/grades/get_class_grades_by_subject_controller.ts`
- Recebe `classId` e `subjectId` como parâmetros
- Busca o algoritmo de cálculo da escola (AVERAGE ou SUM)
- Retorna lista de alunos com:
  - Nota final calculada
  - Quantidade de atividades avaliadas
  - Notas individuais de cada atividade

**Rota:** `GET /api/v1/grades/class/:classId/subject/:subjectId`

### Frontend

**Componentes:**

1. `GradesAccordion` - Container principal
   - Busca matérias da turma
   - Renderiza accordion com uma seção por matéria
   - Lazy load: notas são carregadas ao expandir

2. `SubjectGradesTable` - Tabela de notas
   - Mostra alunos com nota final, status (aprovado/reprovado), atividades avaliadas
   - Linhas expandíveis para ver notas individuais
   - Aprovação baseada em 60% da nota máxima

## Fluxo de Dados

1. Página carrega com `classId` do controller
2. `GradesAccordion` busca matérias da turma via `/api/v1/classes/:id`
3. Ao expandir uma matéria, `SubjectGradesTable` busca notas via API
4. Cálculo de nota final respeita algoritmo da escola

## Arquivos Criados/Modificados

- `app/controllers/grades/get_class_grades_by_subject_controller.ts` (novo)
- `app/controllers/pages/escola/show_turma_notas_page_controller.ts` (atualizado)
- `inertia/containers/turma/grades-accordion.tsx` (novo)
- `inertia/containers/turma/subject-grades-table.tsx` (novo)
- `inertia/pages/escola/.../notas.tsx` (atualizado)
- `start/routes.ts` (nova rota)
