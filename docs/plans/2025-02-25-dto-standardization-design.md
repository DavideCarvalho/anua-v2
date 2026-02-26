# Design: Padronização de DTOs em Todos os Endpoints

**Data:** 2025-02-25  
**Status:** Aprovado para Implementação  
**Abordagem:** Migração Total em Fases (Opção 1)

---

## 1. Contexto

O projeto atualmente possui **584 controllers**, sendo que:

- ✅ **~51 controllers** já usam DTOs corretamente
- ⚠️ **~140 controllers** retornam modelos Lucid diretamente (expondo estrutura interna)
- 🔍 **~121 controllers** retornam objetos customizados (precisam avaliação)
- 📦 **7 controllers** usam `.serialize()` (serialização básica)
- 📄 **~200 controllers** são de páginas/redirecionamentos (não aplicável)

### Problema

Controllers que retornam modelos diretamente:

- Expor campos sensíveis ou internos do banco de dados
- Retornam mais dados do que necessário para o cliente
- Não permitem controle sobre o formato da resposta
- Dificultam manutenção e evolução da API

---

## 2. Objetivo

Padronizar **100% dos endpoints JSON** para usar DTOs, garantindo:

- Controle explícito sobre os dados expostos
- Consistência na API
- Facilidade de manutenção
- Segurança (não expor campos internos)

---

## 3. Estratégia: Migração em Fases

### Estrutura de DTOs

```
app/models/dto/
├── [model].dto.ts                    # DTO principal do modelo
├── [model]_list.dto.ts               # DTO para listagens (campos mínimos)
├── [model]_minimal.dto.ts            # DTO com campos essenciais
├── [model]_with_[relation].dto.ts    # DTO com relações específicas
└── [endpoint]_response.dto.ts        # DTO específico para endpoints complexos
```

### Padrão de Implementação

**DTO Base (usando @adocasts.com/dto):**

```typescript
import { BaseModelDto } from '@adocasts.com/dto/base'
import type ModelName from '#models/model_name'

export default class ModelNameDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare createdAt: Date
  // ... outros campos necessários

  constructor(model?: ModelName) {
    super()
    if (!model) return

    this.id = model.id
    this.name = model.name
    this.createdAt = model.createdAt.toJSDate()
  }
}
```

**Controller Atualizado:**

```typescript
// ❌ Antes
return response.ok(model)

// ✅ Depois
return response.ok(new ModelNameDto(model))

// ✅ Para listas
return response.ok(models.map((m) => new ModelNameListDto(m)))
```

---

## 4. Fases de Implementação

### Fase 1: Domínios Críticos (Semana 1-2)

**Prioridade:** Endpoints mais usados e sensíveis

- [ ] **Canteen** (~15 controllers)
  - `canteen_purchases/*`
  - `canteen_items/*`
  - `canteen_meals/*`
- [ ] **Events** (~12 controllers)
  - `events/*` (já parcialmente com DTO)
  - `event_participants/*`

### Fase 2: Core Business (Semana 3-4)

**Prioridade:** Funcionalidades centrais

- [ ] **Students** (~20 controllers)
  - `students/*`
  - `enrollments/*`
  - `student_payments/*`
- [ ] **Academic** (~18 controllers)
  - `classes/*`
  - `courses/*`
  - `levels/*`
  - `subjects/*`

### Fase 3: Gestão Escolar (Semana 5-6)

**Prioridade:** Administração e configurações

- [ ] **School Management** (~25 controllers)
  - `schools/*`
  - `school_chains/*`
  - `school_groups/*`
  - `school_partners/*`
  - `users/*`
  - `user_schools/*`

### Fase 4: Features Específicas (Semana 7-8)

**Prioridade:** Funcionalidades específicas

- [ ] **Store/Marketplace** (~20 controllers)
  - `store_owner/*`
  - `store_items/*`
  - `store_orders/*`
  - `marketplace/*`

- [ ] **Gamification** (~10 controllers)
  - `gamification_events/*`
  - `leaderboards/*`
  - `levels/*`
  - `student_gamifications/*`

- [ ] **Insurance** (~15 controllers)
  - `insurance/*`

### Fase 5: Features Adicionais (Semana 9-10)

**Prioridade:** Completar migração

- [ ] **Assignments** (~8 controllers)
- [ ] **Attendance** (~8 controllers)
- [ ] **Extra Classes** (~8 controllers)
- [ ] **Print Requests** (~8 controllers)
- [ ] **Purchase Requests** (~8 controllers)
- [ ] **Posts/Comments** (~8 controllers)
- [ ] **Scholarships** (~5 controllers)
- [ ] **Subscriptions/Contracts** (~10 controllers)
- [ ] **Notifications** (~5 controllers)
- [ ] **Teachers** (~10 controllers)
- [ ] **Occurrences** (~5 controllers)

