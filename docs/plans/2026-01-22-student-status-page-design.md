# Design: Página de Situação dos Alunos

**Data:** 2026-01-22
**Migração de:** school-super-app

## Objetivo

Mostrar o status acadêmico de cada aluno da turma em uma matéria específica, permitindo identificar rapidamente alunos em risco.

## Funcionalidades

- Seletor de matéria (filtrado por papel do usuário)
- Contadores: total de alunos e quantidade em risco
- Toggle "Mostrar apenas alunos em risco"
- Tabela com linhas expansíveis para ver atividades pendentes

## Dados por Aluno

| Campo | Descrição |
|-------|-----------|
| Nome | Nome do estudante |
| Status | APPROVED, AT_RISK_GRADE, AT_RISK_ATTENDANCE, FAILED, IN_PROGRESS |
| Nota Final | Nota atual / máximo possível |
| Pontos p/ Passar | Diferença até a média mínima |
| Presença | Percentual de frequência |
| Aulas até Reprovar | Margem de faltas restante |
| Atividades Pendentes | Contador + lista expansível |

## Arquitetura

### Backend (Adonis)

```
app/controllers/students/
  └── get_student_status_controller.ts

app/controllers/pages/escola/
  └── show_turma_situacao_page_controller.ts
```

### Frontend (React)

```
inertia/
  containers/turma/
    └── student-status-table.tsx
    └── use-student-status-columns.tsx
  hooks/queries/
    └── use-student-status.ts
  pages/.../turmas/[turmaSlug]/
    └── situacao.tsx
```

## Endpoint

`GET /api/v1/classes/:classId/student-status?subjectId=xxx`

```typescript
{
  id: string
  name: string
  status: 'APPROVED' | 'AT_RISK_GRADE' | 'AT_RISK_ATTENDANCE' | 'FAILED' | 'IN_PROGRESS'
  finalGrade: number
  maxPossibleGrade: number
  attendancePercentage: number
  pointsUntilPass: number | null
  classesUntilFail: number | null
  missedAssignments: { id: string, name: string, dueDate: string }[]
}
```

## Lógica de Status

- `IN_PROGRESS` - sem atividades e sem aulas registradas
- `FAILED` - nota < mínima OU presença < mínima
- `AT_RISK_ATTENDANCE` - até 5 faltas da reprovação
- `AT_RISK_GRADE` - até 20% do máximo possível para passar
- `APPROVED` - todos os critérios atendidos

## Configurações do Banco

- `School.minimumGrade` (default: 6)
- `School.minimumAttendancePercentage` (default: 75)
- `School.calculationAlgorithm` (SUM | AVERAGE)
- `AcademicPeriod.minimumGradeOverride`
- `AcademicPeriod.minimumAttendanceOverride`

## Permissões

Seletor de matérias filtrado por papel:
- SCHOOL_DIRECTOR, SCHOOL_COORDINATOR, ADMIN, SUPER_ADMIN: vê todas as matérias
- SCHOOL_TEACHER: vê apenas matérias que leciona
