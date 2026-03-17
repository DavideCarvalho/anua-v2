# Cantina — Modal "Nova Cantina" com Combobox de Responsável

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ao criar uma cantina, permitir buscar um responsável existente na escola OU criar um novo usuário inline (nome + email), tudo em um único modal e uma única transação backend.

**Architecture:** O validator `createCanteenValidator` passa a aceitar `responsibleUserId` OU `responsibleUser: { name, email }` (mutuamente exclusivos). O controller cria o usuário (role `SCHOOL_CANTEEN` + vínculo `UserHasSchool`) dentro da mesma transação se `responsibleUser` for informado. No frontend, o modal de criação ganha um combobox que busca funcionários da escola em tempo real; se o usuário digitar algo que não encontra resultado, aparece opção "Criar '[texto]' como novo responsável" que expande campos de nome + email inline.

**Tech Stack:** AdonisJS 6 (Lucid ORM, VineJS), React + TanStack Query, shadcn/ui (Command + Popover para combobox)

---

## Contexto & Decisões

- `User.roleId` aponta para a tabela `Role` (não enum). O role `SCHOOL_CANTEEN` existe nessa tabela.
- Para determinar se alguém **é** responsável de cantina: verificar se `Canteen.responsibleUserId = user.id` (na escola).
- Para determinar se alguém **é** responsável de aluno: verificar se existe registro em `StudentHasResponsible` para esse usuário.
- O combobox usa `GET /api/v1/users/school-employees?search=...` — retorna todos da escola exceto STUDENT/STUDENT_RESPONSIBLE/ADMIN/SUPER_ADMIN. Quem já é responsável de outra cantina **pode** aparecer (sem filtro extra).
- Novo responsável criado **sem senha** (autenticação por código enviado ao email, padrão do sistema).
- Campos obrigatórios para criar responsável novo: `name` + `email`.

---

## Task 1: Expandir o validator do backend

**Files:**

- Modify: `app/validators/canteen.ts:4-10`

**Step 1: Atualizar o `createCanteenValidator` para aceitar ambos os modos**

Substituir:

```ts
export const createCanteenValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    schoolId: vine.string().trim(),
    responsibleUserId: vine.string().trim(),
  })
)
```

Por:

```ts
export const createCanteenValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    schoolId: vine.string().trim(),
    responsibleUserId: vine.string().trim().optional(),
    responsibleUser: vine
      .object({
        name: vine.string().trim().minLength(2).maxLength(255),
        email: vine.string().email().trim(),
      })
      .optional(),
  })
)
```

**Step 2: Verificar que o TypeScript compila**

```bash
node ace build --ignore-ts-errors 2>&1 | head -20
```

Esperado: sem erros relacionados a `canteen.ts`.

---

## Task 2: Atualizar o controller do backend

**Files:**

- Modify: `app/controllers/canteens/create_canteen_controller.ts`

**Step 1: Adicionar imports necessários**

O controller precisa importar `User`, `Role`, `UserHasSchool` e o helper de slug.

Verificar se existe utilitário de slug em:

```bash
grep -r "generateSlug\|slugify\|slug" app/helpers/ app/utils/ --include="*.ts" -l 2>/dev/null | head -5
```

Se não existir helper, usar `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')` inline.

**Step 2: Reescrever o controller com suporte ao novo fluxo**

