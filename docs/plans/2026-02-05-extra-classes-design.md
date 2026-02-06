# Aulas Avulsas (Extra Classes)

Aulas extracurriculares (capoeira, karatê, balé, etc.) oferecidas pela própria escola, com horário fixo semanal, turma com limite de vagas, controle de frequência, cobrança via contrato existente e valor incluído na fatura mensal do aluno.

---

## Modelo de Dados

### Nova tabela: `extra_classes`

```
id                    uuid v7 PK
name                  string          "Capoeira", "Balé", "Karatê"
slug                  string          "capoeira"
description           text, nullable  Descrição opcional
school_id             FK → schools
academic_period_id    FK → academic_periods
contract_id           FK → contracts  Define o valor/cobrança
teacher_id            FK → teachers   Professor responsável
max_students          integer, null   Limite de vagas (null = ilimitado)
is_active             boolean         default true
created_at            timestamp
updated_at            timestamp
```

Cada `extra_class` vive dentro de um `AcademicPeriod` e tem um `Contract` que define o valor. O contrato reaproveita toda a mecânica existente (valor, parcelas, tipo de pagamento).

### Nova tabela: `extra_class_schedules`

```
id                    uuid v7 PK
extra_class_id        FK → extra_classes
week_day              integer         0=domingo, 1=segunda ... 6=sábado (mesmo padrão do CalendarSlot)
start_time            string          "14:00"
end_time              string          "15:00"
created_at            timestamp
updated_at            timestamp
```

Uma `extra_class` pode ter múltiplos horários (ex: capoeira terça e quinta).

### Nova tabela: `student_has_extra_class`

```
id                    uuid v7 PK
student_id            FK → students
extra_class_id        FK → extra_classes
contract_id           FK → contracts       Herda do extra_class, pode ser overridden
scholarship_id        FK → scholarships, null
payment_method        enum                 BOLETO | CREDIT_CARD | PIX
payment_day           integer              Dia do vencimento
enrolled_at           datetime             Data de inscrição
cancelled_at          datetime, null       Soft cancel (null = ativo)
created_at            timestamp
updated_at            timestamp
```

Mesma lógica do `StudentHasLevel`: vincula aluno à aula avulsa com suas condições de pagamento.

### Nova tabela: `extra_class_attendances`

```
id                    uuid v7 PK
extra_class_id        FK → extra_classes
extra_class_schedule_id FK → extra_class_schedules   Qual horário (ex: terça 14h)
date                  datetime                        Data da aula
note                  string, nullable                Observação opcional
created_at            timestamp
updated_at            timestamp
```

Representa uma aula que aconteceu (ou vai acontecer) num dia específico. Vinculada ao horário da grade (schedule) pra saber qual dia da semana/hora foi.

### Nova tabela: `student_has_extra_class_attendance`

```
id                    uuid v7 PK
student_id            FK → students
extra_class_attendance_id FK → extra_class_attendances
status                enum            PRESENT | ABSENT | LATE | EXCUSED
justification         string, null    Motivo da falta/atraso
created_at            timestamp
updated_at            timestamp
```

Mesma estrutura do `StudentHasAttendance` das aulas regulares, mas desacoplada.

### Alteração em `student_payments`

- Adicionar `EXTRA_CLASS` ao enum `type`
- Adicionar coluna `student_has_extra_class_id` (FK → student_has_extra_class, nullable)

Isso permite que o `GenerateInvoices` agrupe os pagamentos de aula avulsa na mesma fatura do aluno.

---

## Fluxo de Cobrança

```
ExtraClass (contract_id define o valor)
    ↓
StudentHasExtraClass (inscrição do aluno)
    ↓
StudentPayment (type='EXTRA_CLASS', student_has_extra_class_id)
    ↓
Invoice (agrupado com mensalidade, cantina, loja — mesmo student:contract:mês)
```

### Geração de pagamentos

Quando o aluno é inscrito numa aula avulsa:

1. Calcular os meses restantes no `AcademicPeriod` (de `enrolled_at` até `endDate`)
2. Criar `StudentPayment` com `type='EXTRA_CLASS'` para cada mês
3. Aplicar bolsa (`scholarship_id`) se houver
4. O `GenerateInvoices` já agrupa por `student:contract:mês`, então os pagamentos de aula avulsa entram automaticamente na fatura

