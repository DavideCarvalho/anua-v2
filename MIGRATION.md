# Migração school-super-app: Next.js → AdonisJS

Este documento registra o progresso da migração do projeto `school-super-app` de Next.js + tRPC para AdonisJS + Inertia.

---

## Contexto do Projeto

### Projetos Envolvidos

| Projeto                | Caminho                                 | Descrição                        |
| ---------------------- | --------------------------------------- | -------------------------------- |
| **Projeto Original**   | `~/documents/personal/school-super-app` | Monorepo Next.js + tRPC + Prisma |
| **Projeto Novo**       | `~/documents/personal/anua-v2`          | AdonisJS + Inertia + React       |
| **Projeto Referência** | `~/documents/personal/projeto-turismo`  | Exemplo de estrutura AdonisJS    |

### Estrutura do Projeto Original

```
school-super-app/
├── packages/
│   ├── api/src/router/      # tRPC Routers (50+ arquivos)
│   ├── db/prisma/           # Schema Prisma
│   │   └── models/          # Arquivos .prisma por módulo
│   └── ...
```

**Onde encontrar os schemas originais:**

- `packages/db/prisma/models/school.prisma` - Escolas, Alunos, Turmas
- `packages/db/prisma/models/student-balance.prisma` - Saldo do aluno
- `packages/db/prisma/models/` - Demais módulos

---

## Stack Tecnológica (anua-v2)

### Backend (AdonisJS 6)

| Lib                 | Versão | Uso                    |
| ------------------- | ------ | ---------------------- |
| `@adonisjs/core`    | 6.x    | Framework base         |
| `@adonisjs/lucid`   | 21.x   | ORM (PostgreSQL)       |
| `@adonisjs/auth`    | 4.x    | Autenticação (Session) |
| `@adonisjs/inertia` | 1.x    | SSR com React          |
| `@vinejs/vine`      | 2.x    | Validação de dados     |
| `@tuyau/core`       | latest | API type-safe          |
| `luxon`             | 3.x    | Manipulação de datas   |

### Frontend (React + Inertia)

| Lib                       | Versão | Uso                       |
| ------------------------- | ------ | ------------------------- |
| `react`                   | 19.x   | UI Framework              |
| `@inertiajs/react`        | 2.x    | Client Inertia            |
| `@tanstack/react-query`   | 5.x    | Data fetching             |
| `@tanstack/react-table`   | 8.x    | Tabelas                   |
| `tailwindcss`             | 4.x    | Estilização               |
| `@radix-ui/*`             | latest | Componentes base (Shadcn) |
| `clsx` + `tailwind-merge` | latest | Utilitários CSS           |

### Ferramentas

| Comando                        | Descrição          |
| ------------------------------ | ------------------ |
| `npm run dev`                  | Dev server         |
| `node ace migration:run`       | Rodar migrations   |
| `node ace tuyau:generate`      | Gerar tipos da API |
| `node ace make:migration nome` | Criar migration    |
| `node ace make:model Nome`     | Criar model        |

---

## Padrões e Convenções

### 1. Single Action Controllers

Cada controller tem apenas UM método `handle()` e nome descritivo:

```
app/controllers/
├── students/
│   ├── list_students_controller.ts       # GET /students
│   ├── show_student_controller.ts        # GET /students/:id
│   ├── create_student_controller.ts      # POST /students
│   ├── update_student_controller.ts      # PUT /students/:id
│   └── delete_student_controller.ts      # DELETE /students/:id
│
├── pages/
│   ├── show_dashboard_page_controller.ts # Renderiza página do dashboard
│   ├── show_login_page_controller.ts     # Renderiza página de login
│   └── show_students_page_controller.ts  # Renderiza página de listagem
```

**Convenção de nomes:**

- API Controllers: `[ação]_[recurso]_controller.ts`
  - `list_students_controller.ts`
  - `create_student_controller.ts`
  - `show_student_controller.ts`
  - `update_student_controller.ts`
  - `delete_student_controller.ts`

- Page Controllers (Inertia): `show_[nome]_page_controller.ts`
  - `show_dashboard_page_controller.ts`
  - `show_login_page_controller.ts`

### 2. Versionamento de API

Todas as rotas API usam prefixo `/api/v1/`:

```typescript
router
  .group(() => {
    // rotas aqui
  })
  .prefix('/api/v1')
```

### 3. Validators com VineJS

```typescript
// app/validators/student.ts
export const createStudentValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    email: vine.string().email().optional(),
  })
)
```

### 4. Relacionamento User ↔ Student (1:1)

Student usa o MESMO ID do User (não é FK, é PK compartilhada):

```typescript
// Student.id === User.id
@column({ isPrimary: true })
declare id: string  // Mesmo ID do User
```

### 5. Soft Delete

Usuários não são deletados, apenas marcados:

```typescript
user.deletedAt = DateTime.now()
user.deletedBy = auth.user.id
user.active = false
```

### 6. Rotas Protegidas

```typescript
router
  .group(() => {
    // rotas protegidas
  })
  .use(middleware.auth())
```

---

## Banco de Dados

### Conexão

```env
DB_HOST=191.101.18.20
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=***
DB_DATABASE=anua_v2
```

### Migrations Criadas (em ordem)

1. `create_users_table`
2. `create_roles_table`
3. `create_school_chains_table`
4. `create_schools_table`
5. `create_school_groups_table`
6. `create_school_has_groups_table`
7. `add_foreign_keys_to_users`
8. `create_students_table`
9. `create_contract_documents_table`
10. `create_student_documents_table`
11. `create_student_balance_transactions_table`
12. `create_student_payments_table`
13. `create_student_has_responsibles_table`
14. `create_responsible_addresses_table`
15. `create_responsible_documents_table`
16. `create_contracts_table`
17. `create_contract_payment_days_table`
18. `create_contract_interest_configs_table`
19. `create_contract_early_discounts_table`
20. `add_contract_id_to_contract_documents_table`
21. `create_user_has_schools_table`
22. `create_user_has_school_groups_table`

---

## Como Continuar a Migração

### Para cada nova fase:

1. **Consultar schema original:**

   ```bash
   cat ~/documents/personal/school-super-app/packages/db/prisma/models/[modulo].prisma
   ```

2. **Criar migrations:**

   ```bash
   node ace make:migration create_[tabela]_table
   ```

3. **Criar models em** `app/models/`

4. **Criar validators em** `app/validators/`

5. **Criar Single Action Controllers em** `app/controllers/[modulo]/`
   - `index.ts`, `show.ts`, `store.ts`, `update.ts`, `destroy.ts`

6. **Adicionar rotas em** `start/routes.ts`

7. **Gerar tipos Tuyau:**

   ```bash
   node ace tuyau:generate
   ```

8. **Atualizar este arquivo** com o progresso

---

## Status Geral

| Fase | Descrição                | Status         |
| ---- | ------------------------ | -------------- |
| 0    | Setup Inicial            | Concluído      |
| 1    | Módulo Escolas           | Concluído      |
| 2    | Auth/Usuários            | Concluído      |
| 3    | Alunos                   | Concluído      |
| 4    | Responsáveis             | Concluído      |
| 5    | Matrícula Online         | Concluído      |
| 6    | Pedagógico               | Concluído      |
| 7    | Financeiro               | Concluído      |
| 8    | Cantina                  | Parcial        |
| 9    | Gamificação              | Concluído      |
| 10   | Admin/Platform           | Concluído      |
| 11   | Frontend Pages           | Parcial        |
| 12   | Backend Incompleto       | **Em Análise** |

### Detalhamento Fase 12 (Módulos com Backend Incompleto)

| Módulo             | Models | Migrations | Controllers | Rotas | Status     |
| ------------------ | ------ | ---------- | ----------- | ----- | ---------- |
| Events             | OK     | OK         | OK          | OK    | Concluído  |
| Notifications      | OK     | OK         | OK          | OK    | Concluído  |
| Posts/Feed         | OK     | OK         | OK          | OK    | Concluído  |
| Grades (Analytics) | OK     | OK         | OK          | OK    | Concluído  |
| Purchase Requests  | OK     | OK         | OK          | OK    | Concluído  |

---

## Fase 0: Setup Inicial

### Tecnologias Instaladas

- [x] AdonisJS 6 com TypeScript
- [x] Inertia.js + React + SSR
- [x] PostgreSQL (Lucid ORM)
- [x] Autenticação (Session Guard)
- [x] Tuyau (API type-safe)
- [x] TanStack Query
- [x] Tailwind CSS 4
- [x] Componentes Shadcn UI (básicos)
- [x] Configurar conexão com banco de dados

### Estrutura de Pastas

```
anua-v2/
├── app/
│   ├── controllers/          # Controllers AdonisJS
│   ├── models/               # Lucid Models
│   ├── middleware/           # Middlewares
│   └── validators/           # Validators (VineJS)
├── config/                   # Configurações
├── database/
│   ├── migrations/           # Migrations Lucid
│   └── seeders/              # Seeders
├── inertia/
│   ├── app/                  # Entry points React
│   ├── components/           # Componentes React
│   │   └── ui/               # Shadcn UI
│   ├── css/                  # Tailwind CSS
│   ├── lib/                  # Utils e API client
│   └── pages/                # Páginas Inertia
├── resources/views/          # Templates Edge
└── start/
    └── routes.ts             # Rotas
```

---

## Fase 1: Módulo Escolas

### Models Criados

- [x] `Role` - Papel/função do usuário
- [x] `School` - Escola principal
- [x] `SchoolChain` - Rede de escolas
- [x] `SchoolGroup` - Agrupamento de escolas
- [x] `User` - Usuário atualizado com relacionamentos
- [x] `SchoolPartner` - Parceiros

### Migrations Criadas

- [x] `create_users_table` - Usuários
- [x] `create_roles_table` - Roles
- [x] `create_school_chains_table` - Redes de escolas
- [x] `create_schools_table` - Escolas
- [x] `create_school_groups_table` - Agrupamentos
- [x] `create_school_has_groups_table` - Relação N:N escola-grupo
- [x] `add_foreign_keys_to_users` - Foreign keys do usuário

### Controllers

- [x] `SchoolsController` - CRUD completo
- [x] `SchoolChainsController` - CRUD completo
- [x] `SchoolGroupsController` - CRUD completo
- [x] `SchoolPartnersController` - CRUD completo

### Endpoints Implementados

| Método | Rota                         | Controller | Status    |
| ------ | ---------------------------- | ---------- | --------- |
| GET    | `/api/v1/schools`            | index      | Concluído |
| GET    | `/api/v1/schools/:id`        | show       | Concluído |
| GET    | `/api/v1/schools/slug/:slug` | showBySlug | Concluído |
| POST   | `/api/v1/schools`            | store      | Concluído |
| PUT    | `/api/v1/schools/:id`        | update     | Concluído |
| DELETE | `/api/v1/schools/:id`        | destroy    | Concluído |

**School Chains:**
| Método | Rota | Controller | Status |
| ------ | ----------------------------- | ---------- | --------- |
| GET | `/api/v1/school-chains` | index | Concluído |
| POST | `/api/v1/school-chains` | store | Concluído |
| GET | `/api/v1/school-chains/:id` | show | Concluído |
| PUT | `/api/v1/school-chains/:id` | update | Concluído |
| DELETE | `/api/v1/school-chains/:id` | destroy | Concluído |

**School Groups:**
| Método | Rota | Controller | Status |
| ------ | ----------------------------- | ---------- | --------- |
| GET | `/api/v1/school-groups` | index | Concluído |
| POST | `/api/v1/school-groups` | store | Concluído |
| GET | `/api/v1/school-groups/:id` | show | Concluído |
| PUT | `/api/v1/school-groups/:id` | update | Concluído |
| DELETE | `/api/v1/school-groups/:id` | destroy | Concluído |

**School Partners:**
| Método | Rota | Controller | Status |
| ------ | -------------------------------- | ---------- | --------- |
| GET | `/api/v1/school-partners` | index | Concluído |
| POST | `/api/v1/school-partners` | store | Concluído |
| GET | `/api/v1/school-partners/:id` | show | Concluído |
| PUT | `/api/v1/school-partners/:id` | update | Concluído |
| PATCH | `/api/v1/school-partners/:id/toggle-active` | toggle | Concluído |

---

## Fase 2: Auth/Usuários

### Models Criados

- [x] `User` - Usuário do sistema (já existia da Fase 1)
- [x] `Role` - Papel/função (já existia da Fase 1)
- [x] `UserHasSchool` - Relação usuário-escola
- [x] `UserHasSchoolGroup` - Relação usuário-grupo

### Sistema de Autenticação

- [x] Login por email/senha
- [x] Sessões (já configurado)
- [x] Middleware de autenticação
- [x] Middleware de roles

### Controllers (Single Action)

- [x] `auth/login.ts` - Login
- [x] `auth/logout.ts` - Logout
- [x] `auth/me.ts` - Usuário atual
- [x] `users/index.ts` - Listar usuários
- [x] `users/show.ts` - Mostrar usuário
- [x] `users/store.ts` - Criar usuário
- [x] `users/update.ts` - Atualizar usuário
- [x] `users/destroy.ts` - Soft delete usuário
- [x] `user_schools/list_user_schools_controller.ts` - Listar escolas do usuário
- [x] `user_schools/create_user_school_controller.ts` - Atribuir escola ao usuário
- [x] `user_schools/update_user_school_controller.ts` - Atualizar relação (default)
- [x] `user_schools/delete_user_school_controller.ts` - Remover escola do usuário
- [x] `user_school_groups/list_user_school_groups_controller.ts` - Listar grupos do usuário
- [x] `user_school_groups/create_user_school_group_controller.ts` - Atribuir grupo ao usuário
- [x] `user_school_groups/delete_user_school_group_controller.ts` - Remover grupo do usuário

### Validators Criados

- [x] `auth.ts` - loginValidator, registerValidator
- [x] `user.ts` - createUserValidator, updateUserValidator
- [x] `user_school.ts` - listUserSchoolsValidator, createUserSchoolValidator, updateUserSchoolValidator
- [x] `user_school_group.ts` - listUserSchoolGroupsValidator, createUserSchoolGroupValidator

### Endpoints Implementados