```ts
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import User from '#models/user'
import Role from '#models/role'
import UserHasSchool from '#models/user_has_school'
import CanteenDto from '#models/dto/canteen.dto'
import { createCanteenValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class CreateCanteenController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const data = await request.validateUsing(createCanteenValidator)

    // Garante que exatamente um dos dois foi fornecido
    if (!data.responsibleUserId && !data.responsibleUser) {
      throw AppException.badRequest('Informe o responsável ou os dados para criar um novo')
    }
    if (data.responsibleUserId && data.responsibleUser) {
      throw AppException.badRequest('Informe apenas um: responsibleUserId ou responsibleUser')
    }

    if (!selectedSchoolIds?.includes(data.schoolId)) {
      throw AppException.forbidden('Sem permissão para criar cantina nesta escola')
    }

    const canteen = await db.transaction(async (trx) => {
      let responsibleUserId: string

      if (data.responsibleUser) {
        // Busca role SCHOOL_CANTEEN
        const role = await Role.findByOrFail('name', 'SCHOOL_CANTEEN')

        // Cria o usuário
        const slug = data.responsibleUser.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        const newUser = await User.create(
          {
            name: data.responsibleUser.name,
            email: data.responsibleUser.email,
            slug,
            active: true,
            roleId: role.id,
          },
          { client: trx }
        )

        // Vincula à escola
        await UserHasSchool.create(
          {
            userId: newUser.id,
            schoolId: data.schoolId,
            isDefault: true,
          },
          { client: trx }
        )

        responsibleUserId = newUser.id
      } else {
        responsibleUserId = data.responsibleUserId!
      }

      const newCanteen = await Canteen.create(
        {
          name: data.name,
          schoolId: data.schoolId,
          responsibleUserId,
        },
        { client: trx }
      )

      return newCanteen
    })

    return response.created(new CanteenDto(canteen))
  }
}
```

**Step 3: Verificar compilação TypeScript**

```bash
node ace build --ignore-ts-errors 2>&1 | grep -i "create_canteen" | head -10
```

Esperado: sem erros.

---

## Task 3: Teste manual do endpoint backend

**Step 1: Subir o servidor dev**

```bash
node ace serve --hmr
```

**Step 2: Testar criação com `responsibleUser` novo (usando curl ou Insomnia)**

```bash
# POST /api/v1/canteens com body:
# { "name": "Cantina Teste", "schoolId": "<id>", "responsibleUser": { "name": "Novo Resp", "email": "resp@test.com" } }
```

Esperado: HTTP 201, body com `id`, `name`, `responsibleUserId` preenchido com o ID do novo usuário.

**Step 3: Verificar no banco que o usuário foi criado com role correto**

```sql
SELECT u.id, u.name, u.email, r.name as role
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.email = 'resp@test.com';
```

Esperado: row com `role = 'SCHOOL_CANTEEN'`.

---

## Task 4: Combobox de responsável no frontend

**Files:**

- Modify: `inertia/components/cantina/canteen-gate.tsx`

O combobox usa os primitivos `Command` + `Popover` já disponíveis em `inertia/components/ui/`.

**Step 1: Adicionar estado e query para busca de responsável**

Adicionar ao componente `CanteenGate`:

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '~/lib/utils'
import { useDebounce } from '~/hooks/use-debounce' // verificar se existe, senão implementar inline

// Estado adicional dentro do componente:
const [responsibleSearch, setResponsibleSearch] = useState('')
const [responsiblePopoverOpen, setResponsiblePopoverOpen] = useState(false)
const [selectedResponsible, setSelectedResponsible] = useState<{
  id: string
  name: string
  email: string | null
} | null>(null)
const [createNewResponsible, setCreateNewResponsible] = useState(false)
const [newResponsibleName, setNewResponsibleName] = useState('')
const [newResponsibleEmail, setNewResponsibleEmail] = useState('')

const debouncedSearch = useDebounce(responsibleSearch, 300)

const { data: employeesData } = useQuery(
  api.api.v1.users.schoolEmployees.queryOptions({ query: { search: debouncedSearch, limit: 10 } })
)
const employees = employeesData?.data ?? []
```

**Step 2: Verificar se `useDebounce` existe**

```bash
grep -r "useDebounce" inertia/ --include="*.ts" --include="*.tsx" -l
```

Se não existir, criar `inertia/hooks/use-debounce.ts`:

```ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

**Step 3: Verificar rota da API para school-employees no cliente**

```bash
grep -r "schoolEmployees\|school_employees\|school-employees" inertia/lib/api* --include="*.ts" -l 2>/dev/null | head -5
```

Se o endpoint não estiver mapeado no cliente de API, verificar como outros endpoints são declarados e adicionar.

**Step 4: Atualizar `handleCreateCanteen` para suportar os dois modos**