### Cancelamento

Quando `cancelled_at` é preenchido:

1. Cancelar (`status='CANCELLED'`) todos os `StudentPayment` futuros não pagos vinculados a esse `student_has_extra_class_id`
2. Reconciliar as invoices afetadas (recalcular `totalAmount`)

---

## Fluxo de Frequência

```
Professor abre a aula avulsa
    ↓
Seleciona data da aula → cria ExtraClassAttendance (vinculada ao ExtraClassSchedule do dia)
    ↓
Lista de alunos inscritos aparece → marca PRESENT/ABSENT/LATE/EXCUSED pra cada um
    ↓
Cria StudentHasExtraClassAttendance pra cada aluno
```

### Lançamento de frequência

O professor da aula avulsa:

1. Acessa a página/modal de frequência da aula avulsa
2. Seleciona a data (o sistema sugere o próximo horário com base nos `ExtraClassSchedule`s)
3. A lista de alunos inscritos (`StudentHasExtraClass` ativos) aparece
4. Marca presença/falta/atraso/justificada pra cada aluno
5. Salva em batch (igual ao `BatchCreateAttendanceController` das aulas regulares)

### Consulta de frequência

- **Na página da aula avulsa**: tabela com % de frequência por aluno (mesmo layout do `attendances-table.tsx`)
- **No schedule do aluno/responsável**: indicador de frequência por aula avulsa

### Cálculo de frequência

Mesmo cálculo das aulas regulares:
- `frequência% = (PRESENT + LATE + EXCUSED) / total * 100`

---

## Horário do Aluno

Os horários das aulas avulsas aparecem no **schedule do aluno** (`student-schedule-container.tsx`).

### Backend

O controller `GetStudentScheduleController` já retorna os `CalendarSlot`s das turmas do aluno. Estender para também retornar os `ExtraClassSchedule`s das aulas avulsas ativas do aluno:

```typescript
// Além dos slots regulares, buscar:
const extraClasses = await StudentHasExtraClass.query()
  .where('studentId', studentId)
  .whereNull('cancelledAt')
  .preload('extraClass', (q) => {
    q.preload('schedules')
    q.preload('teacher')
  })

// Retornar no response como campo separado:
return response.ok({
  ...scheduleData,
  extraClassSchedules: extraClasses.map(shec => ({
    extraClassName: shec.extraClass.name,
    teacherName: shec.extraClass.teacher.name,
    schedules: shec.extraClass.schedules.map(s => ({
      weekDay: s.weekDay,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  })),
})
```

### Frontend

No `student-schedule-container.tsx`, renderizar os slots de aula avulsa na mesma grade, com estilo diferenciado (cor/badge) para distinguir das aulas regulares.

---

## Backend: Models

### `app/models/extra_class.ts`

```typescript
@column() declare id: string
@column() declare name: string
@column() declare slug: string
@column() declare description: string | null
@column() declare schoolId: string
@column() declare academicPeriodId: string
@column() declare contractId: string
@column() declare teacherId: string
@column() declare maxStudents: number | null
@column() declare isActive: boolean

@belongsTo(() => School) declare school: BelongsTo<typeof School>
@belongsTo(() => AcademicPeriod) declare academicPeriod: BelongsTo<typeof AcademicPeriod>
@belongsTo(() => Contract) declare contract: BelongsTo<typeof Contract>
@belongsTo(() => Teacher) declare teacher: BelongsTo<typeof Teacher>
@hasMany(() => ExtraClassSchedule) declare schedules: HasMany<typeof ExtraClassSchedule>
@hasMany(() => StudentHasExtraClass) declare enrollments: HasMany<typeof StudentHasExtraClass>
@hasMany(() => ExtraClassAttendance) declare attendances: HasMany<typeof ExtraClassAttendance>
```

### `app/models/extra_class_schedule.ts`

```typescript
@column() declare id: string
@column() declare extraClassId: string
@column() declare weekDay: number
@column() declare startTime: string
@column() declare endTime: string

@belongsTo(() => ExtraClass) declare extraClass: BelongsTo<typeof ExtraClass>
@hasMany(() => ExtraClassAttendance) declare attendances: HasMany<typeof ExtraClassAttendance>
```