| Método | Rota                  | Controller | Status                |
| ------ | --------------------- | ---------- | --------------------- |
| POST   | `/api/v1/auth/login`  | login      | Concluído             |
| POST   | `/api/v1/auth/logout` | logout     | Concluído (protegido) |
| GET    | `/api/v1/auth/me`     | me         | Concluído (protegido) |
| GET    | `/api/v1/users`       | index      | Concluído (protegido) |
| GET    | `/api/v1/users/:id`   | show       | Concluído (protegido) |
| POST   | `/api/v1/users`       | store      | Concluído (protegido) |
| PUT    | `/api/v1/users/:id`   | update     | Concluído (protegido) |
| DELETE | `/api/v1/users/:id`   | destroy    | Concluído (protegido) |

**User Schools:**
| Método | Rota | Controller | Status |
| ------ | ---------------------------- | ---------- | --------------------- |
| GET | `/api/v1/user-schools` | index | Concluído (protegido) |
| POST | `/api/v1/user-schools` | store | Concluído (protegido) |
| PUT | `/api/v1/user-schools/:id` | update | Concluído (protegido) |
| DELETE | `/api/v1/user-schools/:id` | destroy | Concluído (protegido) |

**User School Groups:**
| Método | Rota | Controller | Status |
| ------ | ---------------------------------- | ---------- | --------------------- |
| GET | `/api/v1/user-school-groups` | index | Concluído (protegido) |
| POST | `/api/v1/user-school-groups` | store | Concluído (protegido) |
| DELETE | `/api/v1/user-school-groups/:id` | destroy | Concluído (protegido) |

---

## Fase 3: Alunos

### Migrations Criadas

- [x] `create_students_table` - Tabela de alunos (1:1 com users)
- [x] `create_contract_documents_table` - Tipos de documentos do contrato
- [x] `create_student_documents_table` - Documentos enviados
- [x] `create_student_balance_transactions_table` - Transações de saldo
- [x] `create_student_payments_table` - Pagamentos

### Models Criados

- [x] `Student` - Aluno (extends User via ID)
- [x] `ContractDocument` - Tipos de documentos
- [x] `StudentDocument` - Documentos enviados
- [x] `StudentBalanceTransaction` - Transações de saldo
- [x] `StudentPayment` - Pagamentos

### Controllers (Single Action)

- [x] `students/index.ts` - Listar alunos com filtros
- [x] `students/show.ts` - Mostrar aluno
- [x] `students/store.ts` - Criar aluno (cria User + Student)
- [x] `students/update.ts` - Atualizar aluno
- [x] `students/destroy.ts` - Soft delete

### Validators Criados

- [x] `student.ts` - createStudentValidator, updateStudentValidator

### Endpoints Implementados

| Método | Rota                   | Controller | Status                |
| ------ | ---------------------- | ---------- | --------------------- |
| GET    | `/api/v1/students`     | index      | Concluído (protegido) |
| GET    | `/api/v1/students/:id` | show       | Concluído (protegido) |
| POST   | `/api/v1/students`     | store      | Concluído (protegido) |
| PUT    | `/api/v1/students/:id` | update     | Concluído (protegido) |
| DELETE | `/api/v1/students/:id` | destroy    | Concluído (protegido) |

---

## Fase 4: Responsáveis

### Migrations Criadas

- [x] `create_student_has_responsibles_table` - Relação aluno-responsável (N:N)
- [x] `create_responsible_addresses_table` - Endereços dos responsáveis
- [x] `create_responsible_documents_table` - Documentos dos responsáveis

### Models Criados

- [x] `StudentHasResponsible` - Relação responsável-aluno (N:N)
- [x] `ResponsibleAddress` - Endereço do responsável
- [x] `ResponsibleDocument` - Documentos do responsável

### DTOs Criados

- [x] `StudentHasResponsibleDto` - DTO para relacionamento aluno-responsável
- [x] `ResponsibleAddressDto` - DTO para endereços
- [x] `ResponsibleDocumentDto` - DTO para documentos

### Controllers (Single Action)

- [x] `responsibles/list_student_responsibles_controller.ts` - Listar responsáveis de um aluno
- [x] `responsibles/assign_responsible_controller.ts` - Atribuir responsável a aluno
- [x] `responsibles/update_responsible_assignment_controller.ts` - Atualizar atribuição
- [x] `responsibles/remove_responsible_controller.ts` - Remover responsável
- [x] `responsible-addresses/show_responsible_address_controller.ts` - Mostrar endereço
- [x] `responsible-addresses/create_responsible_address_controller.ts` - Criar endereço

### Validators Criados

- [x] `responsible.ts` - Validadores para todas as operações de responsáveis

### Endpoints Implementados

| Método | Rota                                           | Controller                               | Status                |
| ------ | ---------------------------------------------- | ---------------------------------------- | --------------------- |
| GET    | `/api/v1/students/:studentId/responsibles`     | list_student_responsibles_controller     | Concluído (protegido) |
| POST   | `/api/v1/responsibles`                         | assign_responsible_controller            | Concluído (protegido) |
| PUT    | `/api/v1/responsibles/:id`                     | update_responsible_assignment_controller | Concluído (protegido) |
| DELETE | `/api/v1/responsibles/:id`                     | remove_responsible_controller            | Concluído (protegido) |
| GET    | `/api/v1/responsible-addresses/:responsibleId` | show_responsible_address_controller      | Concluído (protegido) |
| POST   | `/api/v1/responsible-addresses`                | create_responsible_address_controller    | Concluído (protegido) |

### Observações Importantes

**Responsáveis são Users:**

- No projeto original, responsáveis não são um modelo separado
- Responsáveis são **usuários** (`User`) com relacionamentos específicos via `StudentHasResponsible`
- Um usuário pode ser responsável pedagógico e/ou financeiro

**Relacionamento N:N:**

- Um aluno pode ter múltiplos responsáveis
- Um responsável pode ter múltiplos alunos
- Flags: `isPedagogical` e `isFinancial` definem o tipo de responsabilidade

**Estrutura de Dados:**

```typescript
// Atribuir responsável a aluno
POST /api/v1/responsibles
{
  "studentId": "abc123",
  "responsibleId": "def456",
  "isPedagogical": true,
  "isFinancial": false
}

// Endereço do responsável (1:1 com User)
POST /api/v1/responsible-addresses
{
  "responsibleId": "def456",
  "street": "Rua das Flores",
  "number": "123",
  // ...
}
```

---

## Fase 5: Matrícula Online

### Migrations Criadas

- [x] `create_contracts_table` - Contratos de matrícula
- [x] `create_contract_payment_days_table` - Dias de pagamento permitidos
- [x] `create_contract_interest_configs_table` - Configuração de juros por atraso
- [x] `create_contract_early_discounts_table` - Descontos por antecipação
- [x] `add_contract_id_to_contract_documents_table` - FK para relacionar documentos aos contratos

### Models Criados

- [x] `Contract` - Contratos de matrícula com configurações de pagamento
- [x] `ContractPaymentDay` - Dias permitidos para pagamento (1-31)
- [x] `ContractInterestConfig` - Configuração de juros e multas
- [x] `ContractEarlyDiscount` - Descontos por pagamento antecipado
- [x] `ContractDocument` - Atualizado com relação ao Contract

### DTOs Criados

- [x] `ContractDto` - DTO principal para contratos
- [x] `ContractDocumentDto` - DTO para documentos do contrato
- [x] `ContractPaymentDayDto` - DTO para dias de pagamento
- [x] `ContractInterestConfigDto` - DTO para configuração de juros
- [x] `ContractEarlyDiscountDto` - DTO para descontos

### Controllers (Single Action)

- [x] `contracts/list_contracts_controller.ts` - Listar contratos
- [x] `contracts/show_contract_controller.ts` - Mostrar contrato
- [x] `contracts/create_contract_controller.ts` - Criar contrato
- [x] `contracts/update_contract_controller.ts` - Atualizar contrato
- [x] `contracts/delete_contract_controller.ts` - Deletar contrato
- [x] `contract-documents/list_contract_documents_controller.ts` - Listar documentos
- [x] `contract-documents/create_contract_document_controller.ts` - Criar documento

### Validators Criados

- [x] `contract.ts` - Validadores para todas as operações de contratos

### Endpoints Implementados

| Método | Rota                         | Controller                          | Status                |
| ------ | ---------------------------- | ----------------------------------- | --------------------- |
| GET    | `/api/v1/contracts`          | list_contracts_controller           | Concluído (protegido) |
| POST   | `/api/v1/contracts`          | create_contract_controller          | Concluído (protegido) |
| GET    | `/api/v1/contracts/:id`      | show_contract_controller            | Concluído (protegido) |
| PUT    | `/api/v1/contracts/:id`      | update_contract_controller          | Concluído (protegido) |
| DELETE | `/api/v1/contracts/:id`      | delete_contract_controller          | Concluído (protegido) |
| GET    | `/api/v1/contract-documents` | list_contract_documents_controller  | Concluído (protegido) |
| POST   | `/api/v1/contract-documents` | create_contract_document_controller | Concluído (protegido) |

### Funcionalidades Implementadas

**Gestão de Contratos:**

- Criação e gestão de contratos de matrícula
- Suporte a dois tipos: MONTHLY (mensalidades) e UPFRONT (pagamento único)
- Configuração de valores de matrícula e curso separadamente
- Controle de parcelas flexíveis
- Integração com DocuSeal para assinaturas digitais

**Configurações Financeiras:**

- Dias de pagamento personalizáveis por contrato
- Configuração de juros por atraso
- Sistema de descontos por antecipação
- Configuração de seguros

**Documentação:**

- Documentos obrigatórios por contrato
- Relacionamento com documentos dos estudantes
- Controle de verificação de documentos

### Observações Importantes

**Relacionamentos:**

```typescript
// Contract ↔ School (N:1)
// Contract ↔ ContractDocument (1:N)
// Contract ↔ ContractPaymentDay (1:N)
// Contract ↔ ContractInterestConfig (1:1)
// Contract ↔ ContractEarlyDiscount (1:N)
```

**Tipos de Pagamento:**

- `MONTHLY` - Mensalidades regulares
- `UPFRONT` - Pagamento único à vista

**Estrutura Financeira:**

```typescript
{
  enrollmentValue: number,     // Valor da matrícula (em centavos)
  amount: number,             // Valor do curso (em centavos)
  installments: number,       // Número de parcelas
  paymentDays: [5, 10, 15],  // Dias permitidos para pagamento
}
```

---

## Fase 6: Pedagógico

### Models Utilizados (já existiam)

- [x] `Course` - Cursos/Anos
- [x] `Level` - Níveis/Séries
- [x] `Class` - Turmas
- [x] `Subject` - Disciplinas
- [x] `Teacher` - Professores (1:1 com User)
- [x] `TeacherHasClass` - Alocação professor-turma
- [x] `TeacherHasSubject` - Disciplinas do professor
- [x] `Exam` - Provas
- [x] `ExamGrade` - Notas das provas
- [x] `Attendance` - Frequência
- [x] `Assignment` - Tarefas
- [x] `AssignmentSubmission` - Entregas de tarefas

### Validators Criados

- [x] `course.ts` - createCourseValidator, updateCourseValidator
- [x] `level.ts` - createLevelValidator, updateLevelValidator
- [x] `class.ts` - createClassValidator, updateClassValidator
- [x] `subject.ts` - createSubjectValidator, updateSubjectValidator
- [x] `teacher.ts` - createTeacherValidator, updateTeacherValidator, assignTeacherToClassValidator
- [x] `exam.ts` - createExamValidator, updateExamValidator, saveExamGradeValidator
- [x] `attendance.ts` - createAttendanceValidator, updateAttendanceValidator, batchCreateAttendanceValidator
- [x] `assignment.ts` - createAssignmentValidator, updateAssignmentValidator, submitAssignmentValidator, gradeSubmissionValidator

### Controllers Criados (56 total)

**Courses (5):**

- [x] `courses/list_courses_controller.ts`
- [x] `courses/show_course_controller.ts`
- [x] `courses/create_course_controller.ts`
- [x] `courses/update_course_controller.ts`
- [x] `courses/delete_course_controller.ts`

**Levels (5):**

- [x] `levels/list_levels_controller.ts`
- [x] `levels/show_level_controller.ts`
- [x] `levels/create_level_controller.ts`
- [x] `levels/update_level_controller.ts`
- [x] `levels/delete_level_controller.ts`

**Classes (8):**

- [x] `classes/list_classes_controller.ts`
- [x] `classes/show_class_controller.ts`
- [x] `classes/show_class_by_slug_controller.ts`
- [x] `classes/create_class_controller.ts`
- [x] `classes/update_class_controller.ts`
- [x] `classes/delete_class_controller.ts`
- [x] `classes/list_class_students_controller.ts`
- [x] `classes/count_class_students_controller.ts`

**Subjects (7):**

- [x] `subjects/list_subjects_controller.ts`
- [x] `subjects/show_subject_controller.ts`
- [x] `subjects/show_subject_by_slug_controller.ts`
- [x] `subjects/create_subject_controller.ts`
- [x] `subjects/update_subject_controller.ts`
- [x] `subjects/delete_subject_controller.ts`
- [x] `subjects/list_subjects_for_class_controller.ts`

**Teachers (9):**

- [x] `teachers/list_teachers_controller.ts`
- [x] `teachers/show_teacher_controller.ts`
- [x] `teachers/create_teacher_controller.ts`
- [x] `teachers/update_teacher_controller.ts`
- [x] `teachers/delete_teacher_controller.ts`
- [x] `teachers/list_teacher_classes_controller.ts`
- [x] `teachers/list_teacher_subjects_controller.ts`
- [x] `teachers/assign_teacher_to_class_controller.ts`
- [x] `teachers/remove_teacher_from_class_controller.ts`

**Exams (8):**

- [x] `exams/list_exams_controller.ts`
- [x] `exams/show_exam_controller.ts`
- [x] `exams/create_exam_controller.ts`
- [x] `exams/update_exam_controller.ts`
- [x] `exams/delete_exam_controller.ts`
- [x] `exams/list_exam_grades_controller.ts`
- [x] `exams/save_exam_grade_controller.ts`
- [x] `exams/update_exam_grade_controller.ts`

**Attendance (6):**