```tsx
const handleCreateCanteen = async () => {
  if (isCreating) return

  const schoolId = props.selectedSchoolIds[0]
  if (!schoolId) {
    toast.error('Não foi possível identificar escola para criar cantina')
    return
  }

  const name = newCanteenName.trim()
  if (!name) {
    toast.error('Informe um nome para a cantina')
    return
  }

  // Validação do responsável
  if (createNewResponsible) {
    if (!newResponsibleName.trim() || !newResponsibleEmail.trim()) {
      toast.error('Informe nome e email do novo responsável')
      return
    }
  } else if (!selectedResponsible) {
    toast.error('Selecione ou crie um responsável')
    return
  }

  setIsCreating(true)
  try {
    const body = createNewResponsible
      ? {
          name,
          schoolId,
          responsibleUser: {
            name: newResponsibleName.trim(),
            email: newResponsibleEmail.trim(),
          },
        }
      : {
          name,
          schoolId,
          responsibleUserId: selectedResponsible!.id,
        }

    const canteen = await createCanteen.mutateAsync({ body })
    queryClient.invalidateQueries({ queryKey: api.api.v1.canteens.index.pathKey() })
    toast.success('Cantina criada com sucesso')
    setIsDialogOpen(false)
    resetForm()
    updateUrlCanteen(canteen.id)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Erro ao criar cantina')
  } finally {
    setIsCreating(false)
  }
}

const resetForm = () => {
  setNewCanteenName('')
  setSelectedResponsible(null)
  setCreateNewResponsible(false)
  setNewResponsibleName('')
  setNewResponsibleEmail('')
  setResponsibleSearch('')
}
```

Atualizar o `onOpenChange` do Dialog para chamar `resetForm()` ao fechar.

**Step 5: Renderizar o combobox dentro do `<DialogContent>`**

Substituir o formulário atual do dialog pelo novo layout:

```tsx
<div className="space-y-4">
  {/* Campo: Nome da cantina */}
  <div className="space-y-2">
    <Label htmlFor="canteen-name">Nome da cantina</Label>
    <Input
      id="canteen-name"
      value={newCanteenName}
      onChange={(e) => setNewCanteenName(e.target.value)}
      placeholder="Ex: Cantina Principal"
      disabled={isCreating}
    />
  </div>

  {/* Campo: Responsável */}
  <div className="space-y-2">
    <Label>Responsável</Label>
    {!createNewResponsible ? (
      <Popover open={responsiblePopoverOpen} onOpenChange={setResponsiblePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={responsiblePopoverOpen}
            className="w-full justify-between"
            disabled={isCreating}
          >
            {selectedResponsible ? selectedResponsible.name : 'Buscar responsável...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nome ou email..."
              value={responsibleSearch}
              onValueChange={setResponsibleSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-2 text-sm text-muted-foreground">
                  Nenhum resultado encontrado.
                </div>
              </CommandEmpty>
              {employees.length > 0 && (
                <CommandGroup heading="Funcionários da escola">
                  {employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={employee.id}
                      onSelect={() => {
                        setSelectedResponsible(employee)
                        setResponsiblePopoverOpen(false)
                        setResponsibleSearch('')
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedResponsible?.id === employee.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{employee.name}</span>
                        {employee.email && (
                          <span className="text-xs text-muted-foreground">{employee.email}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {/* Opção de criar novo */}
              <CommandGroup>
                <CommandItem
                  value="__create_new__"
                  onSelect={() => {
                    setCreateNewResponsible(true)
                    setNewResponsibleName(responsibleSearch)
                    setResponsiblePopoverOpen(false)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {responsibleSearch
                    ? `Criar "${responsibleSearch}" como novo responsável`
                    : 'Criar novo responsável'}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    ) : (
      /* Modo criar novo responsável */
      <div className="space-y-3 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Novo responsável</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCreateNewResponsible(false)
              setNewResponsibleName('')
              setNewResponsibleEmail('')
            }}
            disabled={isCreating}
          >
            Cancelar
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsible-name">Nome</Label>
          <Input
            id="responsible-name"
            value={newResponsibleName}
            onChange={(e) => setNewResponsibleName(e.target.value)}
            placeholder="Nome completo"
            disabled={isCreating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsible-email">Email</Label>
          <Input
            id="responsible-email"
            type="email"
            value={newResponsibleEmail}
            onChange={(e) => setNewResponsibleEmail(e.target.value)}
            placeholder="email@escola.com.br"
            disabled={isCreating}
          />
        </div>
      </div>
    )}
  </div>
</div>
```

