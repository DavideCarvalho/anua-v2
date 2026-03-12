# Design: Edicao em modal para atividade/prova com historico de alteracoes

## Contexto atual

- No calendario pedagogico, o botao `Editar` de atividade/prova leva para paginas de edicao.
- As paginas de edicao atuais de atividade/prova ainda estao em placeholder.
- Evento ja usa pagina de edicao dedicada e deve continuar assim.
- Nas telas de turma (`.../turmas/.../atividades` e `.../turmas/.../provas`) nao ha acao de editar por linha hoje.

## Objetivo

1. Editar atividade e prova em modal, com UX rapida e contextual.
2. Reutilizar a mesma experiencia de edicao no calendario pedagogico e nas telas de turma.
3. Manter evento com edicao via pagina.
4. Registrar historico por campo alterado para auditoria (quem, quando, antes/depois).

## Abordagem aprovada

### A. Modal para atividade e prova (aprovada)

- Implementar `EditAssignmentModal` e `EditExamModal` (ou estender modais atuais com `mode='edit'`).
- Abrir esses modais a partir de:
  - Calendario pedagogico (detalhes do item > Editar)
  - Pagina de turma de atividades
  - Pagina de turma de provas
- Evento continua abrindo `web.escola.eventos.editar` (pagina).

### B. Historico por campo (aprovado)

- Criar historico para atividade e prova com mudancas por campo.
- Cada edicao persiste:
  - `entityId`
  - `actorUserId`
  - `changedAt`
  - lista de diffs (`field`, `oldValue`, `newValue`)

## UX detalhada

## 1) Calendario pedagogico

- `ASSIGNMENT`: `Editar` abre modal de edicao de atividade.
- `EXAM`: `Editar` abre modal de edicao de prova.
- `EVENT`: `Editar` continua indo para pagina de evento.
- `HOLIDAY` e `WEEKEND_CLASS_DAY`: sem edicao.

## 2) Pagina de turma - atividades

- Adicionar acao `Editar` por linha em `AssignmentsTable`.
- A acao abre modal de edicao com dados carregados da atividade.

## 3) Pagina de turma - provas

- Adicionar acao `Editar` por linha em `ExamsList`.
- A acao abre modal de edicao com dados carregados da prova.

## 4) Modal de edicao

- Header: `Editar atividade` ou `Editar prova`.
- Campos pre-preenchidos.
- Footer com `Cancelar` e `Salvar alteracoes`.
- Link/botao `Ver historico` para abrir timeline de alteracoes.

## Modelo de dados de historico

### AssignmentHistory

- id
- assignmentId
- actorUserId
- changedAt
- changes (json)

### ExamHistory

- id
- examId
- actorUserId
- changedAt
- changes (json)

### Formato de `changes`

```json
[
  {
    "field": "dueDate",
    "oldValue": "2026-03-11T07:30:00.000Z",
    "newValue": "2026-03-11T08:20:00.000Z"
  }
]
```

## Regras de negocio

- Historico grava somente campos efetivamente alterados.
- Se nao houve mudanca real, nao criar registro de historico.
- Atualizacao e criacao do historico devem ocorrer no mesmo fluxo transacional.
- Permissoes de edicao seguem regras atuais de atividade/prova.

## Backend

- Incluir endpoints de update com geracao de diff por campo.
- Incluir endpoints/listagem de historico para atividade e prova.
- Reaproveitar validadores existentes, ajustando para update parcial quando necessario.

## Frontend

- Reaproveitar componentes dos modais de criacao onde possivel.
- Adicionar modo `edit` com carregamento inicial e submit de update.
- Adicionar acao `Editar` nas tabelas de atividades e provas da turma.

## Testes

- Functional:
  - atualiza atividade e gera historico com campos alterados.
  - atualiza prova e gera historico com campos alterados.
  - nao gera historico quando payload equivale ao estado atual.
- Browser:
  - calendario: editar atividade/prova abre modal correto.
  - turma atividades/provas: acao editar abre modal correto.
  - evento segue abrindo pagina de edicao.

## Criterios de aceite

1. `Editar` de atividade/prova nao navega para pagina placeholder; abre modal.
2. `Editar` de evento continua em pagina.
3. Tabelas de atividades e provas da turma possuem `Editar` por linha.
4. Cada alteracao em atividade/prova gera historico por campo.
5. Historico mostra quem editou, quando e antes/depois.
