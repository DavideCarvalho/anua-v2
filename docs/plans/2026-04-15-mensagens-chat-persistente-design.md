# Mensagens - Chat Persistente com Read Tracking

## Problema

A página "Dúvidas dos responsáveis" usa o modelo de inquiry com status OPEN/RESOLVED/CLOSED, mas queremos uma experiência tipo chat persistente (WhatsApp-like) onde conversas nunca fecham.

## Decisões

### 1. Título automático

Cada thread usa título gerado: `"Chat com [Nome do Responsável]"`. Isso permite que múltiplos responsáveis do mesmo aluno tenham threads separadas.

### 2. Remover conceito de "resolver"

- Remover botão "Marcar como resolvida"
- Remover status badge (OPEN/RESOLVED/CLOSED) da UI
- Inquiries permanecem OPEN para sempre (chat persistente)
- Status field continua no modelo mas não é exposto na UI

### 3. Read tracking

Nova tabela `ParentInquiryReadStatus`:

- `userId` (quem leu)
- `inquiryId` (qual conversa)
- `lastReadAt` (quando leu pela última vez)

Quando o usuário abre uma conversa, atualiza `lastReadAt = now`.

Mensagem não lida = `message.createdAt > lastReadAt` (ou `lastReadAt IS NULL` se nunca leu).

### 4. Badge na sidebar

Conta inquiries com mensagens não lidas pelo usuário logado:

```sql
SELECT COUNT(*) FROM ParentInquiry i
JOIN ParentInquiryReadStatus r ON r.inquiryId = i.id AND r.userId = :userId
JOIN ParentInquiryMessage m ON m.inquiryId = i.id
WHERE m.createdAt > r.lastReadAt
```

### 5. Lista de mensagens

- Ordenar por `updatedAt` (última mensagem mais recente primeiro)
- Preview da última mensagem + hora
- Indicador visual de "não lida" (bolinha azul ou destaque)

## Backend Changes

### Nova migração

```
ParentInquiryReadStatus:
  - id (uuid v7)
  - userId (uuid)
  - inquiryId (uuid)
  - lastReadAt (datetime)
  - createdAt, updatedAt
  - unique(userId, inquiryId)
```

### Novo endpoint

`POST /api/v1/escola/inquiries/:inquiryId/mark-read`

- Atualiza ou cria `ParentInquiryReadStatus` para o usuário logado

### Lista de inquiries

- Adicionar campo `hasUnread: boolean` na resposta
- Adicionar campo `lastMessage: { body, createdAt, authorName }`
- Ordenar por `updatedAt DESC` por padrão

### Frontend Changes

#### `escola-layout.tsx`

- `UnreadMessagesBadge` conta inquiries com `hasUnread === true`

#### `perguntas.tsx`

- Lista estilo chat: nome do responsável, preview da última mensagem, hora
- Indicador de não lida
- Remover status badges

#### `pergunta-detail.tsx`

- Ao abrir, disparar `mark-read`
- Remover botão "Marcar como resolvida"
- Remover status badge
- Auto-scroll para última mensagem
