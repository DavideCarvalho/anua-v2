# Design Doc: Layout Simplificado nas Paginas Principais da Escola

## Visao Geral

Expandir a visao simplificada para alem da home da escola. Quando o usuario ativar o modo simplificado, as paginas principais de 6 modulos devem abrir em um layout dedicado, enxuto e orientado a acao.

## Decisoes Validadas

- Arquitetura escolhida: novo layout `escola-simplificado`.
- Escopo: apenas paginas principais de 6 modulos (sem detalhes/edicao nesta fase).
- Nivel de simplificacao: "acao + lista basica".
- Abrangencia do toggle: global para area Escola.

## Objetivos

- Tornar o uso diario mais rapido e direto.
- Reduzir sobrecarga visual (sem graficos, sem filtros avancados, sem elementos secundarios).
- Manter reversibilidade imediata para o modo completo.

## Fora de Escopo (Fase 1)

- Paginas de detalhe, edicao e fluxos avancados.
- Reescrever logica de dados dos modulos.
- Personalizacao por perfil/pagina no MVP.

## Arquitetura Tecnica

### Modo global

- Reutilizar o estado global de modo (`full` | `simple`) ja persistido por usuario.
- O modo simplificado passa a ser respeitado na home e nas paginas principais alvo.

### Novo layout

- Criar `inertia/components/layouts/escola-layout-simplificado.tsx`.
- Responsabilidades do layout:
  - Header minimo com titulo da pagina e toggle de modo.
  - Container principal com foco no conteudo operacional.
  - Estrutura visual limpa, sem blocos analiticos.

### Renderizacao condicional por pagina

- Cada pagina principal dos 6 modulos decide o layout com base em `viewMode`:
  - `simple`: renderiza no novo layout simplificado.
  - `full`: mantem layout e estrutura atual.

## Paginas Principais da Fase 1

1. Alunos: `/escola/administrativo/alunos`
2. Turmas: `/escola/pedagogico/turmas`
3. Calendario: `/escola/pedagogico/calendario`
4. Financeiro: `/escola/financeiro/faturas`
5. Cantina: pagina principal operacional do modulo (PDV no escopo atual)
6. Comunicados: `/escola/comunicados`

## UX da Pagina Simplificada (padrao)

- Header simples com titulo e contexto curto.
- Bloco de acoes primarias (1 a 3 botoes).
- Lista basica com colunas essenciais, sem filtros avancados.
- Estados obrigatorios:
  - vazio com CTA claro,
  - loading discreto,
  - erro com retry simples.
- Responsividade:
  - mobile: acoes empilhadas e lista compacta,
  - desktop: acoes em linha e tabela objetiva.

## Componentes Propostos

- `inertia/components/layouts/escola-layout-simplificado.tsx`
- `inertia/components/escola/simplified-page-shell.tsx`
- `inertia/components/escola/simplified-basic-list.tsx`

Esses componentes devem evitar acoplamento com regras de negocio de cada modulo.

## Permissoes e Seguranca

- Permissoes e visibilidade de acoes seguem as regras atuais.
- O layout simplificado nao altera autorizacao, apenas apresentacao e foco de navegacao.

## Testes

### Browser/E2E

- Toggle global ativa modo simplificado e persiste entre navegacoes.
- Cada pagina principal dos 6 modulos abre no layout simplificado quando `simple`.
- Ao voltar para `full`, cada pagina retorna ao comportamento existente.

### Regressao

- Validar que detalhes/edicoes nao foram afetados.
- Garantir que rotas e permissoes continuam inalteradas.

## Rollout

- Fase 1: 6 paginas principais com layout simplificado.
- Medir adocao e impacto operacional.
- Fase 2: avaliar expansao para outras paginas principais.

## Criterios de Sucesso

- Usuario navega e opera nas 6 paginas principais com menos passos e menor carga visual.
- Toggle global alterna a experiencia sem quebrar o modo completo.
- Nao ha regressao funcional em rotas, permissao e fluxos existentes.