- [x] `attendance/list_attendance_controller.ts`
- [x] `attendance/show_attendance_controller.ts`
- [x] `attendance/create_attendance_controller.ts`
- [x] `attendance/batch_create_attendance_controller.ts`
- [x] `attendance/update_attendance_controller.ts`
- [x] `attendance/get_student_attendance_controller.ts`

**Assignments (8):**

- [x] `assignments/list_assignments_controller.ts`
- [x] `assignments/show_assignment_controller.ts`
- [x] `assignments/create_assignment_controller.ts`
- [x] `assignments/update_assignment_controller.ts`
- [x] `assignments/delete_assignment_controller.ts`
- [x] `assignments/list_assignment_submissions_controller.ts`
- [x] `assignments/submit_assignment_controller.ts`
- [x] `assignments/grade_submission_controller.ts`

### Endpoints Implementados

**Courses:**
| Método | Rota | Controller | Status |
| ------ | --------------------- | ----------------------- | --------------------- |
| GET | `/api/v1/courses` | list_courses_controller | Concluído (protegido) |
| POST | `/api/v1/courses` | create_course_controller| Concluído (protegido) |
| GET | `/api/v1/courses/:id` | show_course_controller | Concluído (protegido) |
| PUT | `/api/v1/courses/:id` | update_course_controller| Concluído (protegido) |
| DELETE | `/api/v1/courses/:id` | delete_course_controller| Concluído (protegido) |

**Levels:**
| Método | Rota | Controller | Status |
| ------ | -------------------- | ----------------------- | --------------------- |
| GET | `/api/v1/levels` | list_levels_controller | Concluído (protegido) |
| POST | `/api/v1/levels` | create_level_controller | Concluído (protegido) |
| GET | `/api/v1/levels/:id` | show_level_controller | Concluído (protegido) |
| PUT | `/api/v1/levels/:id` | update_level_controller | Concluído (protegido) |
| DELETE | `/api/v1/levels/:id` | delete_level_controller | Concluído (protegido) |

**Classes:**
| Método | Rota | Controller | Status |
| ------ | -------------------------------- | ------------------------------- | --------------------- |
| GET | `/api/v1/classes` | list_classes_controller | Concluído (protegido) |
| POST | `/api/v1/classes` | create_class_controller | Concluído (protegido) |
| GET | `/api/v1/classes/slug/:slug` | show_class_by_slug_controller | Concluído (protegido) |
| GET | `/api/v1/classes/:id` | show_class_controller | Concluído (protegido) |
| PUT | `/api/v1/classes/:id` | update_class_controller | Concluído (protegido) |
| DELETE | `/api/v1/classes/:id` | delete_class_controller | Concluído (protegido) |
| GET | `/api/v1/classes/:id/students` | list_class_students_controller | Concluído (protegido) |
| GET | `/api/v1/classes/:id/students/count` | count_class_students_controller | Concluído (protegido) |
| GET | `/api/v1/classes/:classId/subjects` | list_subjects_for_class_controller | Concluído (protegido) |

**Subjects:**
| Método | Rota | Controller | Status |
| ------ | ----------------------------- | ----------------------------- | --------------------- |
| GET | `/api/v1/subjects` | list_subjects_controller | Concluído (protegido) |
| POST | `/api/v1/subjects` | create_subject_controller | Concluído (protegido) |
| GET | `/api/v1/subjects/slug/:slug` | show_subject_by_slug_controller | Concluído (protegido) |
| GET | `/api/v1/subjects/:id` | show_subject_controller | Concluído (protegido) |
| PUT | `/api/v1/subjects/:id` | update_subject_controller | Concluído (protegido) |
| DELETE | `/api/v1/subjects/:id` | delete_subject_controller | Concluído (protegido) |

**Teachers:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------------- | ----------------------------------- | --------------------- |
| GET | `/api/v1/teachers` | list_teachers_controller | Concluído (protegido) |
| POST | `/api/v1/teachers` | create_teacher_controller | Concluído (protegido) |
| GET | `/api/v1/teachers/:id` | show_teacher_controller | Concluído (protegido) |
| PUT | `/api/v1/teachers/:id` | update_teacher_controller | Concluído (protegido) |
| DELETE | `/api/v1/teachers/:id` | delete_teacher_controller | Concluído (protegido) |
| GET | `/api/v1/teachers/:id/classes` | list_teacher_classes_controller | Concluído (protegido) |
| GET | `/api/v1/teachers/:id/subjects` | list_teacher_subjects_controller | Concluído (protegido) |
| POST | `/api/v1/teachers/:id/classes` | assign_teacher_to_class_controller | Concluído (protegido) |
| DELETE | `/api/v1/teachers/:id/classes/:classId` | remove_teacher_from_class_controller| Concluído (protegido) |

**Exams:**
| Método | Rota | Controller | Status |
| ------ | ----------------------------------- | ---------------------------- | --------------------- |
| GET | `/api/v1/exams` | list_exams_controller | Concluído (protegido) |
| POST | `/api/v1/exams` | create_exam_controller | Concluído (protegido) |
| GET | `/api/v1/exams/:id` | show_exam_controller | Concluído (protegido) |
| PUT | `/api/v1/exams/:id` | update_exam_controller | Concluído (protegido) |
| DELETE | `/api/v1/exams/:id` | delete_exam_controller | Concluído (protegido) |
| GET | `/api/v1/exams/:id/grades` | list_exam_grades_controller | Concluído (protegido) |
| POST | `/api/v1/exams/:id/grades` | save_exam_grade_controller | Concluído (protegido) |
| PUT | `/api/v1/exams/:id/grades/:gradeId` | update_exam_grade_controller | Concluído (protegido) |

**Attendance:**
| Método | Rota | Controller | Status |
| ------ | -------------------------------------- | -------------------------------- | --------------------- |
| GET | `/api/v1/attendance` | list_attendance_controller | Concluído (protegido) |
| POST | `/api/v1/attendance` | create_attendance_controller | Concluído (protegido) |
| POST | `/api/v1/attendance/batch` | batch_create_attendance_controller | Concluído (protegido) |
| GET | `/api/v1/attendance/:id` | show_attendance_controller | Concluído (protegido) |
| PUT | `/api/v1/attendance/:id` | update_attendance_controller | Concluído (protegido) |
| GET | `/api/v1/students/:studentId/attendance` | get_student_attendance_controller | Concluído (protegido) |

**Assignments:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------------------- | ------------------------------------- | --------------------- |
| GET | `/api/v1/assignments` | list_assignments_controller | Concluído (protegido) |
| POST | `/api/v1/assignments` | create_assignment_controller | Concluído (protegido) |
| GET | `/api/v1/assignments/:id` | show_assignment_controller | Concluído (protegido) |
| PUT | `/api/v1/assignments/:id` | update_assignment_controller | Concluído (protegido) |
| DELETE | `/api/v1/assignments/:id` | delete_assignment_controller | Concluído (protegido) |
| GET | `/api/v1/assignments/:id/submissions` | list_assignment_submissions_controller| Concluído (protegido) |
| POST | `/api/v1/assignments/:id/submissions` | submit_assignment_controller | Concluído (protegido) |
| PUT | `/api/v1/assignments/:id/submissions/:submissionId` | grade_submission_controller | Concluído (protegido) |

### Organização de Rotas

As rotas foram organizadas em funções separadas para melhor manutenção:

```typescript
// start/routes.ts

// API ROUTE FUNCTIONS
function registerAuthApiRoutes() { ... }
function registerSchoolApiRoutes() { ... }
function registerCourseApiRoutes() { ... }
function registerLevelApiRoutes() { ... }
function registerClassApiRoutes() { ... }
function registerSubjectApiRoutes() { ... }
function registerTeacherApiRoutes() { ... }
function registerExamApiRoutes() { ... }
function registerAttendanceApiRoutes() { ... }
function registerAssignmentApiRoutes() { ... }
// ... etc

// PAGE ROUTE FUNCTIONS (Inertia)
function registerPageRoutes() { ... }

// REGISTER ALL ROUTES
registerPageRoutes()

router.group(() => {
  registerAuthApiRoutes()
  registerSchoolApiRoutes()
  // ... etc
}).prefix('/api/v1')
```

---

## Fase 7: Financeiro

### Models Utilizados (já existiam)

- [x] `StudentPayment` - Pagamentos dos alunos
- [x] `StudentBalanceTransaction` - Transações de saldo do aluno
- [x] `Contract` - Contratos de matrícula
- [x] `ContractPaymentDay` - Dias de pagamento dos contratos
- [x] `ContractInterestConfig` - Configuração de juros
- [x] `ContractEarlyDiscount` - Descontos por antecipação

### Validators Criados

- [x] `student_payment.ts` - createStudentPaymentValidator, updateStudentPaymentValidator, listStudentPaymentsValidator, markPaymentAsPaidValidator
- [x] `student_balance_transaction.ts` - createStudentBalanceTransactionValidator, listStudentBalanceTransactionsValidator
- [x] `contract.ts` - Atualizado com listContractsValidator

### Controllers Criados (26 total)

**Student Payments (7):**

- [x] `student_payments/list_student_payments_controller.ts`
- [x] `student_payments/show_student_payment_controller.ts`
- [x] `student_payments/create_student_payment_controller.ts`
- [x] `student_payments/update_student_payment_controller.ts`
- [x] `student_payments/cancel_student_payment_controller.ts`
- [x] `student_payments/mark_payment_as_paid_controller.ts`
- [x] `student_payments/list_student_payments_by_student_controller.ts`

**Student Balance Transactions (5):**

- [x] `student_balance_transactions/list_student_balance_transactions_controller.ts`
- [x] `student_balance_transactions/show_student_balance_transaction_controller.ts`
- [x] `student_balance_transactions/create_student_balance_transaction_controller.ts`
- [x] `student_balance_transactions/list_student_balance_by_student_controller.ts`
- [x] `student_balance_transactions/get_student_balance_controller.ts`

**Contract Nested Resources (14):**

- [x] `contracts/list_contract_payment_days_controller.ts`
- [x] `contracts/add_contract_payment_day_controller.ts`
- [x] `contracts/remove_contract_payment_day_controller.ts`
- [x] `contracts/show_contract_interest_config_controller.ts`
- [x] `contracts/update_contract_interest_config_controller.ts`
- [x] `contracts/list_contract_early_discounts_controller.ts`
- [x] `contracts/add_contract_early_discount_controller.ts`
- [x] `contracts/update_contract_early_discount_controller.ts`
- [x] `contracts/remove_contract_early_discount_controller.ts`

### Endpoints Implementados

**Student Payments:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------- | ----------------------------------------- | --------------------- |
| GET | `/api/v1/student-payments` | list_student_payments_controller | Concluído (protegido) |
| POST | `/api/v1/student-payments` | create_student_payment_controller | Concluído (protegido) |
| GET | `/api/v1/student-payments/:id` | show_student_payment_controller | Concluído (protegido) |
| PUT | `/api/v1/student-payments/:id` | update_student_payment_controller | Concluído (protegido) |
| POST | `/api/v1/student-payments/:id/cancel` | cancel_student_payment_controller | Concluído (protegido) |
| POST | `/api/v1/student-payments/:id/mark-paid` | mark_payment_as_paid_controller | Concluído (protegido) |
| POST | `/api/v1/student-payments/:id/asaas-charge` | create_student_payment_asaas_charge_controller | Concluído (protegido) |
| POST | `/api/v1/student-payments/:id/send-boleto` | send_student_payment_boleto_email_controller | Concluído (protegido) |
| GET | `/api/v1/student-payments/:id/boleto` | get_student_payment_boleto_controller | Concluído (protegido) |
| POST | `/api/v1/asaas/webhook` | asaas_webhook_controller | Concluído |
| GET | `/api/v1/students/:studentId/payments` | list_student_payments_by_student_controller | Concluído (protegido) |

**Student Balance Transactions:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------------------- | --------------------------------------------- | --------------------- |
| GET | `/api/v1/student-balance-transactions` | list_student_balance_transactions_controller | Concluído (protegido) |
| POST | `/api/v1/student-balance-transactions` | create_student_balance_transaction_controller | Concluído (protegido) |
| GET | `/api/v1/student-balance-transactions/:id` | show_student_balance_transaction_controller | Concluído (protegido) |
| GET | `/api/v1/students/:studentId/balance` | get_student_balance_controller | Concluído (protegido) |
| GET | `/api/v1/students/:studentId/balance-transactions` | list_student_balance_by_student_controller | Concluído (protegido) |

**Contract Payment Days (nested):**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------------- | --------------------------------------- | --------------------- |
| GET | `/api/v1/contracts/:contractId/payment-days` | list_contract_payment_days_controller | Concluído (protegido) |
| POST | `/api/v1/contracts/:contractId/payment-days` | add_contract_payment_day_controller | Concluído (protegido) |
| DELETE | `/api/v1/contracts/:contractId/payment-days/:id` | remove_contract_payment_day_controller | Concluído (protegido) |

**Contract Interest Config (nested):**
| Método | Rota | Controller | Status |
| ------ | --------------------------------------------- | ----------------------------------------- | --------------------- |
| GET | `/api/v1/contracts/:contractId/interest-config` | show_contract_interest_config_controller | Concluído (protegido) |
| PUT | `/api/v1/contracts/:contractId/interest-config` | update_contract_interest_config_controller | Concluído (protegido) |

**Contract Early Discounts (nested):**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------------------- | ------------------------------------------ | --------------------- |
| GET | `/api/v1/contracts/:contractId/early-discounts` | list_contract_early_discounts_controller | Concluído (protegido) |
| POST | `/api/v1/contracts/:contractId/early-discounts` | add_contract_early_discount_controller | Concluído (protegido) |
| PUT | `/api/v1/contracts/:contractId/early-discounts/:id` | update_contract_early_discount_controller | Concluído (protegido) |
| DELETE | `/api/v1/contracts/:contractId/early-discounts/:id` | remove_contract_early_discount_controller | Concluído (protegido) |

### Organização de Rotas

As rotas financeiras foram organizadas em funções separadas:

```typescript
// start/routes.ts

// Novas funções de rotas
function registerStudentPaymentApiRoutes() { ... }
function registerStudentBalanceTransactionApiRoutes() { ... }

// Contract routes agora incluem recursos aninhados
function registerContractApiRoutes() {
  // CRUD básico
  // + Payment Days
  // + Interest Config
  // + Early Discounts
}

// Student routes expandidas
function registerStudentApiRoutes() {
  // CRUD básico
  // + /:studentId/payments
  // + /:studentId/balance
  // + /:studentId/balance-transactions
}
```

