# Design: Menu de criacao por dia no calendario pedagogico

## Contexto

No calendario mensal, o estado vazio da celula mostrava o CTA em ingles (`Add Event`) e abria apenas o fluxo generico de evento. A necessidade validada foi:

- traduzir o CTA para PT-BR;
- no clique do dia vazio, abrir um menu tipo popover;
- permitir escolher o que criar naquele dia: atividade, prova ou evento;
- reutilizar as modais oficiais ja existentes no fluxo pedagogico.

## Decisao de UX

Foi escolhido um menu contextual por dia vazio com tres opcoes:

1. Nova atividade
2. Nova prova
3. Novo evento

O trigger do estado vazio passa a ser `Novo item` (PT-BR). Em mobile, o botao nao depende de hover para aparecer.

## Decisao tecnica

- Expor callbacks opcionais no componente de calendario para tratar acao de dia vazio.
- Encaminhar esses callbacks ate o `DayCell` da visao mensal.
- Renderizar `Popover` (nao `DropdownMenu`) no estado vazio para abrir as opcoes de criacao.
- No container pedagogico, ao selecionar uma opcao:
  - guardar a data clicada;
  - abrir a modal oficial correspondente;
  - pre-preencher a data inicial da criacao nessa modal.

## Impacto esperado

- Melhora de linguagem (sem strings em ingles no hover principal da celula vazia).
- Menos atrito no fluxo de criacao, com escolha de tipo no proprio dia alvo.
- Coerencia com os fluxos ja existentes de atividade, prova e evento.
