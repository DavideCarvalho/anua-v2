# Perguntas do Responsável - Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir que responsáveis enviem perguntas sobre seus filhos para a escola (professores, coordenação e direção) e recebam respostas de forma assíncrona.

**Architecture:** Sistema dedicado de "Perguntas" (ParentInquiry) separado do sistema de comunicados. Cada pergunta é vinculada a um aluno específico e roteada automaticamente para todos os destinatários relevantes (professores do StudentHasLevel, coordenação do nível, e direção da escola). Múltiplas respostas são permitidas, criando um fórum de discussão.

**Tech Stack:** AdonisJS (Lucid ORM), React (Inertia), TanStack Query, shadcn/ui, @jrmc/adonis-attachment (anexos), @adonisjs/mail (notificações)

---

## Data Model

### New Tables

#### `ParentInquiry`

Armazena cada pergunta/ticket aberto pelo responsável.

| Column                 | Type        | Description                          |
| ---------------------- | ----------- | ------------------------------------ |
| id                     | text (UUID) | Primary key                          |
| studentId              | text        | FK → Student.id                      |
| createdByResponsibleId | text        | FK → User.id (responsável que criou) |
| schoolId               | text        | FK → School.id                       |
| subject                | text        | Assunto/título da pergunta           |
| status                 | text        | OPEN, RESOLVED, CLOSED               |
| resolvedAt             | timestamp   | Quando foi marcada como resolvida    |
| resolvedBy             | text        | FK → User.id (quem resolveu)         |
| createdAt              | timestamp   |                                      |
| updatedAt              | timestamp   |                                      |

#### `ParentInquiryMessage`

Cada mensagem dentro de uma pergunta (tanto a inicial quanto respostas).

| Column     | Type        | Description                                 |
| ---------- | ----------- | ------------------------------------------- |
| id         | text (UUID) | Primary key                                 |
| inquiryId  | text        | FK → ParentInquiry.id                       |
| authorId   | text        | FK → User.id                                |
| authorType | text        | RESPONSIBLE, TEACHER, COORDINATOR, DIRECTOR |
| body       | text        | Conteúdo da mensagem                        |
| createdAt  | timestamp   |                                             |
| updatedAt  | timestamp   |                                             |

#### `ParentInquiryAttachment`

Anexos das mensagens.

| Column    | Type        | Description                  |
| --------- | ----------- | ---------------------------- |
| id        | text (UUID) | Primary key                  |
| messageId | text        | FK → ParentInquiryMessage.id |
| fileName  | text        | Nome original do arquivo     |
| filePath  | text        | Caminho no storage           |
| fileSize  | integer     | Tamanho em bytes             |
| mimeType  | text        | Tipo MIME                    |
| createdAt | timestamp   |                              |

#### `ParentInquiryRecipient`

Destinatários da escola que devem ver a pergunta.

| Column    | Type        | Description                    |
| --------- | ----------- | ------------------------------ |
| id        | text (UUID) | Primary key                    |
| inquiryId | text        | FK → ParentInquiry.id          |
| userId    | text        | FK → User.id                   |
| userType  | text        | TEACHER, COORDINATOR, DIRECTOR |
| createdAt | timestamp   |                                |

### Indexes

- `ParentInquiry`: (studentId), (schoolId), (status), (createdByResponsibleId)
- `ParentInquiryMessage`: (inquiryId), (authorId)
- `ParentInquiryAttachment`: (messageId)
- `ParentInquiryRecipient`: (inquiryId), (userId), unique(inquiryId, userId)

---

## Recipient Resolution Logic

Quando um responsável cria uma pergunta para um aluno, o sistema determina automaticamente os destinatários:

1. **Professores**: Buscar todos os `TeacherHasClass` onde `classId` = aluno's `classId` (via `StudentHasLevel`)
2. **Coordenação**: Buscar `CoordinatorHasLevel` para o nível do aluno
3. **Direção**: Buscar usuários com role `SCHOOL_DIRECTOR` na escola

---

## API Endpoints

### Responsável

| Method | Endpoint                                            | Description                        |
| ------ | --------------------------------------------------- | ---------------------------------- |
| GET    | `/api/v1/responsavel/students/:studentId/inquiries` | Lista perguntas do aluno           |
| POST   | `/api/v1/responsavel/students/:studentId/inquiries` | Cria nova pergunta                 |
| GET    | `/api/v1/responsavel/inquiries/:inquiryId`          | Detalhes da pergunta com mensagens |
| POST   | `/api/v1/responsavel/inquiries/:inquiryId/messages` | Adiciona mensagem                  |
| POST   | `/api/v1/responsavel/inquiries/:inquiryId/resolve`  | Marca como resolvida               |

### Escola

| Method | Endpoint                                       | Description                        |
| ------ | ---------------------------------------------- | ---------------------------------- |
| GET    | `/api/v1/escola/inquiries`                     | Lista todas as perguntas da escola |
| GET    | `/api/v1/escola/inquiries/:inquiryId`          | Detalhes da pergunta               |
| POST   | `/api/v1/escola/inquiries/:inquiryId/messages` | Adiciona resposta                  |
| POST   | `/api/v1/escola/inquiries/:inquiryId/resolve`  | Marca como resolvida               |

---

## Pages

### Responsável

- `/responsavel/perguntas` - Lista perguntas do aluno selecionado
- `/responsavel/perguntas/:id` - Detalhes da pergunta

### Escola

- `/escola/perguntas` - Lista todas as perguntas da escola
- `/escola/perguntas/:id` - Detalhes da pergunta

---

## Notifications

Quando uma pergunta é criada:

- Notificação in-app para cada destinatário
- Email para cada destinatário

Quando uma resposta é adicionada:

- Notificação in-app para o responsável (se resposta da escola)
- Notificação in-app para destinatários da escola (se resposta do responsável)
- Email correspondente

---

## Implementation Order

1. Database migrations
2. Models and transformers
3. Recipient resolution service
4. API controllers (responsável)
5. API controllers (escola)
6. Frontend pages (responsável)
7. Frontend pages (escola)
8. Notification integration
9. Tests