### Funcionalidades Implementadas

**Gestão de Pagamentos:**

- CRUD completo de pagamentos de alunos
- Filtros por status, tipo, mês, ano, aluno, contrato
- Marcar pagamento como pago com gateway opcional
- Cancelar pagamentos
- Listagem por aluno

**Tipos de Pagamento:**

- `ENROLLMENT` - Matrícula
- `TUITION` - Mensalidade
- `CANTEEN` - Cantina
- `COURSE` - Curso
- `AGREEMENT` - Acordo
- `STUDENT_LOAN` - Empréstimo estudantil
- `OTHER` - Outros

**Status de Pagamento:**

- `NOT_PAID` - Não pago
- `PENDING` - Pendente
- `PAID` - Pago
- `OVERDUE` - Atrasado
- `CANCELLED` - Cancelado
- `FAILED` - Falhou

**Gestão de Saldo do Aluno:**

- Transações de saldo (recarga, compras, reembolsos)
- Cálculo automático de saldo anterior e novo
- Consulta de saldo atual
- Histórico de transações por aluno

**Tipos de Transação:**

- `TOP_UP` - Recarga de saldo
- `CANTEEN_PURCHASE` - Compra na cantina
- `STORE_PURCHASE` - Compra na loja
- `REFUND` - Reembolso
- `ADJUSTMENT` - Ajuste

**Configurações de Contrato:**

- Dias de pagamento personalizáveis
- Configuração de juros por atraso (CRUD completo)
- Descontos por antecipação (CRUD completo)

### Observações Importantes

**Estrutura de Pagamentos:**

```typescript
// Criar pagamento
POST /api/v1/student-payments
{
  "studentId": "abc123",
  "amount": 50000,           // em centavos (R$ 500,00)
  "totalAmount": 50000,
  "month": 1,
  "year": 2024,
  "type": "TUITION",
  "dueDate": "2024-01-10",
  "contractId": "contract123"
}

// Marcar como pago
POST /api/v1/student-payments/:id/mark-paid
{
  "paidAt": "2024-01-08",
  "paymentGateway": "ASAAS",
  "paymentGatewayId": "pay_abc123"
}
```

**Estrutura de Saldo:**

```typescript
// Adicionar saldo (recarga)
POST /api/v1/student-balance-transactions
{
  "studentId": "abc123",
  "amount": 10000,           // R$ 100,00
  "type": "TOP_UP",
  "description": "Recarga via PIX"
}

// Consultar saldo
GET /api/v1/students/:studentId/balance
// Retorna: { "studentId": "abc123", "balance": 10000 }
```

### Integrações Pendentes

- [x] Asaas (gateway de pagamentos) - Criar service layer
- [x] Webhooks de pagamento - Endpoints para receber notificações
- [x] Envio de boletos por email
- [x] Geração de segunda via de boleto

---

## Fase 8: Cantina

### Migrations Existentes

As migrations já existiam no projeto:

- [x] `create_canteens_table` - Cantinas (school_id, responsible_user_id)
- [x] `create_canteen_items_table` - Produtos (name, price, category, stock)
- [x] `create_canteen_purchases_table` - Compras (user_id, total_amount, payment_method, status)
- [x] `create_canteen_item_purchased_table` - Itens comprados (quantity, unit_price, total_price)
- [x] `create_canteen_meals_table` - Refeições da cantina
- [x] `create_canteen_meal_reservations_table` - Reservas de refeições
- [x] `create_canteen_monthly_transfers_table` - Transferências mensais

### Models Criados

- [x] `Canteen` - Cantina da escola
- [x] `CanteenItem` - Produtos/itens da cantina
- [x] `CanteenPurchase` - Compras realizadas
- [x] `CanteenItemPurchased` - Itens de cada compra
- [x] `CanteenMeal` - Refeições da cantina
- [x] `CanteenMealReservation` - Reservas de refeições
- [x] `CanteenMonthlyTransfer` - Transferências mensais

### Validators Criados

- [x] `canteen.ts`:
  - createCanteenValidator, updateCanteenValidator, listCanteensValidator
  - createCanteenItemValidator, updateCanteenItemValidator, listCanteenItemsValidator
  - createCanteenPurchaseValidator, listCanteenPurchasesValidator, updateCanteenPurchaseStatusValidator
  - createCanteenMealValidator, updateCanteenMealValidator, listCanteenMealsValidator
  - createCanteenMealReservationValidator, listCanteenMealReservationsValidator, updateCanteenMealReservationStatusValidator
  - getCanteenReportValidator
  - createCanteenMonthlyTransferValidator, listCanteenMonthlyTransfersValidator, updateCanteenMonthlyTransferStatusValidator

### Controllers Criados (33 total)

**Canteens (5):**

- [x] `canteens/list_canteens_controller.ts`
- [x] `canteens/show_canteen_controller.ts`
- [x] `canteens/create_canteen_controller.ts`
- [x] `canteens/update_canteen_controller.ts`
- [x] `canteens/delete_canteen_controller.ts`

**Canteen Items (7):**

- [x] `canteen_items/list_canteen_items_controller.ts`
- [x] `canteen_items/show_canteen_item_controller.ts`
- [x] `canteen_items/create_canteen_item_controller.ts`
- [x] `canteen_items/update_canteen_item_controller.ts`
- [x] `canteen_items/delete_canteen_item_controller.ts`
- [x] `canteen_items/list_items_by_canteen_controller.ts`
- [x] `canteen_items/toggle_canteen_item_active_controller.ts`

**Canteen Meals (5):**

- [x] `canteen_meals/list_canteen_meals_controller.ts`
- [x] `canteen_meals/show_canteen_meal_controller.ts`
- [x] `canteen_meals/create_canteen_meal_controller.ts`
- [x] `canteen_meals/update_canteen_meal_controller.ts`
- [x] `canteen_meals/delete_canteen_meal_controller.ts`

**Canteen Meal Reservations (5):**

- [x] `canteen_meal_reservations/list_canteen_meal_reservations_controller.ts`
- [x] `canteen_meal_reservations/show_canteen_meal_reservation_controller.ts`
- [x] `canteen_meal_reservations/create_canteen_meal_reservation_controller.ts`
- [x] `canteen_meal_reservations/update_canteen_meal_reservation_status_controller.ts`
- [x] `canteen_meal_reservations/delete_canteen_meal_reservation_controller.ts`

**Canteen Reports (1):**

- [x] `canteen_reports/get_canteen_report_controller.ts`

**Canteen Monthly Transfers (4):**

- [x] `canteen_monthly_transfers/list_canteen_monthly_transfers_controller.ts`
- [x] `canteen_monthly_transfers/show_canteen_monthly_transfer_controller.ts`
- [x] `canteen_monthly_transfers/create_canteen_monthly_transfer_controller.ts`
- [x] `canteen_monthly_transfers/update_canteen_monthly_transfer_status_controller.ts`

**Canteen Purchases (6):**

- [x] `canteen_purchases/list_canteen_purchases_controller.ts`
- [x] `canteen_purchases/show_canteen_purchase_controller.ts`
- [x] `canteen_purchases/create_canteen_purchase_controller.ts`
- [x] `canteen_purchases/update_canteen_purchase_status_controller.ts`
- [x] `canteen_purchases/cancel_canteen_purchase_controller.ts`
- [x] `canteen_purchases/list_purchases_by_user_controller.ts`

### Endpoints Implementados

**Canteens:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------ | ----------------------------- | --------------------- |
| GET | `/api/v1/canteens` | list_canteens_controller | Concluído (protegido) |
| POST | `/api/v1/canteens` | create_canteen_controller | Concluído (protegido) |
| GET | `/api/v1/canteens/:id` | show_canteen_controller | Concluído (protegido) |
| PUT | `/api/v1/canteens/:id` | update_canteen_controller | Concluído (protegido) |
| DELETE | `/api/v1/canteens/:id` | delete_canteen_controller | Concluído (protegido) |
| GET | `/api/v1/canteens/:canteenId/items` | list_items_by_canteen_controller | Concluído (protegido) |

**Canteen Items:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------- | ----------------------------------- | --------------------- |
| GET | `/api/v1/canteen-items` | list_canteen_items_controller | Concluído (protegido) |
| POST | `/api/v1/canteen-items` | create_canteen_item_controller | Concluído (protegido) |
| GET | `/api/v1/canteen-items/:id` | show_canteen_item_controller | Concluído (protegido) |
| PUT | `/api/v1/canteen-items/:id` | update_canteen_item_controller | Concluído (protegido) |
| DELETE | `/api/v1/canteen-items/:id` | delete_canteen_item_controller | Concluído (protegido) |
| POST | `/api/v1/canteen-items/:id/toggle-active` | toggle_canteen_item_active_controller | Concluído (protegido) |

**Canteen Meals:**
| Método | Rota | Controller | Status |
| ------ | -------------------------------- | ----------------------------------- | --------------------- |
| GET | `/api/v1/canteen-meals` | list_canteen_meals_controller | Concluído (protegido) |
| POST | `/api/v1/canteen-meals` | create_canteen_meal_controller | Concluído (protegido) |
| GET | `/api/v1/canteen-meals/:id` | show_canteen_meal_controller | Concluído (protegido) |
| PUT | `/api/v1/canteen-meals/:id` | update_canteen_meal_controller | Concluído (protegido) |
| DELETE | `/api/v1/canteen-meals/:id` | delete_canteen_meal_controller | Concluído (protegido) |

**Canteen Meal Reservations:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------------- | ----------------------------------------------- | --------------------- |
| GET | `/api/v1/canteen-meal-reservations` | list_canteen_meal_reservations_controller | Concluído (protegido) |
| POST | `/api/v1/canteen-meal-reservations` | create_canteen_meal_reservation_controller | Concluído (protegido) |
| GET | `/api/v1/canteen-meal-reservations/:id` | show_canteen_meal_reservation_controller | Concluído (protegido) |
| PUT | `/api/v1/canteen-meal-reservations/:id/status` | update_canteen_meal_reservation_status_controller | Concluído (protegido) |
| DELETE | `/api/v1/canteen-meal-reservations/:id` | delete_canteen_meal_reservation_controller | Concluído (protegido) |

**Canteen Reports:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------ | ------------------------------------- | --------------------- |
| GET | `/api/v1/canteen-reports` | get_canteen_report_controller | Concluído (protegido) |

**Canteen Monthly Transfers:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------------- | ----------------------------------------------- | --------------------- |
| GET | `/api/v1/canteen-monthly-transfers` | list_canteen_monthly_transfers_controller | Concluído (protegido) |
| POST | `/api/v1/canteen-monthly-transfers` | create_canteen_monthly_transfer_controller | Concluído (protegido) |
| GET | `/api/v1/canteen-monthly-transfers/:id` | show_canteen_monthly_transfer_controller | Concluído (protegido) |
| PUT | `/api/v1/canteen-monthly-transfers/:id/status` | update_canteen_monthly_transfer_status_controller | Concluído (protegido) |

**Canteen Purchases:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------------- | --------------------------------------- | --------------------- |
| GET | `/api/v1/canteen-purchases` | list_canteen_purchases_controller | Concluído (protegido) |
| POST | `/api/v1/canteen-purchases` | create_canteen_purchase_controller | Concluído (protegido) |
| GET | `/api/v1/canteen-purchases/:id` | show_canteen_purchase_controller | Concluído (protegido) |
| PUT | `/api/v1/canteen-purchases/:id/status` | update_canteen_purchase_status_controller | Concluído (protegido) |
| POST | `/api/v1/canteen-purchases/:id/cancel` | cancel_canteen_purchase_controller | Concluído (protegido) |
| GET | `/api/v1/users/:userId/canteen-purchases` | list_purchases_by_user_controller | Concluído (protegido) |

### Organização de Rotas

```typescript
// start/routes.ts

function registerCanteenApiRoutes() { ... }
function registerCanteenReportApiRoutes() { ... }
function registerCanteenItemApiRoutes() { ... }
function registerCanteenMealApiRoutes() { ... }
function registerCanteenMealReservationApiRoutes() { ... }
function registerCanteenPurchaseApiRoutes() { ... }

// User routes expandidas com:
// GET /users/:userId/canteen-purchases
```

### Funcionalidades Implementadas

**Gestão de Cantinas:**

- CRUD completo de cantinas por escola
- Associação com usuário responsável
- Listagem de produtos por cantina

**Gestão de Produtos:**

- CRUD completo de itens/produtos
- Controle de estoque (opcional - null = ilimitado)
- Categorização de produtos
- Toggle de ativo/inativo
- Preços em centavos

**Gestão de Compras:**

- Criação de compras com múltiplos itens
- Cálculo automático de total
- Métodos de pagamento: BALANCE, CASH, CARD, PIX
- Status de compra: PENDING, PAID, CANCELLED
- Cancelamento de compras
- Histórico por usuário

### Estrutura de Dados

**Criar Compra:**

```typescript
POST /api/v1/canteen-purchases
{
  "userId": "abc123",
  "canteenId": "canteen456",
  "paymentMethod": "BALANCE",
  "items": [
    { "canteenItemId": "item1", "quantity": 2 },
    { "canteenItemId": "item2", "quantity": 1 }
  ]
}
```

**Criar Item:**

```typescript
POST /api/v1/canteen-items
{
  "canteenId": "canteen456",
  "name": "Refrigerante",
  "price": 500,           // R$ 5,00 em centavos
  "category": "Bebidas",
  "stockQuantity": 100    // null = ilimitado
}
```

### Integrações com Módulos Existentes

- **StudentBalanceTransaction**: Compras com `paymentMethod: BALANCE` podem ser integradas
- **User**: Compras vinculadas ao usuário (não apenas estudantes)

### Funcionalidades Pendentes (Avançadas)

- [x] Integração com StudentBalance para débito automático
- [x] Refeições e reservas (CanteenMeal, CanteenMealReservation)
- [ ] Restrições de categoria por aluno
- [x] Relatórios financeiros da cantina
- [ ] Transferências mensais (CanteenMonthlyTransfer)

---

## Fase 9: Gamificação

### Migrations Existentes

As migrations já existiam no projeto:

