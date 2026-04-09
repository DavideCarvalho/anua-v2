# Escola Financeiro - Tabela Objetiva na Visao Simplificada

## Contexto

A pagina `/escola/financeiro/faturas` no modo simplificado hoje reaproveita o `InvoicesContainer`, que foi desenhado para a visao completa com muitos filtros, colunas e detalhes. Isso gera ruido para o uso rapido operacional.

O objetivo validado e tornar a tabela simplificada mais objetiva para cobranca diaria.

## Objetivo

Entregar uma tabela de acao rapida na visao simplificada de faturas, priorizando cobrancas pendentes e vencidas com o menor numero de colunas possivel.

## Decisoes de Produto (aprovadas)

- Escopo da lista: apenas faturas com status acionaveis (`OPEN`, `PENDING`, `OVERDUE`).
- Colunas da tabela simplificada:
  - `Aluno`
  - `Vencimento`
  - `Valor`
  - `Acao`
- Ordenacao padrao: vencimento ascendente (mais urgente primeiro).
- Acao por linha:
  - `Receber` para `OPEN` e `PENDING`
  - `Negociar` para `OVERDUE`
- Sem filtros avancados na visao simplificada (mantidos na visao completa).

## Comportamento de UI

- `Loading`: skeleton curto com poucas linhas, focado na tabela minima.
- `Empty`: mensagem "Nenhuma fatura pendente ou vencida".
- `Error`: card simples com mensagem e botao "Tentar novamente".

## Arquitetura proposta

- Nao alterar a experiencia de `InvoicesContainer` na visao completa.
- Criar um componente dedicado para a visao simplificada de faturas (ex.: `inertia/containers/invoices-simplified-table.tsx`) com:
  - query de faturas com status fixos acionaveis
  - mapeamento das quatro colunas minimas
  - roteamento das acoes por linha
- Em `inertia/pages/escola/financeiro/faturas.tsx`, no branch `viewMode === 'simple'`, renderizar o novo componente dedicado.

## Nao objetivos

- Nao redesenhar a visao completa de faturas.
- Nao introduzir novos filtros na visao simplificada.
- Nao mudar regras de negocio de cobranca, apenas a apresentacao simplificada.

## Riscos e mitigacoes

- Risco: divergencia de comportamento entre visao completa e simplificada.
  - Mitigacao: reusar os mesmos status acionaveis e mesmos modais/rotas de acao.
- Risco: perder contexto sem coluna de status.
  - Mitigacao: texto e CTA da coluna `Acao` orientados pelo status interno (`Receber`/`Negociar`).

## Testes esperados

- Teste browser cobrindo a visao simplificada em `/escola/financeiro/faturas` com:
  - presenca das 4 colunas minimas
  - ausencia das colunas da visao completa
  - apenas itens com status acionavel
- Regressao da suite existente de layout simplificado e view mode.
