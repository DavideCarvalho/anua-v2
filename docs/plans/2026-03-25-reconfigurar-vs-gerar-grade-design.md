# Design: Separar Reconfiguracao de Geracao da Grade de Horarios

**Data:** 2026-03-25
**Status:** Aprovado

## Objetivo

Separar claramente duas intencoes na tela `/escola/pedagogico/horarios`:

- **Reconfigurar Grade**: editar apenas o template de horarios.
- **Gerar Grade**: executar redistribuicao automatica com overwrite da grade atual.

O problema atual e que "Reconfigurar" pode levar o usuario a regenerar a grade sem essa intencao explicita.

## Decisao

Adotar a abordagem A:

1. `Reconfigurar Grade` passa a ser somente configuracao.
2. Botao `Recarregar` na grade vira `Gerar Grade`.
3. `Gerar Grade` exige confirmacao explicita de overwrite antes de chamar o backend.

## Fluxo do Usuario

1. Selecionar turma e periodo letivo.
2. Se necessario, clicar em `Reconfigurar Grade` para ajustar template (sem gerar).
3. Visualizar a grade atual normalmente.
4. Clicar em `Gerar Grade` na area de acoes da grade.
5. Confirmar overwrite no dialog.
6. Sistema gera nova distribuicao e atualiza exibicao.
7. Usuario faz ajustes manuais (drag-and-drop) e clica em `Salvar Alteracoes`.

## Comportamento Esperado

### Reconfigurar Grade

- Abre o formulario de template.
- Nao chama endpoint de geracao.
- Nao altera alocacoes existentes por si so.

### Gerar Grade

- Fica no lugar do botao `Recarregar` em `ScheduleGrid`.
- Exibe `AlertDialog` com mensagem de impacto:
  - "Esta acao vai substituir a grade atual e redistribuir as aulas automaticamente."
- Acao confirmada chama `POST /api/v1/schedules/class/:classId/generate`.
- Sucesso invalida e recarrega `['classSchedule', classId, academicPeriodId]`.

### Erro na Geracao

- Mantem grade atual visivel.
- Mostra toast de erro com mensagem do backend.

## Arquitetura e Responsabilidades

### `inertia/pages/escola/pedagogico/horarios.tsx`

- Continua orquestrando selecao de turma/periodo e visibilidade de blocos.
- Mantem botao `Reconfigurar Grade` para abrir formulario de configuracao.
- Compartilha configuracao selecionada com `ScheduleGrid` para uso em `Gerar Grade`.

### `inertia/containers/schedule/schedule-config-form.tsx`

- Torna-se componente de configuracao pura.
- Remove chamada direta de `generateClassSchedule`.
- Exponibiliza callback de salvamento de config (ex.: `onSaveConfig`).

### `inertia/containers/schedule/schedule-grid.tsx`

- Troca `Recarregar` por `Gerar Grade`.
- Inclui confirmacao de overwrite.
- Executa mutacao de geracao e invalida query de grade.
- Mantem `Salvar Alteracoes` para persistir ajustes manuais.

### Backend

- Sem mudanca de regra de negocio nesta etapa.
- `generate_class_schedule_controller` segue com overwrite de calendario ativo e criacao de novo calendario + slots.

## Estado e Dados

- Primeira fase: template mantido em estado da pagina (sem persistencia dedicada).
- Evolucao futura opcional: persistir template por turma/periodo para reaproveitar ultima configuracao.

## Criterios de Aceite

- Clicar em `Reconfigurar Grade` nao regenera grade.
- Botao `Gerar Grade` aparece no lugar de `Recarregar`.
- `Gerar Grade` exige confirmacao antes de executar.
- Ao confirmar, grade e regenerada e exibida atualizada.
- `Aulas Pendentes` continuam aparecendo normalmente.
- `Salvar Alteracoes` continua funcionando para drag-and-drop.

## Fora de Escopo

- Persistencia de template em tabela propria.
- Novo algoritmo de geracao com preservacao parcial de alocacoes.
- Alteracoes nas regras de conflito/disponibilidade do backend.
