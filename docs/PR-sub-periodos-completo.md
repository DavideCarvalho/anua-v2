# Sub-Periodos: Bimestres, Trimestres, Semestres e Anual

## Resumo

Implementação completa do sistema de sub-períodos (bimestres, trimestres, semestres, anual) para períodos letivos, incluindo configuração por período (substituindo/configurando fallback da escola), geração automática, reassociação de atividades/provas, filtros nas páginas de turma e diff dialog para substituição segura.

## O que foi feito

### 1. Estrutura de Sub-Períodos por Período Letivo

- Migração `1781000007000`: adiciona `periodStructure` e `recoveryGradeMethod` na tabela `AcademicPeriod`
- Model `AcademicPeriod` expandido com campos próprios de estrutura (fallback pra config da escola)
- **Prioridade**: período > escola. Se o período define `periodStructure`, usa esse. Se não, usa o da escola.
- Gerador (`generate_controller.ts`) aceita `periodStructure` como override no request

### 2. Anual (1 Período)

- Migração `1781000009000`: adiciona `ANUAL` no enum `PeriodStructure` e no check constraint do `AcademicPeriod`
- Model `School`: type `PeriodStructure` inclui `'ANUAL'`
- Validators (`school.ts`, `academic_period.ts`): aceitam `'ANUAL'`
- Gerador: `PERIOD_NAMES` e `PERIOD_COUNT` incluem `ANUAL`
- Frontend: opção "Anual (1 período)" nos radio cards

### 3. Férias de Meio de Ano

- Migração `1781000008000`: adiciona `breakStartDate` e `breakEndDate` na `AcademicPeriod`
- Model, DTO, Validators, Transformers atualizados
- Date pickers no step de calendário (criação e edição)

### 4. Melhorias no DatePicker

- Substituído componente customizado por `react-imask` com máscara `dd/MM/yyyy`
- `autofix: 'pad'` para auto-completar dia/mês com zero à esquerda
- `overwrite: true` para substituir em vez de inserir
- Validação de ranges (fromDate/toDate)
- Blur: se inválido ou incompleto, reseta pro último valor válido

### 5. UI/UX dos Steps (Editar Período Letivo)

- Steps reordenados: `Calendário → Sub-Períodos → Séries`
- Estrutura de períodos e método de recuperação movidos pro step de Sub-Períodos
- Radio cards com descrição (em vez de select simples)
- Accordion removido — tudo num card único
- **Diff Dialog**: ao regenerar com mismatch, mostra "Serão Excluídos (N)" vs "Serão Criados (N)" em colunas lado a lado
- **Overwrite**: soft-delete dos antigos + criação dos novos + reassociação de atividades/provas por data
- **Salvar bloqueado**: se mismatch, toast de erro e não salva (botão sempre clicável)

### 6. UI/UX do Step de Novo Período Letivo

- Adicionado step de Sub-Períodos (com radio cards de estrutura)
- Campos de férias de meio de ano no step de calendário
- DatePicker substituído pelo novo componente com máscara

### 7. Configurações da Escola

- Corrigido `invalidateQueries` — usava key genérica `['school', schoolId]` que nunca batia com a key do Tuyau. Agora usa `api.api.v1.schools.show.pathKey()`
- Adicionado `'ANUAL'` nas opções de estrutura
- Labels com acentos corrigidos

### 8. Filtro de Sub-Período nas Páginas de Turma

Criado componente `SubPeriodFilter` reutilizável (abas "Todas" + cada sub-período).

| Página         | Status | Mecanismo                                                                      |
| -------------- | ------ | ------------------------------------------------------------------------------ |
| **Atividades** | ✅     | Filtra por `subPeriodId` no `list_assignments_controller`                      |
| **Provas**     | ✅     | Filtra por `subPeriodId` no `list_exams_controller`                            |
| **Presenças**  | ✅     | JOIN com `Attendance` + filtro por data range                                  |
| **Notas**      | ✅     | Já tinha nativo (via `subject-grades-table.tsx`)                               |
| **Situação**   | ✅     | Filtra assignments, exams e attendance por sub-period ANTES de calcular status |

