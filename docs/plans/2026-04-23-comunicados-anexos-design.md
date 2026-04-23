# Comunicados com Anexos Design

## Objetivo

Permitir que a escola envie comunicados com multiplos anexos e que responsaveis possam visualizar/baixar esses arquivos no app.

## Escopo aprovado

- Multiplos anexos por comunicado
- Tipos permitidos: PDF, DOCX, JPG, JPEG, PNG, WEBP
- Limite de 10 MB por arquivo
- Maximo de 5 arquivos por comunicado
- Disponivel em criar e editar comunicado
- Disponivel para leitura na area do responsavel

## Arquitetura

1. Persistencia de anexos em tabela propria relacionada a `SchoolAnnouncement`.
2. Upload de arquivo em endpoint dedicado, retornando metadados para vinculacao ao comunicado.
3. Endpoints de criar/editar comunicado passam a aceitar lista de anexos (ids e ordem), validando limites.
4. Transformer de comunicado inclui anexos para escola e responsavel.

## Fluxo de upload

1. Usuario escolhe arquivos na UI de comunicado.
2. Frontend valida rapidamente tipo/tamanho/quantidade.
3. Frontend envia cada arquivo para endpoint de upload (`multipart/form-data`).
4. Backend valida novamente e persiste arquivo + metadados.
5. Frontend adiciona item na lista local de anexos do formulario.
6. Ao salvar comunicado, backend sincroniza anexos vinculados ao comunicado.

## Regras de negocio

- Apenas escola autenticada pode subir anexos de comunicados.
- Um comunicado nao pode ter mais de 5 anexos vinculados.
- Arquivo invalido (tipo/tamanho) retorna erro de validacao claro.
- No editar, remover anexo desvincula do comunicado.
- Comunicados publicados continuam imutaveis para conteudo/anexos.

## UX

- Bloco "Anexos" no criar/editar com:
  - seletor multiplo de arquivos
  - estado de upload por item
  - lista de anexos com remover
  - toasts de sucesso/erro
- No responsavel, card do comunicado ganha secao "Anexos" com links para abrir/baixar.

## Seguranca

- Validacao server-side obrigatoria de MIME e tamanho.
- Nomes de arquivo sanitizados na persistencia.
- Resposta de erro sem vazar detalhes internos.

## Testes

- API:
  - upload valido
  - rejeicao por tipo invalido
  - rejeicao por tamanho
  - rejeicao por exceder 5 anexos
  - sincronizacao de anexos em create/update
- Browser/UI:
  - adicionar e remover anexos no novo/editar
  - toasts e bloqueios de validacao
  - visualizacao dos anexos no responsavel
