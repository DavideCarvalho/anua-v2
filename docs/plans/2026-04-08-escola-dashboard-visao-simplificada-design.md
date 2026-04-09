# Design Doc: Visao Simplificada do Dashboard da Escola

## Visao Geral

Implementar uma visao simplificada e alternavel no dashboard da escola, com foco em acoes diretas e navegacao rapida. Essa visao elimina graficos, tabs e filtros complexos, apresentando apenas botoes grandes e centrais para os principais destinos operacionais.

O objetivo e reduzir friccao para usuarios que querem executar tarefas rapidamente sem depender do menu lateral ou leitura de indicadores.

## Decisoes Validadas

- Escopo inicial: dashboard da escola.
- Estrategia: modo alternavel entre visao completa e visao simplificada.
- Primeira versao (MVP): 6 acoes fixas.
- Abordagem escolhida: toggle simples na home existente (sem criar rota separada).

## Objetivos

- Permitir acesso rapido aos fluxos mais usados em ate um clique.
- Manter o dashboard analitico atual intacto para quem prefere a visao completa.
- Oferecer uma experiencia limpa e objetiva para operacao do dia a dia.

## Fora de Escopo (MVP)

- Personalizacao de botoes por escola.
- Configuracao de ordem de acoes por usuario.
- Mudancas de backend para persistencia de preferencia.
- Remocao do menu lateral global do layout.

## Arquitetura da Solucao

### Estrutura geral

- A rota permanece `web.escola.dashboard`.
- A pagina `inertia/pages/escola/index.tsx` passa a controlar um estado `viewMode` com dois valores:
  - `full` para o dashboard existente.
  - `simple` para o hub de acoes.
- O dashboard atual continua sem alteracoes funcionais quando `viewMode = full`.

### Persistencia de preferencia

- Persistencia no frontend via `localStorage`.
- Chave recomendada: `escola:dashboard:view-mode:<userId>`.
- Regras:
  - Ler no carregamento da pagina.
  - Gravar sempre que o usuario alternar o modo.
  - Default para `full` quando nao houver valor salvo.

## UX da Visao Simplificada

### Layout

- Cabecalho com pergunta orientada a acao: "O que voce quer fazer agora?".
- Grid central com botoes grandes:
  - Desktop: 2 colunas x 3 linhas.
  - Mobile: 1 coluna empilhada.
- Sem cards de metricas, sem tabs, sem graficos.

### Acoes iniciais (MVP)

1. Alunos
2. Turmas
3. Calendario
4. Financeiro
5. Cantina
6. Comunicados

### Comportamento

- Clique em botao navega diretamente para a rota alvo.
- Hover/focus com destaque visual claro.
- Estado de loading leve no clique para reduzir duplo acionamento.
- Layout centralizado mesmo com menos botoes visiveis (por permissao).

## Componentes Propostos

- `inertia/components/dashboard/escola-dashboard-view-toggle.tsx`
  - Controle de alternancia entre visao completa e simplificada.
- `inertia/components/dashboard/escola-quick-actions-hub.tsx`
  - Grid de botoes centrais com layout responsivo.
- `inertia/components/dashboard/escola-quick-actions-config.ts`
  - Lista tipada de acoes (label, icon, route, regra de visibilidade).

## Permissoes e Seguranca

- A visibilidade dos botoes deve respeitar as mesmas permissoes ja existentes.
- Nenhuma permissao nova sera criada no MVP.
- Se uma acao nao for permitida, o botao nao sera exibido.
- Se nenhuma acao estiver disponivel, exibir estado vazio com CTA para retornar a visao completa.

## Telemetria (Recomendado)

- Evento de alternancia de modo (`full -> simple`, `simple -> full`).
- Evento de clique por acao (nome do botao e rota).

Esses eventos ajudam a validar adocao e priorizar melhorias.

## Testes

### Unitarios

- Resolver corretamente as acoes visiveis por perfil/permissao.
- Resolver fallback para `full` quando `localStorage` estiver ausente ou invalido.

### Componentes

- Toggle altera estado e persiste em `localStorage`.
- Hub renderiza grid responsivo e labels corretos.

### E2E

- Alternar para visao simplificada e navegar por cada botao.
- Recarregar pagina mantendo preferencia selecionada.
- Alternar de volta para visao completa sem regressao visual/funcional.
- Validar comportamento em mobile e desktop.

## Riscos e Mitigacoes

- Risco: duplicidade de manutencao entre duas visoes.
  - Mitigacao: isolar componentes da visao simplificada e nao acoplar logica do dashboard atual.
- Risco: inconsistencias de permissao entre menu lateral e hub.
  - Mitigacao: reutilizar os mesmos checks de permissao ja adotados no frontend.
- Risco: preferencia local nao sincronizada entre dispositivos.
  - Mitigacao: aceitavel no MVP; evoluir para persistencia em backend se necessario.

## Criterios de Sucesso

- Usuario consegue acessar qualquer uma das 6 acoes do MVP em ate um clique a partir da home.
- Alternancia entre modos ocorre sem recarregamento completo e sem perda de estabilidade.
- Dashboard completo permanece funcional e inalterado quando em modo `full`.