### Fase 6: Finalização (Semana 11-12)

**Prioridade:** Limpeza e padronização

- [ ] Analytics controllers (retornos customizados)
- [ ] Dashboard controllers
- [ ] Responsável controllers
- [ ] Remover `.serialize()` restantes
- [ ] Documentação final

---

## 5. Convenções

### Nomenclatura

- `[ModelName]Dto` - DTO completo do modelo
- `[ModelName]ListDto` - DTO para listagens (campos mínimos)
- `[ModelName]MinimalDto` - DTO com campos essenciais
- `[ModelName]With[Relation]Dto` - DTO com relações
- `[Endpoint]ResponseDto` - DTO específico de endpoint

### Estrutura de DTO

```typescript
import { BaseModelDto } from '@adocasts.com/dto/base'
import type Model from '#models/model'
import RelatedModelDto from '#models/dto/related_model.dto'

export default class ModelDto extends BaseModelDto {
  // Campos obrigatórios
  declare id: string
  declare name: string

  // Campos opcionais
  declare description: string | null
  declare metadata: Record<string, unknown> | null

  // Relações (quando preloaded)
  declare relation?: RelatedModelDto
  declare relations?: RelatedModelDto[]

  // Timestamps
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: Model) {
    super()
    if (!model) return

    this.id = model.id
    this.name = model.name
    this.description = model.description
    this.metadata = model.metadata
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()

    // Relações
    if (model.$preloaded.relation) {
      this.relation = new RelatedModelDto(model.$preloaded.relation)
    }
  }
}
```

### Tratamento de Relações

- Sempre verificar `model.$preloaded.[relation]` antes de criar DTOs de relação
- Usar `?.` para campos opcionais de relações
- Para listas, usar `map()` com verificação

### Tratamento de Datas

- Sempre converter `DateTime` do Luxon para `Date` do JavaScript:
  ```typescript
  this.createdAt = model.createdAt.toJSDate()
  ```

---

## 6. Endpoints com Retornos Customizados

Alguns endpoints retornam objetos literais que **podem permanecer assim** (não precisam de DTO):

1. **Respostas simples de status:**
   - `{ success: true }`
   - `{ message: 'Operação realizada com sucesso' }`
   - `{ exists: false }`

2. **URLs/configurações externas:**
   - `{ invoiceUrl: string }`
   - Configurações de integração (Asaas, etc.)

3. **Dados de analytics/dashboard (agregações):**
   - Métricas calculadas
   - Gráficos e estatísticas

**Observação:** Se um objeto customizado tiver mais de 5 campos ou for usado em múltiplos lugares, deve ser convertido para DTO.

---

## 7. Testes

### Testes de Regressão

Após cada fase:

1. Executar testes automatizados existentes
2. Verificar se as respostas da API mantêm compatibilidade
3. Validar que nenhum campo sensível está sendo exposto

### Validação Manual

- Testar endpoints principais de cada domínio
- Verificar se relações são serializadas corretamente
- Confirmar que datas estão no formato correto

---

## 8. Documentação

Durante a migração, manter registro:

1. Quais DTOs foram criados
2. Quais campos são expostos em cada DTO
3. Quaisquer decisões específicas de design

---

## 9. Critérios de Sucesso

- [ ] 100% dos controllers JSON usando DTOs
- [ ] Zero modelos Lucid sendo retornados diretamente
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Code review aprovado

---

## 10. Riscos e Mitigações

| Risco                                  | Impacto | Mitigação                                             |
| -------------------------------------- | ------- | ----------------------------------------------------- |
| Quebra de compatibilidade com frontend | Alto    | Coordenar com time frontend, manter campos essenciais |
| Campos sensíveis expostos              | Alto    | Code review rigoroso, testes de segurança             |
| Tempo maior que estimado               | Médio   | Dividir em sprints, priorizar domínios críticos       |
| DTOs duplicados                        | Médio   | Criar DTOs reutilizáveis, seguir convenções           |

---

## 11. Próximos Passos

1. ✅ Design aprovado
2. 🔄 Criar plano de implementação detalhado (skill writing-plans)
3. ⏳ Iniciar Fase 1: Canteen + Events
4. ⏳ Revisão de código entre fases
5. ⏳ Documentação contínua

---

**Aprovado por:** @dudousxd  
**Data de aprovação:** 2025-02-25  
**Previsão de conclusão:** 12 semanas