### 9. Substituição com Merge de Atividades/Provas

No `generate_controller.ts`:

- `overwrite=true`: soft-deleta sub-períodos antigos, cria novos
- Reassocia TODAS as atividades (`Assignment`) e provas (`Exam`) do período letivo para os novos sub-períodos baseado na data (`dueDate` / `examDate`)
- Se não for overwrite: reassocia apenas itens com `subPeriodId = null`

### 10. Corrigido Bugs

- **Validator school.ts**: `logoUrl` com `.url()` rejeitava caminho relativo (`/uploads/...`)
- **Controller update_school.ts**: `periodStructure` e `recoveryGradeMethod` não estavam no `merge()`
- **Controller show_school.ts**: `periodStructure` e `recoveryGradeMethod` não eram serializados
- **Transformer school_transformer.ts**: faltavam `periodStructure` e `recoveryGradeMethod` no `pick()`
- **Acentos**: corrigidos em todas as telas (`Sub-Períodos`, `Método de Recuperação`, etc.)

## Arquivos Alterados

### Backend (23 arquivos)

| Arquivo                                              | Mudança                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `database/migrations/1781000007000_*.ts`             | Add `periodStructure` + `recoveryGradeMethod` na AcademicPeriod                   |
| `database/migrations/1781000008000_*.ts`             | Add `breakStartDate` + `breakEndDate` na AcademicPeriod                           |
| `database/migrations/1781000009000_*.ts`             | Add `ANUAL` ao enum PeriodStructure                                               |
| `app/models/school.ts`                               | Type `PeriodStructure` inclui `'ANUAL'`                                           |
| `app/models/academic_period.ts`                      | Campos `periodStructure`, `recoveryGradeMethod`, `breakStartDate`, `breakEndDate` |
| `app/models/dto/academic_period.dto.ts`              | Campos no DTO                                                                     |
| `app/validators/school.ts`                           | `periodStructure` aceita `'ANUAL'`                                                |
| `app/validators/academic_period.ts`                  | `periodStructure` e `recoveryGradeMethod` aceitam `'ANUAL'`                       |
| `app/validators/academic_sub_period.ts`              | `periodStructure` no generate; removido `preview`                                 |
| `app/validators/attendance.ts`                       | `subPeriodId` no `getClassStudentsAttendanceValidator`                            |
| `app/validators/student_status.ts`                   | `subPeriodId` no `getStudentStatusValidator`                                      |
| `app/controllers/schools/update.ts`                  | `periodStructure` e `recoveryGradeMethod` no merge                                |
| `app/controllers/schools/show.ts`                    | `periodStructure` e `recoveryGradeMethod` na resposta                             |
| `app/controllers/academic_periods/create_*.ts`       | Salva `periodStructure`, `recoveryGradeMethod`, `breakStartDate`, `breakEndDate`  |
| `app/controllers/academic_periods/update_*.ts`       | Merge dos campos                                                                  |
| `app/controllers/academic_sub_periods/generate_*.ts` | Overwrite + reassign + `periodStructure` override                                 |
| `app/controllers/assignments/list_assignments_*.ts`  | Filtro `subPeriodId`                                                              |
| `app/controllers/exams/list_exams_*.ts`              | Filtro `subPeriodId`                                                              |
| `app/controllers/attendance/get_class_students_*.ts` | Filtro por data range via JOIN                                                    |
| `app/controllers/students/get_student_status_*.ts`   | Filtra assignments/exams/attendance por subPeriodId                               |
| `app/transformers/school_transformer.ts`             | `periodStructure` e `recoveryGradeMethod` no pick                                 |
| `app/transformers/assignment_transformer.ts`         | `subPeriodId` no pick                                                             |
| `app/transformers/exam_transformer.ts`               | `subPeriodId` no pick                                                             |