- [x] `create_student_gamifications_table` - Perfil de gamificação do aluno
- [x] `create_achievements_table` - Conquistas/achievements
- [x] `create_gamification_events_table` - Eventos de gamificação
- [x] `create_store_items_table` - Itens da loja de pontos
- [x] `create_store_orders_table` - Pedidos da loja
- [x] `create_leaderboards_table` - Placar de líderes
- [x] `create_leaderboard_entries_table` - Entradas no placar

### Models Criados

- [x] `StudentGamification` - Perfil de gamificação do aluno (pontos, nível, streak)
- [x] `Achievement` - Conquistas desbloqueáveis
- [x] `GamificationEvent` - Eventos que disparam ações de gamificação
- [x] `StoreItem` - Itens que podem ser comprados com pontos
- [x] `StoreOrder` - Pedidos da loja de pontos
- [x] `StoreOrderItem` - Itens de cada pedido
- [x] `Leaderboard` - Rankings configuráveis
- [x] `LeaderboardEntry` - Entradas nos rankings

### Validators Criados

- [x] `gamification.ts`:
  - **Achievements**: createAchievementValidator, updateAchievementValidator, listAchievementsValidator
  - **Store Items**: createStoreItemValidator, updateStoreItemValidator, listStoreItemsValidator
  - **Store Orders**: createStoreOrderValidator, listStoreOrdersValidator, updateStoreOrderStatusValidator, rejectStoreOrderValidator
  - **Events**: createGamificationEventValidator, listGamificationEventsValidator
  - **Student Gamification**: addPointsValidator, listStudentGamificationsValidator
  - **Leaderboards**: createLeaderboardValidator, updateLeaderboardValidator, listLeaderboardsValidator, listLeaderboardEntriesValidator
  - **Analytics**: getGamificationOverviewValidator, getPointsRankingValidator, getStudentStatsValidator

### Controllers Criados (32 total)

**Achievements (6):**

- [x] `achievements/list_achievements_controller.ts`
- [x] `achievements/show_achievement_controller.ts`
- [x] `achievements/create_achievement_controller.ts`
- [x] `achievements/update_achievement_controller.ts`
- [x] `achievements/delete_achievement_controller.ts`
- [x] `achievements/unlock_achievement_controller.ts`

**Store Items (6):**

- [x] `store_items/list_store_items_controller.ts`
- [x] `store_items/show_store_item_controller.ts`
- [x] `store_items/create_store_item_controller.ts`
- [x] `store_items/update_store_item_controller.ts`
- [x] `store_items/delete_store_item_controller.ts`
- [x] `store_items/toggle_store_item_active_controller.ts`

**Store Orders (7):**

- [x] `store_orders/list_store_orders_controller.ts`
- [x] `store_orders/show_store_order_controller.ts`
- [x] `store_orders/create_store_order_controller.ts`
- [x] `store_orders/approve_store_order_controller.ts`
- [x] `store_orders/reject_store_order_controller.ts`
- [x] `store_orders/deliver_store_order_controller.ts`
- [x] `store_orders/cancel_store_order_controller.ts`

**Student Gamifications (6):**

- [x] `student_gamifications/list_student_gamifications_controller.ts`
- [x] `student_gamifications/show_student_gamification_controller.ts`
- [x] `student_gamifications/create_student_gamification_controller.ts`
- [x] `student_gamifications/add_points_controller.ts`
- [x] `student_gamifications/get_student_stats_controller.ts`
- [x] `student_gamifications/get_points_ranking_controller.ts`

**Leaderboards (6):**

- [x] `leaderboards/list_leaderboards_controller.ts`
- [x] `leaderboards/show_leaderboard_controller.ts`
- [x] `leaderboards/create_leaderboard_controller.ts`
- [x] `leaderboards/update_leaderboard_controller.ts`
- [x] `leaderboards/delete_leaderboard_controller.ts`
- [x] `leaderboards/list_leaderboard_entries_controller.ts`

**Gamification Events (4):**

- [x] `gamification_events/list_gamification_events_controller.ts`
- [x] `gamification_events/show_gamification_event_controller.ts`
- [x] `gamification_events/create_gamification_event_controller.ts`
- [x] `gamification_events/retry_gamification_event_controller.ts`

### Job Queue Setup (@boringnode/queue)

**Arquivos de Configuração:**

- [x] `config/queue.ts` - Configuração do queue (PostgreSQL/Knex adapter)
- [x] `app/services/queue_service.ts` - Singleton do queue manager
- [x] `commands/queue_work.ts` - Comando Ace para rodar o worker

**Jobs Criados:**

- [x] `app/jobs/gamification/process_gamification_event_job.ts` - Processa eventos e desbloqueia achievements
- [x] `app/jobs/gamification/update_streaks_job.ts` - Atualiza streaks diariamente
- [x] `app/jobs/gamification/retry_pending_events_job.ts` - Reenfileira eventos pendentes/falhos

**Dependência Adicionada:**

```json
"@boringnode/queue": "^0.5.0"
```

**Alias Adicionado no package.json:**

```json
"#jobs/*": "./app/jobs/*.js"
```

### Endpoints Implementados

**Achievements:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------ | ------------------------------ | --------------------- |
| GET | `/api/v1/achievements` | list_achievements_controller | Concluído (protegido) |
| POST | `/api/v1/achievements` | create_achievement_controller | Concluído (protegido) |
| GET | `/api/v1/achievements/:id` | show_achievement_controller | Concluído (protegido) |
| PUT | `/api/v1/achievements/:id` | update_achievement_controller | Concluído (protegido) |
| DELETE | `/api/v1/achievements/:id` | delete_achievement_controller | Concluído (protegido) |
| POST | `/api/v1/achievements/:id/unlock` | unlock_achievement_controller | Concluído (protegido) |

**Store Items:**
| Método | Rota | Controller | Status |
| ------ | ---------------------------------------- | ---------------------------------- | --------------------- |
| GET | `/api/v1/store-items` | list_store_items_controller | Concluído (protegido) |
| POST | `/api/v1/store-items` | create_store_item_controller | Concluído (protegido) |
| GET | `/api/v1/store-items/:id` | show_store_item_controller | Concluído (protegido) |
| PUT | `/api/v1/store-items/:id` | update_store_item_controller | Concluído (protegido) |
| DELETE | `/api/v1/store-items/:id` | delete_store_item_controller | Concluído (protegido) |
| PATCH | `/api/v1/store-items/:id/toggle-active` | toggle_store_item_active_controller| Concluído (protegido) |

**Store Orders:**
| Método | Rota | Controller | Status |
| ------ | ---------------------------------- | ------------------------------- | --------------------- |
| GET | `/api/v1/store-orders` | list_store_orders_controller | Concluído (protegido) |
| POST | `/api/v1/store-orders` | create_store_order_controller | Concluído (protegido) |
| GET | `/api/v1/store-orders/:id` | show_store_order_controller | Concluído (protegido) |
| POST | `/api/v1/store-orders/:id/approve` | approve_store_order_controller | Concluído (protegido) |
| POST | `/api/v1/store-orders/:id/reject` | reject_store_order_controller | Concluído (protegido) |
| POST | `/api/v1/store-orders/:id/deliver` | deliver_store_order_controller | Concluído (protegido) |
| POST | `/api/v1/store-orders/:id/cancel` | cancel_store_order_controller | Concluído (protegido) |

**Student Gamifications:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------------------- | -------------------------------------- | --------------------- |
| GET | `/api/v1/student-gamifications` | list_student_gamifications_controller | Concluído (protegido) |
| POST | `/api/v1/student-gamifications` | create_student_gamification_controller | Concluído (protegido) |
| GET | `/api/v1/student-gamifications/:id` | show_student_gamification_controller | Concluído (protegido) |
| POST | `/api/v1/student-gamifications/add-points` | add_points_controller | Concluído (protegido) |
| GET | `/api/v1/student-gamifications/ranking` | get_points_ranking_controller | Concluído (protegido) |
| GET | `/api/v1/students/:studentId/gamification/stats` | get_student_stats_controller | Concluído (protegido) |

**Leaderboards:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------- | ----------------------------------- | --------------------- |
| GET | `/api/v1/leaderboards` | list_leaderboards_controller | Concluído (protegido) |
| POST | `/api/v1/leaderboards` | create_leaderboard_controller | Concluído (protegido) |
| GET | `/api/v1/leaderboards/:id` | show_leaderboard_controller | Concluído (protegido) |
| PUT | `/api/v1/leaderboards/:id` | update_leaderboard_controller | Concluído (protegido) |
| DELETE | `/api/v1/leaderboards/:id` | delete_leaderboard_controller | Concluído (protegido) |
| GET | `/api/v1/leaderboards/:id/entries`| list_leaderboard_entries_controller | Concluído (protegido) |

**Gamification Events:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------------- | ------------------------------------- | --------------------- |
| GET | `/api/v1/gamification-events` | list_gamification_events_controller | Concluído (protegido) |
| POST | `/api/v1/gamification-events` | create_gamification_event_controller | Concluído (protegido) |
| GET | `/api/v1/gamification-events/:id` | show_gamification_event_controller | Concluído (protegido) |
| POST | `/api/v1/gamification-events/:id/retry` | retry_gamification_event_controller | Concluído (protegido) |

### Funcionalidades Implementadas

**Sistema de Pontos:**

- Adicionar/remover pontos manualmente
- Tipos de transação: EARNED, SPENT, ADJUSTED, PENALTY, BONUS, REFUND
- Cálculo automático de nível (level \* 100 pontos por nível)
- Sistema de streaks (sequência de dias ativos)

**Conquistas (Achievements):**

- CRUD completo com soft delete
- Categorias: ACADEMIC, ATTENDANCE, BEHAVIOR, SOCIAL, SPECIAL
- Raridades: COMMON, RARE, EPIC, LEGENDARY
- Critérios em JSON para avaliação automática
- Conquistas secretas, recorrentes e com limite de desbloqueios

**Loja de Pontos:**

- Itens comprável com pontos ou dinheiro (híbrido)
- Modos de pagamento: POINTS_ONLY, MONEY_ONLY, HYBRID
- Controle de estoque
- Limite por aluno (diário, semanal, mensal, etc.)
- Fluxo de pedido: PENDING → APPROVED → PREPARING → READY → DELIVERED

**Rankings (Leaderboards):**

- Tipos: POINTS, ACHIEVEMENTS, STREAK, CUSTOM
- Escopos: SCHOOL, CLASS, LEVEL, GLOBAL
- Períodos: DAILY, WEEKLY, MONTHLY, SEMESTER, ANNUAL, ALL_TIME

**Eventos de Gamificação:**

- Tipos: ASSIGNMENT*\*, ATTENDANCE*\_, GRADE\__, BEHAVIOR*\*, PARTICIPATION*_, STORE\_\_, POINTS*\*, ACHIEVEMENT*\*
- Status: PENDING, PROCESSING, PROCESSED, FAILED
- Retry automático de eventos falhos
- Processamento assíncrono via jobs

### Comandos do Worker

```bash
# Instalar dependência
npm install @boringnode/queue

# Rodar o worker de jobs
node ace queue:work

# Rodar worker com concorrência customizada
node ace queue:work --concurrency=10

# Rodar worker para filas específicas
node ace queue:work --queues=default,gamification
```

### Estrutura de Dados

**Criar Achievement:**

```typescript
POST /api/v1/achievements
{
  "name": "Primeiro Dia de Aula",
  "description": "Complete seu primeiro dia com 100% de presença",
  "points": 50,
  "category": "ATTENDANCE",
  "rarity": "COMMON",
  "criteria": {
    "eventType": "ATTENDANCE_PRESENT",
    "conditions": { "count": 1 }
  },
  "schoolId": "school123"
}
```

**Criar Store Item:**

```typescript
POST /api/v1/store-items
{
  "name": "Lanche Especial",
  "description": "Um lanche da cantina",
  "price": 500,
  "paymentMode": "POINTS_ONLY",
  "category": "CANTEEN_FOOD",
  "schoolId": "school123",
  "totalStock": 50,
  "requiresApproval": true
}
```

**Criar Evento:**

```typescript
POST /api/v1/gamification-events
{
  "type": "ATTENDANCE_PRESENT",
  "entityType": "Attendance",
  "entityId": "attendance123",
  "studentId": "student456",
  "metadata": {
    "date": "2024-01-15",
    "classId": "class789"
  }
}
```

---

## Fase 10: Admin/Platform

### Migrations Criadas

- [x] `create_platform_settings_table` - Configurações globais da plataforma
- [x] `create_payment_settings_table` - Configurações de pagamento por escola/rede
- [x] `create_subscription_plans_table` - Planos de assinatura disponíveis
- [x] `create_subscriptions_table` - Assinaturas de escolas/redes
- [x] `create_subscription_invoices_table` - Faturas das assinaturas
- [x] `create_subscription_status_history_table` - Histórico de mudanças de status
- [x] `create_subscription_email_notifications_table` - Notificações de email enviadas
- [x] `create_school_usage_metrics_table` - Métricas de uso mensais

### Models Criados

- [x] `PlatformSettings` - Configurações globais (trial days, price per student)
- [x] `PaymentSettings` - Config de pagamento por escola ou rede
- [x] `SubscriptionPlan` - Planos de assinatura (FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM)
- [x] `Subscription` - Assinatura de escola/rede com billing cycle e status
- [x] `SubscriptionInvoice` - Faturas mensais das assinaturas
- [x] `SubscriptionStatusHistory` - Auditoria de mudanças de status
- [x] `SubscriptionEmailNotification` - Tracking de emails enviados
- [x] `SchoolUsageMetrics` - Métricas de uso por escola/mês

### Validators Criados

- [x] `subscription.ts`:
  - **Platform Settings**: updatePlatformSettingsValidator
  - **Payment Settings**: createPaymentSettingsValidator, updatePaymentSettingsValidator
  - **Plans**: createSubscriptionPlanValidator, updateSubscriptionPlanValidator, listSubscriptionPlansValidator
  - **Subscriptions**: createSubscriptionValidator, updateSubscriptionValidator, listSubscriptionsValidator, changeSubscriptionStatusValidator
  - **Invoices**: createSubscriptionInvoiceValidator, updateSubscriptionInvoiceValidator, listSubscriptionInvoicesValidator
  - **Metrics**: getSchoolUsageMetricsValidator, updateSchoolUsageMetricsValidator
  - **Admin**: cancelSubscriptionValidator, pauseSubscriptionValidator, reactivateSubscriptionValidator