### `app/models/student_has_extra_class.ts`

```typescript
@column() declare id: string
@column() declare studentId: string
@column() declare extraClassId: string
@column() declare contractId: string
@column() declare scholarshipId: string | null
@column() declare paymentMethod: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
@column() declare paymentDay: number
@column.dateTime() declare enrolledAt: DateTime
@column.dateTime() declare cancelledAt: DateTime | null

@belongsTo(() => Student) declare student: BelongsTo<typeof Student>
@belongsTo(() => ExtraClass) declare extraClass: BelongsTo<typeof ExtraClass>
@belongsTo(() => Contract) declare contract: BelongsTo<typeof Contract>
@belongsTo(() => Scholarship) declare scholarship: BelongsTo<typeof Scholarship>
@hasMany(() => StudentPayment) declare payments: HasMany<typeof StudentPayment>
```

### `app/models/extra_class_attendance.ts`

```typescript
@column() declare id: string
@column() declare extraClassId: string
@column() declare extraClassScheduleId: string
@column.dateTime() declare date: DateTime
@column() declare note: string | null

@belongsTo(() => ExtraClass) declare extraClass: BelongsTo<typeof ExtraClass>
@belongsTo(() => ExtraClassSchedule) declare extraClassSchedule: BelongsTo<typeof ExtraClassSchedule>
@hasMany(() => StudentHasExtraClassAttendance) declare studentAttendances: HasMany<typeof StudentHasExtraClassAttendance>
```

### `app/models/student_has_extra_class_attendance.ts`

```typescript
@column() declare id: string
@column() declare studentId: string
@column() declare extraClassAttendanceId: string
@column() declare status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
@column() declare justification: string | null

@belongsTo(() => Student) declare student: BelongsTo<typeof Student>
@belongsTo(() => ExtraClassAttendance) declare extraClassAttendance: BelongsTo<typeof ExtraClassAttendance>
```

---

## Backend: Controllers e Rotas

### CRUD de Aulas Avulsas

```
GET    /api/v1/extra-classes                    ListExtraClassesController
POST   /api/v1/extra-classes                    CreateExtraClassController
GET    /api/v1/extra-classes/:id                ShowExtraClassController
PUT    /api/v1/extra-classes/:id                UpdateExtraClassController
DELETE /api/v1/extra-classes/:id                DeleteExtraClassController
```

- `List` filtra por `schoolId`, `academicPeriodId`, `isActive`
- `Create` valida vagas, cria a extra_class + schedules em transaction
- `Update` permite alterar horários, contrato, professor, limite de vagas
- `Delete` soft-delete (is_active = false)

### Inscrição de Alunos

```
POST   /api/v1/extra-classes/:id/enroll         EnrollExtraClassController
DELETE /api/v1/extra-classes/:id/enroll/:enrollmentId  CancelExtraClassEnrollmentController
GET    /api/v1/extra-classes/:id/students        ListExtraClassStudentsController
```

- `Enroll`:
  1. Verificar vagas disponíveis (`max_students` vs count de inscritos ativos)
  2. Criar `StudentHasExtraClass`
  3. Gerar `StudentPayment`s com `type='EXTRA_CLASS'` para os meses restantes
  4. Disparar `ReconcilePaymentInvoiceJob` para vincular às invoices

- `Cancel`:
  1. Setar `cancelled_at` no `StudentHasExtraClass`
  2. Cancelar `StudentPayment`s futuros não pagos
  3. Reconciliar invoices afetadas

### Frequência

```
POST   /api/v1/extra-classes/:id/attendance              CreateExtraClassAttendanceController
GET    /api/v1/extra-classes/:id/attendance              ListExtraClassAttendancesController
PUT    /api/v1/extra-classes/:id/attendance/:attendanceId UpdateExtraClassAttendanceController
GET    /api/v1/extra-classes/:id/attendance/summary       GetExtraClassAttendanceSummaryController
```

- `Create` (batch):
  1. Recebe a data e lista de `{ studentId, status, justification? }`
  2. Encontra o `ExtraClassSchedule` correspondente ao dia da semana da data
  3. Cria `ExtraClassAttendance` + `StudentHasExtraClassAttendance` pra cada aluno

