# Redesign: Matrícula — Modal para Página Dedicada

## Contexto

O formulário de matrícula atual vive dentro de um modal (`new-student-modal/`) na página `/escola/matriculas`. Com 5 etapas e muitos campos, o modal ficou apertado. Além disso, a etapa de responsáveis não lida bem com o caso de um responsável que já existe na plataforma (ex: pai com mais de um filho).

## Decisões de Design

### Página dedicada em vez de modal

- Rota: `GET /escola/matriculas/nova`
- Layout: sidebar vertical à esquerda (~250px) com stepper de 6 etapas + área de conteúdo à direita
- Topo: seletor de período letivo (obrigatório antes de prosseguir)
- Link de voltar: "← Voltar para matrículas" → `/escola/matriculas`
- Mobile: stepper colapsa para barra compacta no topo ("2 de 6 — Responsáveis")

### Backend

- Novo page controller: `ShowNovaMatriculaPageController` — carrega períodos, cursos, níveis, contratos, etc.
- Nova rota: `GET /escola/matriculas/nova` → renderiza página Inertia
- Endpoint de submit: permanece o mesmo (`EnrollStudentController`)

---

## Etapas

### Step 1 — Aluno

Sem mudanças funcionais. Mesmos campos:
- Nome, data de nascimento, email (opcional), telefone (opcional), tipo de documento, número do documento
- Checkbox "Maior de idade e próprio responsável" (pula step 2 se marcado + adulto)

Com mais espaço horizontal, campos podem usar grid de 2 colunas onde faz sentido (nome + data de nascimento lado a lado, etc).

### Step 2 — Responsáveis (redesenhado)

**Estado inicial:**
- Mensagem vazia: "Nenhum responsável adicionado"
- Botão: "+ Adicionar responsável"
- Hint de validação: "É necessário pelo menos um responsável financeiro e um pedagógico"

**Fluxo "Adicionar responsável" (inline, sem modal extra):**

1. Campo de CPF aparece com máscara (`000.000.000-00`). Busca automática ao completar 11 dígitos ou botão "Buscar".

2. **CPF encontrado** — card de resumo aparece:
   - Nome, email, telefone como dados read-only
   - Checkboxes: "Responsável pedagógico" / "Responsável financeiro" / "Contato de emergência"
   - Botões: "Confirmar" / "Cancelar"

3. **CPF não encontrado** — mensagem "Nenhum responsável encontrado com este CPF" e formulário completo expande abaixo:
   - Nome, email, telefone, data de nascimento, tipo de documento (pré-preenchido CPF), número (pré-preenchido com o CPF buscado)
   - Checkboxes: pedagógico / financeiro / contato de emergência
   - Botões: "Confirmar" / "Cancelar"

**Após adicionar:**
- Responsável aparece como card na lista: nome, documento, badges de papel (pedagógico/financeiro/emergência), botão remover (X)
- Pode adicionar mais clicando "+ Adicionar responsável"

**Validação:**
- Pelo menos um responsável deve ser `isFinancial`
- Pelo menos um responsável deve ser `isPedagogical`
- O mesmo responsável pode ter ambos os papéis
- Documentos e emails devem ser únicos entre responsáveis e aluno

### Step 3 — Endereço

Sem mudanças funcionais. CEP lookup com ViaCEP, auto-preenchimento. Campos: CEP, rua, número, complemento, bairro, cidade, estado.

### Step 4 — Informações Médicas

Sem mudanças funcionais nos campos médicos (condições, medicamentos).

**Contatos de emergência — mudança:**
- Responsáveis marcados como "contato de emergência" no step 2 aparecem automaticamente como cards read-only
- Usuário pode adicionar contatos de emergência adicionais manualmente
- Pelo menos um contato de emergência obrigatório

### Step 5 — Cobrança

Sem mudanças funcionais. Curso, nível, turma, contrato, método de pagamento, parcelas.

### Step 6 — Revisão (novo)

Stack de cards compactos, um por seção. Apenas campos preenchidos, sem mostrar opcionais vazios.

**Card "Aluno"** — Nome, data de nascimento, documento, email, telefone. Link "Editar" → step 1.

**Card "Responsáveis"** — Sub-card por responsável: nome, CPF, badges (pedagógico/financeiro/emergência). Link "Editar" → step 2.

**Card "Endereço"** — Rua + número, bairro, cidade/estado, CEP. Formato em linha. Link "Editar" → step 3.

**Card "Informações Médicas"** — Condições (se houver), quantidade de medicamentos, contatos de emergência (nomes). Link "Editar" → step 4.

**Card "Cobrança"** — Curso, nível, turma, contrato, método de pagamento, parcelas, valor mensal. Link "Editar" → step 5.

Botão no final: "Confirmar Matrícula". Ao clicar, submete para `EnrollStudentController`. Sucesso redireciona para `/escola/matriculas` com toast de confirmação.

---

## Navegação entre etapas

- Botões "Anterior" / "Próximo" fixos no final da área de conteúdo
- Validação ocorre ao clicar "Próximo"
- Clicar no stepper lateral permite voltar para etapas já completadas
- Não é possível avançar para etapas futuras não completadas clicando no stepper

## Componentes a criar/modificar

### Novos
- `inertia/pages/escola/matriculas/nova.tsx` — página Inertia
- `inertia/containers/enrollment/enrollment-page.tsx` — container principal com estado do form
- `inertia/containers/enrollment/enrollment-sidebar.tsx` — stepper lateral
- `inertia/containers/enrollment/steps/student-step.tsx`
- `inertia/containers/enrollment/steps/responsibles-step.tsx` — redesenhado com CPF lookup
- `inertia/containers/enrollment/steps/address-step.tsx`
- `inertia/containers/enrollment/steps/medical-step.tsx`
- `inertia/containers/enrollment/steps/billing-step.tsx`
- `inertia/containers/enrollment/steps/review-step.tsx` — novo
- `inertia/containers/enrollment/components/guardian-cpf-lookup.tsx` — componente de busca por CPF
- `inertia/containers/enrollment/components/guardian-card.tsx` — card read-only do responsável
- `inertia/containers/enrollment/components/review-card.tsx` — card genérico de revisão
- `app/controllers/pages/escola/show_nova_matricula_page_controller.ts`

### Modificar
- `start/routes.ts` — adicionar nova rota
- `inertia/pages/escola/matriculas.tsx` — trocar botão de abrir modal por link para `/escola/matriculas/nova`

### Remover (após migração completa)
- `inertia/containers/students/new-student-modal/` — modal antigo e todos os sub-componentes