### Frontend (~30 arquivos)

| Arquivo                                                                              | Mudança                                                      |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `inertia/components/ui/date-picker.tsx`                                              | Rewrite com `react-imask`                                    |
| `inertia/containers/academic-periods/schemas/edit_academic_period.schema.ts`         | `ANUAL`, descrições nos options                              |
| `inertia/containers/academic-periods/edit-academic-period-form/index.tsx`            | Steps reordenados, save com validação                        |
| `inertia/containers/academic-periods/edit-academic-period-form/calendar-form.tsx`    | Remove estrutura (vai pro step 2), add férias                |
| `inertia/containers/academic-periods/edit-academic-period-form/sub-periods-form.tsx` | Radio cards, diff dialog, overwrite, estrutura no mesmo card |
| `inertia/containers/academic-periods/components/calendar-form.tsx`                   | DatePicker + férias                                          |
| `inertia/containers/academic-periods/components/sub-periods-config-form.tsx`         | Radio cards para novo período                                |
| `inertia/containers/academic-periods/components/sub-period-filter.tsx`               | **Novo**: componente de filtro por sub-período               |
| `inertia/containers/academic-periods/new-academic-period-form.tsx`                   | Step de sub-períodos + férias                                |
| `inertia/containers/turma/assignments-table.tsx`                                     | Filtro `subPeriodId`                                         |
| `inertia/containers/academico/exams-list.tsx`                                        | Filtro `subPeriodId`                                         |
| `inertia/containers/turma/attendances-table.tsx`                                     | Aceita `subPeriodId`                                         |
| `inertia/containers/turma/student-status-table.tsx`                                  | Aceita `subPeriodId`                                         |
| `inertia/pages/escola/.../atividades.tsx`                                            | SubPeriodFilter + subPeriodId state                          |
| `inertia/pages/escola/.../provas.tsx`                                                | SubPeriodFilter + subPeriodId state                          |
| `inertia/pages/escola/.../presencas.tsx`                                             | SubPeriodFilter + subPeriodId state                          |
| `inertia/pages/escola/.../notas.tsx`                                                 | Rewrite: select de matéria em vez de accordion               |
| `inertia/pages/escola/.../situacao.tsx`                                              | SubPeriodFilter + subPeriodId state                          |
| `inertia/containers/settings/school-settings-form.tsx`                               | `invalidateQueries` corrigido, `ANUAL`, acentos              |

## O que falta fazer

### Dashboard (`/escola`)

Os cards do dashboard (Risco de Reprovação, Média Geral, etc.) não são filtrados por sub-período. Precisam de um seletor de sub-período e recalcular métricas baseado no período selecionado.

### Presenças no Dashboard

A tendência de frequência no dashboard não considera sub-períodos.

### Página de Notas na Turma

O `SubjectGradesTable` já tem abas de sub-período. Mas a nota máxima (`maxPossibleGrade`) dentro de cada aba precisa ser validada — atualmente mostra valores consistentes.

### Testes Automatizados

Adicionar testes para os novos endpoints e fluxos:

- Geração de sub-períodos com overwrite
- Filtros por `subPeriodId` nos controllers
- Integridade dos dados após reassociação

## Como testar

1. Acessar `http://localhost:3333/escola/periodos-letivos`
2. Clicar "Ver Detalhes" no período → "Editar" → Step "Sub-Períodos"
3. Selecionar estrutura (Bimestral/Trimestral/Semestral/Anual)
4. Clicar "Gerar" ou "Regenerar" (se já existirem)
5. Ver diff dialog, confirmar substituição
6. Ir em qualquer página de turma (`/atividades`, `/provas`, `/presencas`, `/notas`, `/situacao`)
7. Clicar nas abas de sub-período para filtrar