**Step 6: Verificar que o tipo do body aceito pela mutation inclui os novos campos**

Se houver tipagem gerada automaticamente para a API (ex: via `api-types`), verificar se o body de `canteens.store` precisa ser atualizado manualmente.

```bash
grep -r "canteens.*store\|store.*canteens" inertia/lib/ --include="*.ts" -l | head -5
```

Se os tipos forem inferidos do backend automaticamente (ex: Scoutbar, tuyau), fazer rebuild dos tipos:

```bash
node ace generate:types 2>/dev/null || node ace tuyau 2>/dev/null || echo "Sem geração de tipos"
```

---

## Task 5: Garantir que o tipo do body aceita `responsibleUser`

**Files:**

- Verificar: `inertia/lib/api.ts` ou equivalente
- Verificar: qualquer arquivo gerado de tipos de API

**Step 1: Localizar onde os tipos da API são definidos**

```bash
grep -r "responsibleUserId" inertia/ --include="*.ts" --include="*.tsx" | head -10
```

**Step 2: Se os tipos forem gerados manualmente (não auto-gerado)**

Atualizar o tipo do body de criação de cantina para:

```ts
body: {
  name: string
  schoolId: string
  responsibleUserId?: string
  responsibleUser?: { name: string; email: string }
}
```

**Step 3: Resolver erros de TypeScript se houver**

```bash
npx tsc --noEmit 2>&1 | grep "cantina\|canteen\|canteen-gate" | head -20
```

---

## Task 6: Smoke test visual no browser

**Step 1: Subir dev server**

```bash
node ace serve --hmr
```

**Step 2: Navegar para qualquer página de cantina**

Abrir `http://localhost:3333/escola/cantina/pedidos` (ou equivalente).

**Step 3: Testar fluxo "selecionar responsável existente"**

1. Clicar em "Nova Cantina" (ou "Criar cantina" no empty state)
2. Modal abre — deve ter campo "Nome da cantina" e combobox de responsável
3. Clicar no combobox → Popover abre com CommandInput
4. Digitar nome de um funcionário existente → lista filtra em tempo real
5. Selecionar → combobox fecha, nome do selecionado aparece no trigger
6. Preencher nome da cantina → clicar "Criar cantina"
7. Toast de sucesso aparece, modal fecha, URL atualiza com `canteenId`

**Step 4: Testar fluxo "criar novo responsável"**

1. Abrir modal
2. No combobox, digitar algo que não existe
3. Clicar "Criar '[texto]' como novo responsável"
4. Formulário inline de nome + email aparece
5. Preencher ambos
6. Clicar "Criar cantina"
7. Toast de sucesso, modal fecha

**Step 5: Testar validações**

- Tentar criar sem nome de cantina → toast de erro
- Tentar criar sem selecionar responsável → toast de erro
- Tentar criar novo responsável sem email → toast de erro

---

## Notas Finais

### Sobre "quem é responsável de cantina"

A forma correta de determinar se um usuário é responsável de uma cantina é:

```sql
SELECT * FROM "Canteen" WHERE "responsibleUserId" = :userId AND "schoolId" = :schoolId
```

Não depender do `Role.name = 'SCHOOL_CANTEEN'` como única fonte de verdade, pois o role pode ser alterado independentemente do vínculo com a cantina.

### Sobre "quem é responsável por aluno"

Verificar existência de registro em `StudentHasResponsible`:

```sql
SELECT * FROM "StudentHasResponsible" WHERE "userId" = :userId
```

### Sobre o `useDebounce`

Verificar antes de criar se já existe no projeto. Muitos projetos Inertia/React já têm um.
