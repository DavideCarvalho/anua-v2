# Design: Visualizacao de anexos em comunicados do responsavel

## Contexto

- A pagina `inertia/pages/responsavel/comunicados.tsx` lista comunicados com titulo, corpo e status de ciencia.
- A API ja retorna anexos no endpoint `GET /api/v1/responsavel/comunicados` via preload de `attachments` e transformer de comunicado.
- Cada anexo ja possui `fileName` e `fileUrl` no payload serializado.

## Objetivo

Permitir que o responsavel abra/baixe anexos diretamente na lista de comunicados, sem criar uma tela de detalhe agora.

## Abordagens avaliadas

1. Links simples por anexo na lista (recomendada)
   - Menor risco e menor esforco.
   - Usa dados ja disponiveis no payload.
2. Links + botao de baixar tudo
   - Melhor para muitos arquivos, mas pode gerar bloqueio de popups.
3. Preview inline para imagem/PDF
   - UX mais rica, porem maior complexidade e risco de regressao.

Decisao: implementar a abordagem 1.

## Proposta de UX/UI

- Em cada card de comunicado, exibir secao `Anexos` somente quando houver anexos.
- Cada item deve mostrar:
  - icone de anexo (`Paperclip`),
  - nome do arquivo (`fileName`) com truncamento,
  - acao de abrir arquivo (`Abrir`) com `target="_blank"` e `rel="noopener noreferrer"`.
- O fluxo de ciencia (`Li e estou ciente`) permanece inalterado.

## Dados e contrato

- Sem alteracoes no backend para esta entrega.
- Atualizar tipagem frontend de `AnnouncementItem` para incluir:
  - `attachments?: Array<{ id: string; fileName: string; fileUrl?: string | null }>`

## Erros e fallback

- Se `fileUrl` estiver ausente, renderizar o item como indisponivel com label `Arquivo indisponivel`.
- Se nao houver anexos, nao renderizar bloco de anexos.

## Validacao

- Rodar `pnpm run typecheck`.
- Teste manual em `/responsavel/comunicados?aluno=...` com cenarios:
  - comunicado sem anexo,
  - comunicado com 1 anexo,
  - comunicado com varios anexos,
  - anexo com `fileUrl` nulo.

## Fora de escopo

- Criar pagina de detalhe de comunicado para responsavel.
- Preview inline de PDF/imagem.
- Download em lote.