- `List`: retorna as attendances com student data (paginado, filtro por data)

- `Update`: atualiza status/justificativa de um `StudentHasExtraClassAttendance`

- `Summary`: retorna frequência agregada por aluno (total aulas, presenças, faltas, %, etc.)

### Página

```
GET    /escola/pedagogico/aulas-avulsas          ShowExtraClassesPageController
```

---

## Frontend

### Página de Gestão (`inertia/pages/escola/pedagogico/aulas-avulsas.tsx`)

Tabela listando as aulas avulsas da escola com:
- Nome, professor, horários, vagas (ocupadas/total), período, status
- Ações: editar, ver alunos inscritos, lançar frequência, desativar

### Modal de Criar/Editar Aula Avulsa

Campos:
- Nome
- Professor (select dos teachers da escola)
- Período letivo (select dos academic periods ativos)
- Contrato (select dos contracts da escola)
- Limite de vagas (input numérico, opcional)
- Horários (lista dinâmica: dia da semana + hora início + hora fim, pode adicionar/remover)

### Modal de Inscrever Aluno

- Select de aluno (mesmo `StudentMultiSelect` que já existe)
- Contrato (pré-preenchido do extra_class, editável)
- Bolsa (select, opcional)
- Forma de pagamento
- Dia de vencimento
- Preview do impacto financeiro (valor mensal que será adicionado)

### Tabela de Alunos Inscritos

- Nome do aluno, data de inscrição, forma de pagamento, % frequência
- Ação: cancelar inscrição

### Modal/Página de Lançar Frequência

- Seletor de data (sugere próximo horário)
- Lista de alunos inscritos com toggle PRESENT/ABSENT/LATE/EXCUSED
- Campo de justificativa (aparece quando marca ABSENT ou EXCUSED)
- Botão de salvar em batch
- Mesmo UX do lançamento de frequência das aulas regulares

### Tabela de Frequência (resumo)

- Mesmo layout do `attendances-table.tsx`
- Colunas: aluno, total aulas, presenças, faltas, atrasos, justificadas, % frequência
- Badge colorido por % (verde >= 75%, cinza >= 50%, vermelho < 50%)

### Horário do Aluno

No `student-schedule-container.tsx`, os slots de aula avulsa aparecem com:
- Cor diferenciada (ex: roxo/lilás vs azul das aulas regulares)
- Badge "Avulsa" ou nome da atividade
- Mesmo layout de slot (horário, professor)

---

## DTOs

### `ExtraClassDto`

```typescript
id, name, slug, description, schoolId, academicPeriodId, contractId,
teacherId, maxStudents, isActive, createdAt, updatedAt,
schedules: ExtraClassScheduleDto[],
teacher?: TeacherDto,
contract?: ContractDto,
academicPeriod?: AcademicPeriodDto,
enrollmentCount: number  // count de inscritos ativos
```

### `ExtraClassScheduleDto`

```typescript
id, extraClassId, weekDay, startTime, endTime
```

### `StudentHasExtraClassDto`

```typescript
id, studentId, extraClassId, contractId, scholarshipId,
paymentMethod, paymentDay, enrolledAt, cancelledAt,
student?: StudentDto,
extraClass?: ExtraClassDto,
contract?: ContractDto,
scholarship?: ScholarshipDto
```

### `ExtraClassAttendanceDto`

```typescript
id, extraClassId, extraClassScheduleId, date, note,
studentAttendances?: StudentHasExtraClassAttendanceDto[]
```

### `StudentHasExtraClassAttendanceDto`

```typescript
id, studentId, extraClassAttendanceId, status, justification,
student?: StudentDto
```

---

## Validators

### `createExtraClassValidator`

```typescript
name: vine.string().trim().minLength(2).maxLength(100)
description: vine.string().trim().optional()
schoolId: vine.string().uuid()
academicPeriodId: vine.string().uuid()
contractId: vine.string().uuid()
teacherId: vine.string().uuid()
maxStudents: vine.number().positive().optional()
schedules: vine.array(
  vine.object({
    weekDay: vine.number().range([0, 6])
    startTime: vine.string().regex(/^\d{2}:\d{2}$/)
    endTime: vine.string().regex(/^\d{2}:\d{2}$/)
  })
).minLength(1)
```

### `enrollExtraClassValidator`