### Controllers Criados (22 total)

**Platform Settings (2):**

- [x] `platform_settings/show_platform_settings_controller.ts`
- [x] `platform_settings/update_platform_settings_controller.ts`

**Subscription Plans (5):**

- [x] `subscription_plans/list_subscription_plans_controller.ts`
- [x] `subscription_plans/show_subscription_plan_controller.ts`
- [x] `subscription_plans/create_subscription_plan_controller.ts`
- [x] `subscription_plans/update_subscription_plan_controller.ts`
- [x] `subscription_plans/delete_subscription_plan_controller.ts`

**Subscriptions (9):**

- [x] `subscriptions/list_subscriptions_controller.ts`
- [x] `subscriptions/show_subscription_controller.ts`
- [x] `subscriptions/create_subscription_controller.ts`
- [x] `subscriptions/update_subscription_controller.ts`
- [x] `subscriptions/cancel_subscription_controller.ts`
- [x] `subscriptions/pause_subscription_controller.ts`
- [x] `subscriptions/reactivate_subscription_controller.ts`
- [x] `subscriptions/get_school_subscription_controller.ts`
- [x] `subscriptions/get_chain_subscription_controller.ts`

**Subscription Invoices (5):**

- [x] `subscription_invoices/list_subscription_invoices_controller.ts`
- [x] `subscription_invoices/show_subscription_invoice_controller.ts`
- [x] `subscription_invoices/create_subscription_invoice_controller.ts`
- [x] `subscription_invoices/update_subscription_invoice_controller.ts`
- [x] `subscription_invoices/mark_invoice_paid_controller.ts`

**School Usage Metrics (1):**

- [x] `school_usage_metrics/get_school_usage_metrics_controller.ts`

### Endpoints Implementados

**Platform Settings:**
| Método | Rota | Controller | Status |
| ------ | ---------------------------- | ---------------------------------- | --------------------- |
| GET | `/api/v1/platform-settings` | show_platform_settings_controller | Concluído (protegido) |
| PUT | `/api/v1/platform-settings` | update_platform_settings_controller| Concluído (protegido) |

**Subscription Plans:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------- | ------------------------------------ | --------------------- |
| GET | `/api/v1/subscription-plans` | list_subscription_plans_controller | Concluído (protegido) |
| POST | `/api/v1/subscription-plans` | create_subscription_plan_controller | Concluído (protegido) |
| GET | `/api/v1/subscription-plans/:id` | show_subscription_plan_controller | Concluído (protegido) |
| PUT | `/api/v1/subscription-plans/:id` | update_subscription_plan_controller | Concluído (protegido) |
| DELETE | `/api/v1/subscription-plans/:id` | delete_subscription_plan_controller | Concluído (protegido) |

**Subscriptions:**
| Método | Rota | Controller | Status |
| ------ | ------------------------------------------------- | ------------------------------------- | --------------------- |
| GET | `/api/v1/subscriptions` | list_subscriptions_controller | Concluído (protegido) |
| POST | `/api/v1/subscriptions` | create_subscription_controller | Concluído (protegido) |
| GET | `/api/v1/subscriptions/:id` | show_subscription_controller | Concluído (protegido) |
| PUT | `/api/v1/subscriptions/:id` | update_subscription_controller | Concluído (protegido) |
| POST | `/api/v1/subscriptions/:id/cancel` | cancel_subscription_controller | Concluído (protegido) |
| POST | `/api/v1/subscriptions/:id/pause` | pause_subscription_controller | Concluído (protegido) |
| POST | `/api/v1/subscriptions/:id/reactivate` | reactivate_subscription_controller | Concluído (protegido) |
| GET | `/api/v1/schools/:schoolId/subscription` | get_school_subscription_controller | Concluído (protegido) |
| GET | `/api/v1/school-chains/:schoolChainId/subscription` | get_chain_subscription_controller | Concluído (protegido) |

**Subscription Invoices:**
| Método | Rota | Controller | Status |
| ------ | -------------------------------------------- | --------------------------------------- | --------------------- |
| GET | `/api/v1/subscription-invoices` | list_subscription_invoices_controller | Concluído (protegido) |
| POST | `/api/v1/subscription-invoices` | create_subscription_invoice_controller | Concluído (protegido) |
| GET | `/api/v1/subscription-invoices/:id` | show_subscription_invoice_controller | Concluído (protegido) |
| PUT | `/api/v1/subscription-invoices/:id` | update_subscription_invoice_controller | Concluído (protegido) |
| POST | `/api/v1/subscription-invoices/:id/mark-paid`| mark_invoice_paid_controller | Concluído (protegido) |

**School Usage Metrics:**
| Método | Rota | Controller | Status |
| ------ | --------------------------------- | ------------------------------------ | --------------------- |
| GET | `/api/v1/school-usage-metrics` | get_school_usage_metrics_controller | Concluído (protegido) |

### Funcionalidades Implementadas

**Sistema de Assinaturas:**

- Planos com diferentes tiers (FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM)
- Cobrança por aluno ativo
- Ciclos de billing (MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL)
- Status de assinatura (TRIAL, ACTIVE, PAST_DUE, BLOCKED, CANCELED, PAUSED)

**Gestão de Faturas:**

- Faturas mensais por período acadêmico
- Status de fatura (PENDING, PAID, OVERDUE, CANCELED, REFUNDED)
- Tracking de métodos de pagamento

**Auditoria:**

- Histórico de mudanças de status das assinaturas
- Tracking de emails enviados
- Métricas de uso por escola/mês

### Estrutura de Dados

**Criar Plano:**

```typescript
POST /api/v1/subscription-plans
{
  "name": "Plano Básico",
  "tier": "BASIC",
  "monthlyPrice": 1290,
  "maxStudents": 500,
  "features": {
    "canteen": true,
    "gamification": false,
    "reports": "basic"
  }
}
```

**Criar Assinatura:**

```typescript
POST /api/v1/subscriptions
{
  "schoolId": "school123",
  "planId": "plan456",
  "pricePerStudent": 1290,
  "billingCycle": "MONTHLY"
}
```

---

## Fase 11: Frontend Pages (Inertia)

Esta fase envolve a criação das páginas frontend usando Inertia.js + React para substituir o frontend Next.js do projeto original.

### Estrutura de Páginas

```
inertia/pages/
├── admin/
│   └── index.tsx                    # Dashboard Admin Plataforma
├── auth/
│   └── sign-in.tsx                  # Login
├── errors/
│   ├── not_found.tsx                # 404
│   └── server_error.tsx             # 500
├── escola/
│   ├── index.tsx                    # Dashboard Escola
│   ├── periodos-letivos.tsx         # Períodos Letivos
│   ├── administrativo/
│   │   ├── alunos.tsx               # Gestão de Alunos
│   │   ├── contratos.tsx            # Gestão de Contratos
│   │   ├── funcionarios.tsx         # Gestão de Funcionários
│   │   ├── matriculas.tsx           # Gestão de Matrículas
│   │   └── professores.tsx          # Gestão de Professores
│   ├── cantina/
│   │   ├── cardapio.tsx             # Cardápio
│   │   ├── itens.tsx                # Gestão de Itens
│   │   ├── pdv.tsx                  # Ponto de Venda
│   │   ├── pedidos.tsx              # Pedidos
│   │   └── vendas.tsx               # Histórico de Vendas
│   ├── financeiro/
│   │   ├── mensalidades.tsx         # Gestão de Mensalidades
│   │   └── inadimplencia.tsx        # Inadimplência (PENDENTE)
│   ├── pedagogico/
│   │   ├── grade.tsx                # Grade Curricular
│   │   ├── ocorrencias.tsx          # Ocorrências
│   │   └── turmas.tsx               # Gestão de Turmas
│   ├── gamificacao/                 # (PENDENTE)
│   │   └── index.tsx                # Dashboard Gamificação
│   └── configuracoes/               # (PENDENTE)
│       └── index.tsx                # Configurações da Escola
├── responsavel/
│   └── index.tsx                    # Dashboard Responsável
├── dashboard.tsx                    # Dashboard Geral
└── home.tsx                         # Home Page
```

### Páginas Criadas

**Auth & Core:**

- [x] `auth/sign-in.tsx` - Página de login
- [x] `dashboard.tsx` - Dashboard geral
- [x] `home.tsx` - Home page
- [x] `errors/not_found.tsx` - Página 404
- [x] `errors/server_error.tsx` - Página 500

**Admin Plataforma:**

- [x] `admin/index.tsx` - Dashboard do admin da plataforma

**Responsável:**

- [x] `responsavel/index.tsx` - Dashboard do responsável

**Escola - Dashboard:**

- [x] `escola/index.tsx` - Dashboard principal da escola
- [x] `escola/periodos-letivos.tsx` - Gestão de períodos letivos

**Escola - Administrativo:**

- [x] `escola/administrativo/alunos.tsx` - Listagem e gestão de alunos
- [x] `escola/administrativo/professores.tsx` - Listagem e gestão de professores
- [x] `escola/administrativo/funcionarios.tsx` - Listagem e gestão de funcionários
- [x] `escola/administrativo/matriculas.tsx` - Gestão de matrículas
- [x] `escola/administrativo/contratos.tsx` - Gestão de contratos
- [x] `escola/administrativo/bolsas.tsx` - Gestão de bolsas
- [x] `escola/administrativo/parceiros.tsx` - Gestão de parceiros
- [x] `escola/administrativo/materias.tsx` - Gestão de matérias
- [x] `escola/administrativo/periodos-letivos.tsx` - Gestão de períodos letivos (admin)
- [x] `escola/administrativo/periodos-letivos/novo-periodo-letivo.tsx` - Criar período letivo
- [x] `escola/administrativo/folha-de-ponto.tsx` - Folha de ponto

**Escola - Pedagógico:**

- [x] `escola/pedagogico/turmas.tsx` - Gestão de turmas
- [x] `escola/pedagogico/grade.tsx` - Grade curricular
- [x] `escola/pedagogico/ocorrencias.tsx` - Ocorrências disciplinares

**Escola - Cantina:**

- [x] `escola/cantina/itens.tsx` - Gestão de itens/produtos
- [x] `escola/cantina/cardapio.tsx` - Cardápio
- [x] `escola/cantina/pdv.tsx` - Ponto de venda
- [x] `escola/cantina/pedidos.tsx` - Pedidos
- [x] `escola/cantina/vendas.tsx` - Histórico de vendas

**Escola - Financeiro:**

- [x] `escola/financeiro/mensalidades.tsx` - Gestão de mensalidades
- [x] `escola/financeiro/inadimplencia.tsx` - Relatório de inadimplência

**Escola - Gamificação:**

- [x] `escola/gamificacao/index.tsx` - Dashboard de gamificação
- [x] `escola/gamificacao/rankings.tsx` - Rankings
- [x] `escola/gamificacao/conquistas.tsx` - Conquistas/Badges
- [x] `escola/gamificacao/recompensas.tsx` - Recompensas

**Escola - Configurações:**

- [x] `escola/configuracoes/index.tsx` - Configurações gerais da escola

### Containers Criados

```
inertia/containers/
├── admin-stats-container.tsx        # Stats do dashboard admin
├── canteen-items-container.tsx      # Lista de itens da cantina
├── canteen-purchases-container.tsx  # Lista de compras da cantina
├── classes-list-container.tsx       # Lista de turmas
├── contracts-list-container.tsx     # Lista de contratos
├── employees-list-container.tsx     # Lista de funcionários
├── escola-stats-container.tsx       # Stats do dashboard escola
├── responsavel-stats-container.tsx  # Stats do dashboard responsável
├── student-payments-container.tsx   # Lista de pagamentos do aluno
├── students-list-container.tsx      # Lista de alunos
├── teachers-list-container.tsx      # Lista de professores
├── scholarships-table-container.tsx # Tabela de bolsas
├── school-partners-table-container.tsx # Tabela de parceiros
├── subjects/subjects-table-container.tsx # Tabela de matérias
├── academic-periods/academic-periods-table-container.tsx # Tabela de períodos letivos
└── teachers-timesheet/teacher-timesheet-table.tsx # Folha de ponto (tabela)
```

### Hooks/Queries Criados

```
inertia/hooks/queries/
├── use-admin-stats.ts               # Stats para dashboard admin
├── use-canteen-items.ts             # Query de itens da cantina
├── use-canteen-purchases.ts         # Query de compras da cantina
├── use-classes.ts                   # Query de turmas
├── use-contracts.ts                 # Query de contratos
├── use-escola-stats.ts              # Stats para dashboard escola
├── use-responsavel-stats.ts         # Stats para dashboard responsável
├── use-student-payments.ts          # Query de pagamentos
├── use-students.ts                  # Query de alunos
├── use-teachers.ts                  # Query de professores
├── use-users.ts                     # Query de usuários
├── use-scholarships.ts              # Query de bolsas
├── use-school-partners.ts           # Query de parceiros
├── use-subjects.ts                  # Query de matérias
├── use-subject.ts                   # Query de matéria
├── use-academic-periods.ts          # Query de períodos letivos
├── use-teachers-timesheet.ts        # Query de folha de ponto
└── use-teacher-absences.ts          # Query de faltas do professor
```

### Layouts Criados

- [x] `admin-layout.tsx` - Layout para páginas do admin da plataforma
- [x] `escola-layout.tsx` - Layout para páginas da escola
- [x] `responsavel-layout.tsx` - Layout para páginas do responsável
- [x] `public-layout.tsx` - Layout para páginas públicas

### Componentes UI (Shadcn)

- [x] `button.tsx`
- [x] `card.tsx`
- [x] `input.tsx`
- [x] `label.tsx`
- [x] `dialog.tsx`
- [x] `select.tsx`
- [x] `textarea.tsx`
- [x] `switch.tsx`
- [x] `badge.tsx`
- [x] `form.tsx`

### Próximos Passos

1. [ ] Migrar "Impressão" (`escola/administrativo/impressao`)
2. [ ] Migrar "Solicitações de compra" (`escola/administrativo/solicitacoes-de-compra`)
3. [ ] Refinar Folha de Ponto (cálculos reais + pending count)
4. [ ] Implementar tabelas shadcn completas (DataTable)
5. [ ] Implementar modais de confirmação para ações destrutivas

