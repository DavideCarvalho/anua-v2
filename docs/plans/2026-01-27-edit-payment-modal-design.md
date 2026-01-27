# Modal Editar Informações de Pagamento - Design

## Resumo

Modal acessível via menu de ações na lista de alunos para visualizar e editar informações de pagamento de matrículas.

## Acesso

Menu de ações (⋯) na linha do aluno → "Editar Pagamento"

## Estrutura do Modal

- Header com nome do aluno
- Abas horizontais com os períodos letivos (ex: "Ensino Fundamental 2025" | "Ensino Fundamental 2026")
- Conteúdo da aba mostra os dados da matrícula naquele período

## Campos Editáveis (por aba/período)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Contrato | Dropdown | Contratos disponíveis pro nível |
| Bolsa | Dropdown | Bolsas ativas + "Sem bolsa" |
| Forma de Pagamento | Dropdown | Boleto / Cartão / PIX |
| Dia de Vencimento | Input numérico | 1-31 |
| Parcelas Mensalidade | Dropdown | Baseado no contrato selecionado |

## Visualização (não editável)

- Card resumo do contrato selecionado (valor matrícula, mensalidade, tipo)
- Comparativo de desconto quando tiver bolsa

## Comportamento

### Ao abrir
- Carrega todas as matrículas do aluno (StudentHasLevel)
- Agrupa por período letivo
- Primeira aba = período mais recente

### Ao trocar contrato
- Atualiza valores no card
- Se `flexibleInstallments=false`, trava parcelas no valor do contrato
- Se `flexibleInstallments=true`, recalcula máximo baseado na data atual vs fim do período

### Ao trocar bolsa
- Atualiza comparativo de desconto em tempo real

### Ao salvar
- Atualiza apenas o `StudentHasLevel` do período selecionado
- **Não recalcula cobranças existentes** - só afeta futuras
- Toast: "Informações de pagamento atualizadas"

### Aluno sem matrícula
- Mensagem: "Este aluno não possui matrículas ativas"
- Só botão de fechar

## Implementação Técnica

### Frontend
- Componente: `inertia/containers/students/edit-payment-modal/`
- Reutiliza: `ContractDetailsCard`, `ScholarshipSelector`, `DiscountComparison`
- Novo hook: `useStudentEnrollments(studentId)`

### Backend
- `GET /api/v1/students/:id/enrollments` - lista matrículas com dados de contrato/bolsa
- `PATCH /api/v1/students/:id/enrollments/:enrollmentId` - atualiza dados de pagamento

### Alteração existente
- Adicionar "Editar Pagamento" no dropdown de ações da lista de alunos

## Schema do Banco (referência)

Tabela `StudentHasLevel` já suporta todos os campos customizáveis:
- `contractId`
- `scholarshipId`
- `paymentMethod`
- `installments`
- `enrollmentInstallments`
- `paymentDay`
