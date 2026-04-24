# Design: Preview unificado de anexos em comunicados do responsavel

## Contexto

- A listagem de comunicados do responsavel atualmente exibe anexos no card.
- O comportamento atual abre arquivo em nova aba.
- A necessidade validada e ter um modal unico (estilo lightbox) para navegar entre anexos sem sair do app.

## Objetivo

Implementar um unico modal fullscreen com fundo escuro para preview de anexos de comunicado, suportando imagem e PDF no mesmo fluxo de navegacao.

## Decisao de produto

- Usar um modal unico para todos os tipos.
- Renderizacao por tipo no corpo do modal:
  - `image/*` => preview de imagem.
  - `application/pdf` (ou extensao `.pdf`) => preview em iframe.
  - outros tipos => fallback com acoes de abrir/baixar.

## Abordagens avaliadas

1. Modal unico com renderizacao por tipo (escolhida)
2. Modal unico usando viewer externo
3. Modal com proxy backend dedicado para preview

Escolha: abordagem 1 para entrega rapida, sem dependencia nova e com baixo risco.

## UX esperada

- Clique no anexo abre modal fullscreen com overlay escuro.
- Header do modal com:
  - nome do arquivo,
  - indice atual (`2/5`),
  - acoes `anterior`, `proximo`, `baixar`, `fechar`.
- Teclado:
  - `ArrowLeft` e `ArrowRight` para navegar,
  - `Escape` para fechar.
- Ao navegar de imagem para PDF, o modal permanece igual (mesmo fundo/estrutura), mudando apenas o renderer.

## Arquitetura proposta

- Criar componente reutilizavel:
  - `inertia/components/ui/file-preview-lightbox.tsx`
- API do componente:
  - `files: Array<{ id: string; fileName: string; fileUrl?: string | null; mimeType?: string | null }>`
  - `open: boolean`
  - `initialIndex: number`
  - `onOpenChange: (open: boolean) => void`
- Integracao na pagina:
  - `inertia/pages/responsavel/comunicados.tsx`
  - itens da lista de anexos deixam de abrir nova aba e passam a abrir o modal no indice correto.

## Regras de fallback

- Se `fileUrl` for nulo: estado `Arquivo indisponivel` no viewer.
- Se PDF nao carregar no iframe: mostrar fallback com botoes `Abrir em nova aba` e `Baixar`.
- Tipo nao suportado: mostrar icone/documento + acoes de abrir/baixar.

## Acessibilidade

- Foco inicial no modal ao abrir.
- Elementos de controle com rotulos acessiveis.
- Navegacao por teclado funcional sem mouse.

## Validacao

- `pnpm run typecheck` (quando baseline local permitir).
- Smoke manual em producao com comunicado contendo imagem + PDF.
- Confirmar:
  - abertura in-app,
  - navegacao entre anexos,
  - fallback em arquivo sem URL.

## Fora de escopo

- Zoom/pinch avancado.
- Rotacao de imagem.
- Proxy backend para stream autenticado dedicado.