---

## Problemas Encontrados e Soluções

| Data | Problema | Solução |
| ---- | -------- | ------- |
| -    | -        | -       |

---

## Comandos Úteis

```bash
# Rodar migrations
node ace migration:run

# Criar migration
node ace make:migration nome_da_migration

# Criar model
node ace make:model NomeDoModel

# Criar controller
node ace make:controller NomeController

# Gerar tipos do Tuyau
node ace tuyau:generate

# Dev server
npm run dev
```

---

## Referências

### Projetos

- **Projeto Original:** `~/documents/personal/school-super-app`
- **Projeto Novo:** `~/documents/personal/anua-v2`
- **Projeto Referência:** `~/documents/personal/projeto-turismo`

### Arquivos Importantes no Projeto Original

- **Schema Prisma:** `packages/db/prisma/models/`
- **Routers tRPC:** `packages/api/src/router/`

### Documentação

- [AdonisJS 6 Docs](https://docs.adonisjs.com)
- [Lucid ORM](https://lucid.adonisjs.com)
- [VineJS](https://vinejs.dev)
- [Tuyau](https://tuyau.julr.dev)
- [Inertia.js](https://inertiajs.com)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)

### Arquivos Chave no anua-v2

| Arquivo              | Descrição                    |
| -------------------- | ---------------------------- |
| `start/routes.ts`    | Todas as rotas da aplicação  |
| `start/kernel.ts`    | Middlewares registrados      |
| `config/auth.ts`     | Configuração de autenticação |
| `config/database.ts` | Configuração do banco        |
| `.env`               | Variáveis de ambiente        |
| `.adonisjs/api.ts`   | Tipos gerados pelo Tuyau     |
| `inertia/lib/api.ts` | Cliente Tuyau para frontend  |

---

## Fase 12: Módulos com Backend Incompleto

Estes módulos já possuem **Models** e **Migrations**, mas ainda faltam os **Controllers** e **Rotas**.

### Sistema de Eventos (Events)

**Status:** Concluído

**Models existentes:**
- [x] `Event` - Eventos escolares (reuniões, festas, passeios)
- [x] `EventParticipant` - Participantes do evento

**Migrations existentes:**
- [x] `create_events_table`
- [x] `create_event_participants_table`
- [x] `create_event_comments_table`
- [x] `create_event_parental_consents_table`

**Validators criados:**
- [x] `app/validators/event.ts` - createEventValidator, updateEventValidator, listEventsValidator, registerParticipantValidator, etc.

**Controllers criados:**
- [x] `events/list_events_controller.ts`
- [x] `events/show_event_controller.ts`
- [x] `events/create_event_controller.ts`
- [x] `events/update_event_controller.ts`
- [x] `events/delete_event_controller.ts`
- [x] `events/publish_event_controller.ts`
- [x] `events/cancel_event_controller.ts`
- [x] `events/complete_event_controller.ts`
- [x] `event_participants/list_event_participants_controller.ts`
- [x] `event_participants/register_participant_controller.ts`
- [x] `event_participants/update_participant_status_controller.ts`
- [x] `event_participants/cancel_registration_controller.ts`
- [x] `event_participants/confirm_attendance_controller.ts`

**Endpoints implementados:**
| Método | Rota | Controller | Status |
| ------ | ---- | ---------- | ------ |
| GET | `/api/v1/events` | list_events_controller | Concluído |
| POST | `/api/v1/events` | create_event_controller | Concluído |
| GET | `/api/v1/events/:id` | show_event_controller | Concluído |
| PUT | `/api/v1/events/:id` | update_event_controller | Concluído |
| DELETE | `/api/v1/events/:id` | delete_event_controller | Concluído |
| POST | `/api/v1/events/:id/publish` | publish_event_controller | Concluído |
| POST | `/api/v1/events/:id/cancel` | cancel_event_controller | Concluído |
| POST | `/api/v1/events/:id/complete` | complete_event_controller | Concluído |
| GET | `/api/v1/events/:eventId/participants` | list_event_participants_controller | Concluído |
| POST | `/api/v1/events/:eventId/participants` | register_participant_controller | Concluído |
| PUT | `/api/v1/events/:eventId/participants/:participantId` | update_participant_status_controller | Concluído |
| DELETE | `/api/v1/events/:eventId/participants/:participantId` | cancel_registration_controller | Concluído |
| POST | `/api/v1/events/:eventId/participants/:participantId/confirm` | confirm_attendance_controller | Concluído |

---

### Sistema de Notificações (Notifications)

**Status:** Concluído

**Models existentes:**
- [x] `Notification` - Notificações do sistema
- [x] `NotificationPreference` - Preferências de notificação por usuário

**Migrations existentes:**
- [x] `create_notifications_table`
- [x] `create_notification_preferences_table`

**Validators criados:**
- [x] `app/validators/notification.ts` - listNotificationsValidator, createNotificationValidator, updateNotificationPreferencesValidator

**Controllers criados:**
- [x] `notifications/list_notifications_controller.ts`
- [x] `notifications/show_notification_controller.ts`
- [x] `notifications/mark_notification_read_controller.ts`
- [x] `notifications/mark_all_read_controller.ts`
- [x] `notifications/delete_notification_controller.ts`
- [x] `notification_preferences/show_notification_preferences_controller.ts`
- [x] `notification_preferences/update_notification_preferences_controller.ts`

**Endpoints implementados:**
| Método | Rota | Controller | Status |
| ------ | ---- | ---------- | ------ |
| GET | `/api/v1/notifications` | list_notifications_controller | Concluído |
| GET | `/api/v1/notifications/:id` | show_notification_controller | Concluído |
| POST | `/api/v1/notifications/:id/read` | mark_notification_read_controller | Concluído |
| POST | `/api/v1/notifications/read-all` | mark_all_read_controller | Concluído |
| DELETE | `/api/v1/notifications/:id` | delete_notification_controller | Concluído |
| GET | `/api/v1/notification-preferences` | show_notification_preferences_controller | Concluído |
| PUT | `/api/v1/notification-preferences` | update_notification_preferences_controller | Concluído |

---

### Sistema de Posts/Feed

**Status:** Concluído

**Models existentes:**
- [x] `Post` - Posts do feed/mural
- [x] `Comment` - Comentários em posts
- [x] `CommentLike` - Likes em comentários
- [x] `UserLikedPost` - Likes em posts

**Migrations existentes:**
- [x] `create_posts_table`
- [x] `create_user_liked_posts_table`

**Controllers criados:**
- [x] `posts/list_posts_controller.ts`
- [x] `posts/show_post_controller.ts`
- [x] `posts/create_post_controller.ts`
- [x] `posts/update_post_controller.ts`
- [x] `posts/delete_post_controller.ts`
- [x] `posts/like_post_controller.ts`
- [x] `posts/unlike_post_controller.ts`
- [x] `comments/list_post_comments_controller.ts`
- [x] `comments/create_comment_controller.ts`
- [x] `comments/update_comment_controller.ts`
- [x] `comments/delete_comment_controller.ts`
- [x] `comments/like_comment_controller.ts`

**Validators criados:**
- [x] `validators/post.ts` - createPostValidator, updatePostValidator, createCommentValidator, updateCommentValidator

**Endpoints implementados:**
| Método | Rota | Controller | Status |
| ------ | ---- | ---------- | ------ |
| GET | `/api/v1/posts` | list_posts_controller | Concluído |
| POST | `/api/v1/posts` | create_post_controller | Concluído |
| GET | `/api/v1/posts/:id` | show_post_controller | Concluído |
| PUT | `/api/v1/posts/:id` | update_post_controller | Concluído |
| DELETE | `/api/v1/posts/:id` | delete_post_controller | Concluído |
| POST | `/api/v1/posts/:id/like` | like_post_controller | Concluído |
| DELETE | `/api/v1/posts/:id/like` | unlike_post_controller | Concluído |
| GET | `/api/v1/posts/:postId/comments` | list_post_comments_controller | Concluído |
| POST | `/api/v1/posts/:postId/comments` | create_comment_controller | Concluído |
| PUT | `/api/v1/comments/:id` | update_comment_controller | Concluído |
| DELETE | `/api/v1/comments/:id` | delete_comment_controller | Concluído |
| POST | `/api/v1/comments/:id/like` | like_comment_controller | Concluído |

---

### Sistema de Solicitações de Compra (Purchase Requests)

**Status:** Concluído

**Model criado:**
- [x] `purchase_request.ts` - Solicitações de compra de materiais

**Migration criada:**
- [x] `1769100000000_create_purchase_requests_table.ts`

**Validators criados:**
- [x] `validators/purchase_request.ts` - createPurchaseRequestValidator, updatePurchaseRequestValidator, rejectPurchaseRequestValidator, markAsBoughtValidator, markAsArrivedValidator

**Controllers criados:**
- [x] `purchase_requests/list_purchase_requests_controller.ts`
- [x] `purchase_requests/show_purchase_request_controller.ts`
- [x] `purchase_requests/create_purchase_request_controller.ts`
- [x] `purchase_requests/update_purchase_request_controller.ts`
- [x] `purchase_requests/delete_purchase_request_controller.ts`
- [x] `purchase_requests/approve_purchase_request_controller.ts`
- [x] `purchase_requests/reject_purchase_request_controller.ts`
- [x] `purchase_requests/mark_as_bought_controller.ts`
- [x] `purchase_requests/mark_as_arrived_controller.ts`

**Endpoints implementados:**
| Método | Rota | Controller | Status |
| ------ | ---- | ---------- | ------ |
| GET | `/api/v1/purchase-requests` | list_purchase_requests_controller | Concluído |
| POST | `/api/v1/purchase-requests` | create_purchase_request_controller | Concluído |
| GET | `/api/v1/purchase-requests/:id` | show_purchase_request_controller | Concluído |
| PUT | `/api/v1/purchase-requests/:id` | update_purchase_request_controller | Concluído |
| DELETE | `/api/v1/purchase-requests/:id` | delete_purchase_request_controller | Concluído |
| POST | `/api/v1/purchase-requests/:id/approve` | approve_purchase_request_controller | Concluído |
| POST | `/api/v1/purchase-requests/:id/reject` | reject_purchase_request_controller | Concluído |
| POST | `/api/v1/purchase-requests/:id/mark-bought` | mark_as_bought_controller | Concluído |
| POST | `/api/v1/purchase-requests/:id/mark-arrived` | mark_as_arrived_controller | Concluído |

**Fluxo de status:**
```
REQUESTED → APPROVED → BOUGHT → ARRIVED
         ↘ REJECTED
```

**Frontend implementado:**
- [x] Página: `inertia/pages/escola/administrativo/solicitacoes-de-compra.tsx`
- [x] Rota: `/escola/:schoolSlug/administrativo/solicitacoes-de-compra`

**Componentes UI criados:**
- [x] `inertia/components/ui/popover.tsx`
- [x] `inertia/components/ui/hover-card.tsx`
- [x] `inertia/components/ui/date-picker.tsx`

**Hooks criados:**
- [x] `hooks/queries/use-purchase-requests.ts`
- [x] `hooks/queries/use-purchase-request.ts`
- [x] `hooks/mutations/use-create-purchase-request.ts`
- [x] `hooks/mutations/use-update-purchase-request.ts`
- [x] `hooks/mutations/use-delete-purchase-request.ts`
- [x] `hooks/mutations/use-approve-purchase-request.ts`
- [x] `hooks/mutations/use-reject-purchase-request.ts`
- [x] `hooks/mutations/use-mark-bought-purchase-request.ts`
- [x] `hooks/mutations/use-mark-arrived-purchase-request.ts`

**Containers criados:**
- [x] `containers/purchase-requests/purchase-requests-table.tsx`
- [x] `containers/purchase-requests/new-purchase-request-modal.tsx`
- [x] `containers/purchase-requests/approve-purchase-request-modal.tsx`
- [x] `containers/purchase-requests/reject-purchase-request-modal.tsx`
- [x] `containers/purchase-requests/bought-purchase-request-modal.tsx`
- [x] `containers/purchase-requests/arrived-purchase-request-modal.tsx`

**Dependências adicionadas:**
- `react-day-picker` - DatePicker
- `@radix-ui/react-popover` - Popover para DatePicker
- `@radix-ui/react-hover-card` - HoverCard para detalhes na tabela

---

### Frontend - Notificações

**Status:** Concluído

**Páginas criadas:**
- [x] `inertia/pages/escola/notificacoes.tsx`
- [x] `inertia/pages/escola/notificacoes/preferencias.tsx`

**Rotas:**
- [x] `/escola/:schoolSlug/notificacoes`
- [x] `/escola/:schoolSlug/notificacoes/preferencias`

**Componentes UI criados:**
- [x] `inertia/components/ui/separator.tsx`

**Hooks criados:**
- [x] `hooks/queries/use-notifications.ts`
- [x] `hooks/queries/use-notification-preferences.ts`
- [x] `hooks/mutations/use-mark-notification-read.ts`
- [x] `hooks/mutations/use-mark-all-notifications-read.ts`
- [x] `hooks/mutations/use-delete-notification.ts`
- [x] `hooks/mutations/use-update-notification-preferences.ts`

**Containers criados:**
- [x] `containers/notifications/notifications-list.tsx`
- [x] `containers/notifications/notification-preferences.tsx`

**Controllers de página criados:**
- [x] `controllers/pages/escola/show_notificacoes_page_controller.ts`
- [x] `controllers/pages/escola/show_notificacoes_preferencias_page_controller.ts`

**Dependências adicionadas:**
- `@radix-ui/react-separator` - Separator para divisão de seções

---

### Frontend - Eventos

**Status:** Concluído

**Página criada:**
- [x] `inertia/pages/escola/eventos.tsx`

**Rota:**
- [x] `/escola/:schoolSlug/eventos`

**Hooks criados:**
- [x] `hooks/queries/use-events.ts`
- [x] `hooks/queries/use-event.ts`
- [x] `hooks/mutations/use-create-event.ts`
- [x] `hooks/mutations/use-update-event.ts`
- [x] `hooks/mutations/use-delete-event.ts`
- [x] `hooks/mutations/use-publish-event.ts`
- [x] `hooks/mutations/use-cancel-event.ts`
- [x] `hooks/mutations/use-complete-event.ts`

**Containers criados:**
- [x] `containers/events/events-calendar.tsx`
- [x] `containers/events/new-event-modal.tsx`
- [x] `containers/events/edit-event-modal.tsx`
- [x] `containers/events/calendar.css`

**Controller de página criado:**
- [x] `controllers/pages/escola/show_eventos_page_controller.ts`

**Dependências adicionadas:**
- `react-big-calendar` - Calendário de eventos
- `@types/react-big-calendar` - Tipos do calendário

---

### Frontend - Mural (Posts/Feed)

**Status:** Concluído

**Página criada:**
- [x] `inertia/pages/escola/mural.tsx`

**Rota:**
- [x] `/escola/:schoolSlug/mural`

**Componentes UI criados:**
- [x] `inertia/components/ui/avatar.tsx`
- [x] `inertia/components/ui/dropdown-menu.tsx`

**Hooks criados:**
- [x] `hooks/queries/use-posts.ts`
- [x] `hooks/queries/use-post.ts`
- [x] `hooks/queries/use-post-comments.ts`
- [x] `hooks/mutations/use-create-post.ts`
- [x] `hooks/mutations/use-update-post.ts`
- [x] `hooks/mutations/use-delete-post.ts`
- [x] `hooks/mutations/use-like-post.ts`
- [x] `hooks/mutations/use-unlike-post.ts`
- [x] `hooks/mutations/use-create-comment.ts`

**Containers criados:**
- [x] `containers/posts/posts-feed.tsx`
- [x] `containers/posts/post-card.tsx`
- [x] `containers/posts/new-post-modal.tsx`

**Controller de página criado:**
- [x] `controllers/pages/escola/show_mural_page_controller.ts`

**Dependências adicionadas:**
- `@radix-ui/react-avatar` - Avatar component
- `@radix-ui/react-dropdown-menu` - DropdownMenu component
- `@radix-ui/react-icons` - Radix icons

---

### Sistema de Notas (Grades)

**Status:** Concluído (Analytics Principais)

**Já implementado:**
- [x] CRUD de Exams (provas)
- [x] CRUD de ExamGrades (notas de provas)
- [x] CRUD de Assignments (atividades)
- [x] Assignment Submissions (entregas)
- [x] Grade Submission (dar nota em atividade)
- [x] `grades/get_academic_overview_controller.ts`
- [x] `grades/get_students_grades_controller.ts`
- [x] `grades/get_grade_distribution_controller.ts`
- [x] `grades/get_at_risk_students_controller.ts`

**Controllers opcionais (baixa prioridade):**
- [ ] `grades/get_subject_difficulty_controller.ts`
- [ ] `grades/get_assignment_completion_rates_controller.ts`

**Endpoints implementados:**
| Método | Rota | Controller | Status |
| ------ | ---- | ---------- | ------ |
| GET | `/api/v1/grades/academic-overview` | get_academic_overview_controller | Concluído |
| GET | `/api/v1/grades/students` | get_students_grades_controller | Concluído |
| GET | `/api/v1/grades/distribution` | get_grade_distribution_controller | Concluído |
| GET | `/api/v1/grades/at-risk` | get_at_risk_students_controller | Concluído |
| GET | `/api/v1/grades/subject-difficulty` | get_subject_difficulty_controller | Pendente (opcional) |
| GET | `/api/v1/grades/assignment-completion` | get_assignment_completion_rates_controller | Pendente (opcional) |

---

### Frontend - Grades Analytics (Desempenho Academico)

**Status:** Concluido

**Pagina criada:**
- [x] `inertia/pages/escola/desempenho.tsx`

**Rota:**
- [x] `/escola/:schoolSlug/desempenho`

**Hooks criados:**
- [x] `hooks/queries/use-academic-overview.ts`
- [x] `hooks/queries/use-students-grades.ts`
- [x] `hooks/queries/use-grade-distribution.ts`
- [x] `hooks/queries/use-at-risk-students.ts`

**Containers criados:**
- [x] `containers/grades/academic-overview-cards.tsx` - 6 cards com visao geral
- [x] `containers/grades/grade-distribution-chart.tsx` - Grafico de distribuicao de notas
- [x] `containers/grades/at-risk-students-table.tsx` - Tabela de alunos em risco

**Controller de pagina criado:**
- [x] `controllers/pages/escola/show_desempenho_page_controller.ts`

---

## Tarefas Pendentes (Refatoracao)

### Renomear Controllers para Convenção Descritiva

Os controllers abaixo precisam ser renomeados para seguir a nova convenção:

**Auth:**
| Atual | Novo |
|-------|------|
| `auth/login.ts` | `auth/login_controller.ts` |
| `auth/logout.ts` | `auth/logout_controller.ts` |
| `auth/me.ts` | `auth/get_current_user_controller.ts` |

**Schools:**
| Atual | Novo |
|-------|------|
| `schools/index.ts` | `schools/list_schools_controller.ts` |
| `schools/show.ts` | `schools/show_school_controller.ts` |
| `schools/show_by_slug.ts` | `schools/show_school_by_slug_controller.ts` |
| `schools/store.ts` | `schools/create_school_controller.ts` |
| `schools/update.ts` | `schools/update_school_controller.ts` |
| `schools/destroy.ts` | `schools/delete_school_controller.ts` |

**Users:**
| Atual | Novo |
|-------|------|
| `users/index.ts` | `users/list_users_controller.ts` |
| `users/show.ts` | `users/show_user_controller.ts` |
| `users/store.ts` | `users/create_user_controller.ts` |
| `users/update.ts` | `users/update_user_controller.ts` |
| `users/destroy.ts` | `users/delete_user_controller.ts` |

**Students:**
| Atual | Novo |
|-------|------|
| `students/index.ts` | `students/list_students_controller.ts` |
| `students/show.ts` | `students/show_student_controller.ts` |
| `students/store.ts` | `students/create_student_controller.ts` |
| `students/update.ts` | `students/update_student_controller.ts` |
| `students/destroy.ts` | `students/delete_student_controller.ts` |

**Lembrete:** Após renomear, atualizar os imports em `start/routes.ts`.

---

## Próximos Passos (Geral)

- Completar cantina avançada (transferências).
- Finalizar frontend pendente (impressão, solicitações de compra, DataTable shadcn, modais de confirmação, folha de ponto).
- Renomear controllers para a convenção nova e atualizar `start/routes.ts`.

---

## Frontend Implementation

### Estrutura de Componentes React

```
inertia/
├── components/
│   ├── ui/                       # Shadcn UI Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── forms/                    # Formulários reutilizáveis
│   │   ├── student-form.tsx
│   │   ├── user-form.tsx
│   │   └── login-form.tsx
│   ├── layout/                   # Layout components
│   │   ├── app-sidebar.tsx
│   │   ├── app-header.tsx
│   │   └── dashboard-layout.tsx
│   └── tables/                   # Tabelas com TanStack Table
│       ├── students-table.tsx
│       ├── users-table.tsx
│       └── data-table.tsx
├── pages/                        # Páginas Inertia
│   ├── auth/
│   │   └── login.tsx
│   ├── dashboard/
│   │   └── index.tsx
│   ├── students/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── edit.tsx
│   │   └── show.tsx
│   └── users/
│       └── ...
└── lib/                          # Utilitários
    ├── api.ts                    # Cliente Tuyau
    ├── utils.ts                  # Utilitários CSS/gerais
    ├── validations.ts            # Validações frontend
    └── types.ts                  # Tipos TypeScript
```

### Padrões Frontend

#### 1. Data Fetching com TanStack Query

```typescript
// inertia/lib/api.ts
import { api } from '@tuyau/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => api.students.$get(),
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentData) => api.students.$post(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
```

#### 2. Formulários com React Hook Form

```typescript
// inertia/components/forms/student-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema } from '@/lib/validations'

export function StudentForm() {
  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      // ...
    }
  })

  const handleSubmit = (data) => {
    // Usar mutation do TanStack Query
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Componentes do shadcn/ui */}
    </form>
  )
}
```

#### 3. Tabelas com TanStack Table

```typescript
// inertia/components/tables/students-table.tsx
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table'

const columns = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  // ...
]

export function StudentsTable({ data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-md border">
      {/* Implementação da tabela com shadcn/ui */}
    </div>
  )
}
```

### Integração com Inertia.js

#### 1. Páginas Inertia

```typescript
// inertia/pages/students/index.tsx
import { Head } from '@inertiajs/react'
import { StudentsTable } from '@/components/tables/students-table'
import { useStudents } from '@/lib/api'

export default function StudentsIndex() {
  const { data: students, isLoading } = useStudents()

  return (
    <>
      <Head title="Alunos" />
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Alunos</h1>
        {isLoading ? (
          <div>Carregando...</div>
        ) : (
          <StudentsTable data={students} />
        )}
      </div>
    </>
  )
}
```

#### 2. Layout Persistente

```typescript
// inertia/components/layout/dashboard-layout.tsx
import { ReactNode } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Performance e Otimização

### Backend Otimizations

#### 1. Database Queries

```typescript
// Usar preload para evitar N+1 queries
const students = await Student.query()
  .preload('user')
  .preload('school')
  .preload('responsible')
  .paginate(page, limit)

// Usar select apenas campos necessários
const users = await User.query().select('id', 'name', 'email').where('active', true)
```

#### 2. Caching Strategy

```typescript
// Em desenvolvimento - usar Redis para cache
import { redis } from '@/config/redis'

export class CacheService {
  static async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }

    const result = await callback()
    await redis.setex(key, ttl, JSON.stringify(result))
    return result
  }
}
```

#### 3. Pagination

```typescript
// Sempre usar paginação para listas grandes
export default class ListStudentsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const students = await Student.query().preload('user').paginate(page, limit)

    return response.json(students.toJSON())
  }
}
```

### Frontend Optimizations

#### 1. Code Splitting

```typescript
// Lazy loading de páginas
import { lazy } from 'react'

const StudentsPage = lazy(() => import('@/pages/students/index'))
const UsersPage = lazy(() => import('@/pages/users/index'))
```

#### 2. React Query Optimizations

```typescript
// Configurar stale time e cache time apropriados
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
})
```

#### 3. Memoização

```typescript
// Usar React.memo para componentes que não precisam re-renderizar
import { memo } from 'react'

