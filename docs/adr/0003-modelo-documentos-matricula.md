---
status: accepted
---

# Modelo de Documentos de Matrícula: Submissão como Unidade Revisada + Armazenamento Privado

A tabela `StudentDocument` atual mistura conceitos: `status` (PENDING/APPROVED/REJECTED) vive na **linha do arquivo**, mas conceitualmente a unidade que a secretaria revisa é o **slot do documento** (ex: "RG"). Isso impede que um slot tenha múltiplos arquivos (frente + verso, ou comprovante = conta de luz + IPTU) sem que cada arquivo carregue seu próprio status — gerando situações ambíguas como "frente aprovada, verso rejeitada, o slot tá com qual status?". Além disso, todos os disks do `@adonisjs/drive` estão configurados com `visibility: 'public'`, o que é inaceitável para CPF, RG e comprovante de residência sob LGPD.

Decisão dupla:

**1. Schema novo, separando slot revisado e arquivo físico:**

```
StudentDocumentSubmission        // 1 por slot (ContractDocument × Student)
  id, contractDocumentId, studentId
  status (PENDING | APPROVED | REJECTED)
  rejectionReason, reviewedBy, reviewedAt
  submittedAt
StudentDocumentFile              // N por submission
  id, submissionId, fileName, fileUrl, mimeType, size, ord
```

A `Submission` é a unidade que a secretaria aprova/rejeita; carrega o histórico de revisão. Cada `File` é um blob físico. Múltiplos arquivos por slot são suportados naturalmente (1:N).

**Reupload de slot rejeitado: replace.** Quando o responsável reenvia, a `Submission` existente é **atualizada** (`status → PENDING`, `rejectionReason → null`, `reviewedBy → null`, `submittedAt → now`) e os `Files` antigos são **deletados** (storage + DB). Os novos arquivos entram. **Histórico não é preservado** — auditoria de quem revisou e por que rejeitou é perdida no momento do reenvio. Trade-off consciente: o que importa é o estado atual; o log de atividade (`evlog_middleware`) cobre o "quem fez o quê" se precisar reconstruir.

**2. Storage privado por padrão em todos os disks:**

`config/drive.ts` passa a usar `visibility: 'private'` em `fs`, `gcs` e `s3`. Acesso a qualquer arquivo (incluindo logo de escola e anexos de presença existentes) passa a ser via **URLs assinadas com expiração curta** (5 minutos para documentos sensíveis de matrícula; expirações maiores para assets como logo, gerados sob demanda na renderização).

## Considered Options

**Schema:**

- **Schema atual + delete-and-recreate por slot** (linhas por arquivo, replace = deletar todas e recriar). Rejeitado: secretaria revisaria arquivo-a-arquivo, gerando dois status pra um slot que conceitualmente é uno. UX da revisão fica ambígua.
- **Append em vez de replace** (preservar histórico de submissões). Rejeitado: complexifica a query de "qual é o estado atual?" (precisa de `latest_by` window function), aumenta volume de storage, e o usuário foi explícito que histórico não é prioridade. O log de atividade cobre auditoria suficiente.
- **Single-file por slot** (família combina frente+verso num PDF). Rejeitado: pedir "PDF combinado" via WhatsApp é onde o formulário morre na prática.

**Storage:**

- **Manter padrão `public` e criar disk privado separado só pra documentos**. Rejeitado: documentos de presença (atestados médicos) e potencialmente logo da escola também merecem proteção. "Privado por padrão" é a postura LGPD correta — assets que precisam ser públicos (raros) viram exceção explícita.

## Consequences

- Migration necessária: criar `StudentDocumentSubmission` e `StudentDocumentFile`, migrar dados existentes (se houver), depois drop da tabela `StudentDocument` antiga.
- `get_student_documents_controller.ts` (responsável) e `update_document_status_controller.ts` (secretaria) precisam ser reescritos pra trabalhar em `Submission` em vez de `StudentDocument`.
- Upload pelo responsável é controller novo (`responsavel/upload_student_document_controller.ts`) — não existe hoje, reusa o pattern de `attendance/upload_attendance_attachment_controller.ts` e `lib/file_security.ts`.
- Renderização de logo da escola e anexos de presença passa a precisar gerar signed URL no momento de servir. Pequena migração nos templates/components que renderizam `<img>` com path direto.
- ADR-0001 fica consistente: o eixo Documentação passa a contar `Submission.status = APPROVED` em vez de `StudentDocument.status`.