```typescript
studentId: vine.string().uuid()
contractId: vine.string().uuid().optional()  // herda do extra_class se não informado
scholarshipId: vine.string().uuid().optional()
paymentMethod: vine.enum(['BOLETO', 'CREDIT_CARD', 'PIX'])
paymentDay: vine.number().range([1, 31])
```

### `createExtraClassAttendanceValidator`

```typescript
date: vine.date()
attendances: vine.array(
  vine.object({
    studentId: vine.string().uuid()
    status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
    justification: vine.string().trim().maxLength(500).optional()
  })
).minLength(1)
```

### `updateExtraClassAttendanceValidator`

```typescript
status: vine.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
justification: vine.string().trim().maxLength(500).optional()
```

---

## Migrations

1. `create_extra_classes_table`
2. `create_extra_class_schedules_table`
3. `create_student_has_extra_classes_table`
4. `create_extra_class_attendances_table`
5. `create_student_has_extra_class_attendances_table`
6. `alter_student_payments_add_extra_class` — adicionar `EXTRA_CLASS` ao enum `type` e coluna `student_has_extra_class_id`

---

## Arquivos a Criar

### Backend
- `app/models/extra_class.ts`
- `app/models/extra_class_schedule.ts`
- `app/models/student_has_extra_class.ts`
- `app/models/extra_class_attendance.ts`
- `app/models/student_has_extra_class_attendance.ts`
- `app/models/dto/extra_class.dto.ts`
- `app/models/dto/extra_class_schedule.dto.ts`
- `app/models/dto/student_has_extra_class.dto.ts`
- `app/models/dto/extra_class_attendance.dto.ts`
- `app/models/dto/student_has_extra_class_attendance.dto.ts`
- `app/validators/extra_class.ts`
- `app/controllers/extra_classes/list_extra_classes_controller.ts`
- `app/controllers/extra_classes/create_extra_class_controller.ts`
- `app/controllers/extra_classes/show_extra_class_controller.ts`
- `app/controllers/extra_classes/update_extra_class_controller.ts`
- `app/controllers/extra_classes/delete_extra_class_controller.ts`
- `app/controllers/extra_classes/enroll_extra_class_controller.ts`
- `app/controllers/extra_classes/cancel_extra_class_enrollment_controller.ts`
- `app/controllers/extra_classes/list_extra_class_students_controller.ts`
- `app/controllers/extra_classes/create_extra_class_attendance_controller.ts`
- `app/controllers/extra_classes/list_extra_class_attendances_controller.ts`
- `app/controllers/extra_classes/update_extra_class_attendance_controller.ts`
- `app/controllers/extra_classes/get_extra_class_attendance_summary_controller.ts`
- `app/controllers/pages/escola/show_extra_classes_page_controller.ts`
- 6 migrations

### Backend (modificar)
- `app/models/student_payment.ts` — adicionar `EXTRA_CLASS` ao type, FK `studentHasExtraClassId`
- `app/models/dto/student_payment.dto.ts` — adicionar `studentHasExtraClassId`
- `app/controllers/responsavel/get_student_schedule_controller.ts` — incluir extra classes no response
- `start/routes.ts` — registrar rotas de extra classes

### Frontend
- `inertia/pages/escola/pedagogico/aulas-avulsas.tsx`
- `inertia/containers/extra-classes/extra-classes-table.tsx`
- `inertia/containers/extra-classes/create-extra-class-modal.tsx`
- `inertia/containers/extra-classes/edit-extra-class-modal.tsx`
- `inertia/containers/extra-classes/enroll-student-modal.tsx`
- `inertia/containers/extra-classes/extra-class-students-table.tsx`
- `inertia/containers/extra-classes/extra-class-attendance-modal.tsx`
- `inertia/containers/extra-classes/extra-class-attendance-summary.tsx`
- `inertia/hooks/queries/use_extra_classes.ts`
- `inertia/hooks/queries/use_extra_class_attendance.ts`
- `inertia/hooks/mutations/use_extra_class_mutations.ts`
- `inertia/hooks/mutations/use_extra_class_attendance_mutations.ts`

### Frontend (modificar)
- `inertia/containers/responsavel/student-schedule-container.tsx` — renderizar slots de aula avulsa
