# Teacher Subjects Management Design

## Overview

Implementar gerenciamento de disciplinas por professor e filtrar matérias no modal de turmas.

## Problema

1. Na página de professores, não há como editar um professor existente
2. No modal de turmas, ao selecionar professor, mostra todas as matérias em vez de apenas as que ele leciona

## Solução

### Página de Professores

Adicionar menu dropdown com 4 ações:
- **Editar dados** - modal para nome e email
- **Editar valor hora/aula** - modal para hourlyRate
- **Editar disciplinas** - modal com checkboxes de disciplinas
- **Desativar/Ativar** - toggle de status

### Modal de Turmas

Ao selecionar professor:
- Buscar disciplinas via `GET /api/v1/teachers/:id/subjects`
- Se vazio: mostrar aviso "Sem disciplinas cadastradas" e desabilitar select
- Se tiver: popular select apenas com disciplinas do professor

## API

### Endpoint Novo

```
PUT /api/v1/teachers/:id/subjects
```

Request:
```json
{
  "subjectIds": ["uuid1", "uuid2"]
}
```

Response:
```json
{
  "id": "teacher-uuid",
  "subjects": [
    { "id": "uuid1", "name": "Matemática" },
    { "id": "uuid2", "name": "Física" }
  ]
}
```

Lógica:
1. Remover todos TeacherHasSubject do professor
2. Criar novos registros para cada subjectId

### Endpoints Existentes Utilizados

- `GET /api/v1/teachers/:id/subjects` - listar disciplinas do professor
- `PUT /api/v1/teachers/:id` - atualizar dados do professor

## Arquivos

### A Criar

| Arquivo | Descrição |
|---------|-----------|
| `app/controllers/teachers/update_teacher_subjects_controller.ts` | Controller para PUT subjects |
| `inertia/containers/teachers/edit-teacher-data-modal.tsx` | Modal editar nome/email |
| `inertia/containers/teachers/edit-teacher-rate-modal.tsx` | Modal editar hora/aula |
| `inertia/containers/teachers/edit-teacher-subjects-modal.tsx` | Modal editar disciplinas |

### A Modificar

| Arquivo | Alteração |
|---------|-----------|
| `start/routes.ts` | Adicionar rota PUT teachers/:id/subjects |
| `inertia/containers/teachers-list-container.tsx` | Dropdown menu + integração modais |
| `inertia/containers/classes/edit-class-modal.tsx` | Filtrar matérias por professor selecionado |

## Fluxo UX - Modal de Turmas

```
1. Usuário seleciona professor
   ↓
2. Query GET /api/v1/teachers/:id/subjects
   ↓
3a. Se vazio:
    - Badge amarelo: "Sem disciplinas cadastradas"
    - Select de matéria desabilitado
    - Tooltip: "Configure as disciplinas primeiro"
   ↓
3b. Se tiver disciplinas:
    - Popular select com disciplinas do professor
    - Limpar seleção anterior de matéria
```

## Componentes UI

### Menu de Ações (Professores)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <MoreHorizontal />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={openDataModal}>
      <Edit /> Editar dados
    </DropdownMenuItem>
    <DropdownMenuItem onClick={openRateModal}>
      <DollarSign /> Editar valor hora/aula
    </DropdownMenuItem>
    <DropdownMenuItem onClick={openSubjectsModal}>
      <BookOpen /> Editar disciplinas
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={toggleActive}>
      {active ? <UserX /> : <UserCheck />}
      {active ? 'Desativar' : 'Ativar'}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Aviso Sem Disciplinas (Modal Turmas)

```tsx
{!teacherSubjects?.length && selectedTeacherId && (
  <div className="flex items-center gap-2 text-amber-600 text-sm">
    <AlertCircle className="h-4 w-4" />
    <span>Professor sem disciplinas cadastradas</span>
  </div>
)}
```