export const StudentsTableRow = memo(({ student }) => {
  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.email}</td>
    </tr>
  )
})
```

---

## Testing Strategy

### Backend Testing

#### 1. Unit Tests (Models)

```typescript
// tests/unit/models/user.spec.ts
import { test } from '@japa/runner'
import User from '#app/models/user'

test.group('User model', () => {
  test('should create user with hashed password', async ({ assert }) => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    })

    assert.notEqual(user.password, 'secret123')
    assert.isTrue(await user.verifyPassword('secret123'))
  })
})
```

#### 2. Integration Tests (API)

```typescript
// tests/functional/auth/login.spec.ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth login', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should login with valid credentials', async ({ client, assert }) => {
    await User.create({
      email: 'user@test.com',
      password: 'secret123',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'user@test.com',
      password: 'secret123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Login successful',
    })
  })
})
```

#### 3. Database Tests

```typescript
// tests/functional/students/crud.spec.ts
test.group('Students CRUD', (group) => {
  group.each.setup(() => testUtils.db().migrate())
  group.each.teardown(() => testUtils.db().rollback())

  test('should create student with user', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/students')
      .json({
        name: 'João Silva',
        email: 'joao@example.com',
        // ...
      })
      .loginAs(adminUser)

    response.assertStatus(201)

    const student = await Student.findByOrFail('email', 'joao@example.com')
    assert.equal(student.name, 'João Silva')
  })
})
```

### Frontend Testing

#### 1. Component Tests (Vitest + Testing Library)

```typescript
// inertia/components/__tests__/student-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentForm } from '../forms/student-form'

describe('StudentForm', () => {
  test('should validate required fields', async () => {
    render(<StudentForm />)

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    fireEvent.click(submitButton)

    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
  })
})
```

#### 2. Integration Tests (Cypress/Playwright)

```typescript
// e2e/students.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Students Management', () => {
  test('should create new student', async ({ page }) => {
    await page.goto('/students')
    await page.click('text=Novo Aluno')

    await page.fill('[name="name"]', 'João Silva')
    await page.fill('[name="email"]', 'joao@example.com')
    await page.click('text=Salvar')

    await expect(page.locator('text=Aluno criado com sucesso')).toBeVisible()
  })
})
```

---

## Deploy e CI/CD

### Produção (Sugestão)

#### 1. Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3333

CMD ["node", "bin/server.js"]
```

#### 2. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Script de deploy
```

#### 3. Variáveis de Ambiente de Produção

```env
# .env.production
NODE_ENV=production
PORT=3333
APP_KEY=sua_app_key_super_secreta
SESSION_DRIVER=redis

DB_HOST=seu_host_producao
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senha_super_secreta
DB_DATABASE=anua_v2_prod

REDIS_HOST=seu_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
```

---

## Troubleshooting Comum

### Problemas Backend

| Problema                 | Causa                   | Solução                                   |
| ------------------------ | ----------------------- | ----------------------------------------- |
| Migration falha          | Constraint violation    | Verificar foreign keys e dados existentes |
| Tuyau não atualiza tipos | Cache do TypeScript     | `node ace tuyau:generate` + restart TS    |
| Sessão não persiste      | Configuração de cookies | Verificar `SESSION_DRIVER` e `APP_KEY`    |
| Queries lentas           | N+1 queries             | Usar `.preload()` nos relacionamentos     |

### Problemas Frontend

| Problema             | Causa               | Solução                             |
| -------------------- | ------------------- | ----------------------------------- |
| Hydration mismatch   | SSR/CSR diferença   | Verificar dados Inertia             |
| TanStack Query cache | Dados obsoletos     | `queryClient.invalidateQueries()`   |
| CSS não carrega      | Build Tailwind      | `npm run build` e verificar imports |
| Tipo TypeScript      | Tuyau desatualizado | Gerar tipos novamente               |

### Comandos de Debug

```bash
# Ver logs em tempo real
tail -f storage/logs/app.log

# Verificar conexão do banco
node ace migration:status

# Limpar cache (se implementado)
node ace cache:clear

# Verificar rotas registradas
node ace list:routes

# Debug SQL queries (development)
DEBUG=*query* npm run dev
```
