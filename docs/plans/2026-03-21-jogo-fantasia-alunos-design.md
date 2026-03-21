# Design: Jogo de Fantasia para Alunos < 14 anos - "Reino Mágico"

**Data**: 2026-03-21  
**Status**: Aprovado  
**Relacionado**: `2026-02-25-gamification-system-design.md` (sistema de pontos escolar)

---

## Resumo Executivo

Um jogo idle/RPG com temática de fantasia para alunos menores de 14 anos, inspirado em The Crims mas com mecânicas apropriadas para o público infantil. O jogo é um mundo à parte do sistema escolar, conectado apenas através da conversão de pontos de gamificação escolar para gold do jogo.

---

## Contexto

### Público-Alvo

- Alunos de até 14 anos
- Necessitam de interface engajante e gamificada
- Experiência separada do sistema acadêmico

### Inspiração

- **The Crims**: Timers de missões, progressão de stats, mundo navegável
- **Idle Games**: Progresso passivo, cliques para boost, upgrades
- **8bitcn/ui**: Visual 8-bit retrô com componentes React prontos

### Infraestrutura Existente

- Sistema de gamificação escolar já implementado (pontos, conquistas, rankings)
- Idle game básico em `/aluno/idle` (será substituído)
- RPG canvas com PixiJS em `/aluno` (será substituído)
- Loja de pontos em `/aluno/loja/pontos`

---

## Visão do Produto

**"Reino Mágico"** - Um mundo de fantasia onde o aluno:

1. Cria um personagem com classe única
2. Explora locais mágicos (floresta, montanhas, dungeon)
3. Completa missões com timers que rodam em background
4. Evolui através de níveis, habilidades e equipamentos
5. Interage com outros alunos via rankings e perfis

---

## Arquitetura

### Padrão: SPA com Sync Server

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Inertia)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Zustand   │  │ 8bitcn/ui   │  │   Game Logic        │  │
│  │  (Estado)   │  │ (Componentes)│  │ (Missões, Batalha)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Sync periódico + ações críticas
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (AdonisJS/Lucid)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Game API   │  │  Postgres   │  │   Jobs (Timers)     │  │
│  │ (Rotas)     │  │  (Dados)    │  │   (Missões)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Decisões Arquiteturais

| Decisão                         | Justificativa                                               |
| ------------------------------- | ----------------------------------------------------------- |
| Substituir PixiJS por 8bitcn/ui | Mais simples, melhor performance mobile, visual consistente |
| Zustand no frontend             | Estado complexo de jogo, persistência local                 |
| Sync com servidor               | Validar timers server-side, prevenir cheats                 |
| Menu de locais simples          | Mais fácil de navegar que mapa visual, mobile-friendly      |

---

## Schema do Banco de Dados

### Novas Tabelas

#### 1. game_characters (Personagens)

```sql
CREATE TABLE game_characters (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  name VARCHAR(50) NOT NULL,
  class VARCHAR(20) NOT NULL, -- 'mage', 'warrior', 'rogue', 'paladin'
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,

  -- Stats base
  attack INTEGER DEFAULT 10,
  defense INTEGER DEFAULT 10,
  max_hp INTEGER DEFAULT 100,
  max_mana INTEGER DEFAULT 50,

  -- Energia
  energy INTEGER DEFAULT 100,
  max_energy INTEGER DEFAULT 100,
  energy_regen_at TIMESTAMP,

  -- Idle game
  idle_gold_per_second DECIMAL(10,2) DEFAULT 0,
  click_damage INTEGER DEFAULT 1,
  dps DECIMAL(10,2) DEFAULT 0,
  ally_count INTEGER DEFAULT 0,
  current_wave INTEGER DEFAULT 1,

  -- Habilidades desbloqueadas
  unlocked_skills JSONB DEFAULT '[]',

  -- Equipamentos
  equipped_weapon_id UUID,
  equipped_armor_id UUID,
  equipped_accessory_id UUID,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(student_id)
);

CREATE INDEX idx_game_characters_student ON game_characters(student_id);
CREATE INDEX idx_game_characters_level ON game_characters(level);
```

#### 2. game_missions (Missões Disponíveis)

```sql
CREATE TABLE game_missions (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(50) NOT NULL, -- 'forest', 'mountains', 'dungeon', 'arena'
  difficulty VARCHAR(20) DEFAULT 'normal', -- 'easy', 'normal', 'hard', 'epic'

  -- Requisitos
  required_level INTEGER DEFAULT 1,
  required_class VARCHAR(50)[] DEFAULT '{}',

  -- Timer
  duration_minutes INTEGER NOT NULL, -- 30, 60, 120, 360, 720

  -- Custo
  energy_cost INTEGER NOT NULL,

  -- Recompensas
  gold_reward_min INTEGER DEFAULT 0,
  gold_reward_max INTEGER DEFAULT 0,
  experience_reward INTEGER DEFAULT 0,
  item_drop_chance JSONB DEFAULT '{}', -- {"item_id": 0.1, ...}

  -- Condições
  is_active BOOLEAN DEFAULT TRUE,
  available_from TIME,
  available_until TIME,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_missions_location ON game_missions(location);
CREATE INDEX idx_game_missions_difficulty ON game_missions(difficulty);
```

#### 3. game_character_missions (Missões em Andamento)

```sql
CREATE TABLE game_character_missions (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES game_characters(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES game_missions(id),

  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'claimed'
  started_at TIMESTAMP NOT NULL,
  completes_at TIMESTAMP NOT NULL,

  -- Resultado (preenchido ao completar)
  gold_earned INTEGER,
  experience_earned INTEGER,
  items_earned JSONB,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(character_id, mission_id, started_at)
);

CREATE INDEX idx_game_character_missions_character ON game_character_missions(character_id);
CREATE INDEX idx_game_character_missions_status ON game_character_missions(status);
CREATE INDEX idx_game_character_missions_completes ON game_character_missions(completes_at);
```

#### 4. game_items (Itens do Jogo)

```sql
CREATE TABLE game_items (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- 'weapon', 'armor', 'accessory', 'consumable', 'material'
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'

  -- Stats
  attack_bonus INTEGER DEFAULT 0,
  defense_bonus INTEGER DEFAULT 0,
  hp_bonus INTEGER DEFAULT 0,
  mana_bonus INTEGER DEFAULT 0,
  special_effect JSONB,

  -- Visual
  icon VARCHAR(100),

  -- Preço na loja
  gold_price INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_items_type ON game_items(type);
CREATE INDEX idx_game_items_rarity ON game_items(rarity);
```

#### 5. game_character_items (Inventário)

```sql
CREATE TABLE game_character_items (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES game_characters(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES game_items(id),
  quantity INTEGER DEFAULT 1,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(character_id, item_id)
);

CREATE INDEX idx_game_character_items_character ON game_character_items(character_id);
```

#### 6. game_upgrades (Upgrades Idle)

```sql
CREATE TABLE game_upgrades (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'click_power', 'dps', 'ally', 'idle_gold'

  -- Escalação
  base_cost INTEGER NOT NULL,
  cost_multiplier DECIMAL(5,2) DEFAULT 1.35,

  -- Efeito
  effect_type VARCHAR(20) NOT NULL, -- 'add', 'multiply'
  effect_value DECIMAL(10,2) NOT NULL,

  -- Limite
  max_level INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. game_character_upgrades (Upgrades Comprados)

```sql
CREATE TABLE game_character_upgrades (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES game_characters(id) ON DELETE CASCADE,
  upgrade_id UUID NOT NULL REFERENCES game_upgrades(id),
  level INTEGER DEFAULT 1,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(character_id, upgrade_id)
);

CREATE INDEX idx_game_character_upgrades_character ON game_character_upgrades(character_id);
```

#### 8. game_skills (Habilidades por Classe)

```sql
CREATE TABLE game_skills (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  class VARCHAR(20) NOT NULL, -- 'mage', 'warrior', 'rogue', 'paladin', 'all'
  branch VARCHAR(50) NOT NULL, -- 'fire', 'ice', 'arcane', etc.

  -- Requisitos
  required_level INTEGER DEFAULT 1,
  required_skill_id UUID REFERENCES game_skills(id),

  -- Efeito
  effect_type VARCHAR(50) NOT NULL,
  effect_value DECIMAL(10,2),

  -- Visual
  icon VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_skills_class ON game_skills(class);
CREATE INDEX idx_game_skills_branch ON game_skills(branch);
```

#### 9. game_points_conversions (Conversão Pontos → Gold)

```sql
CREATE TABLE game_points_conversions (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  points_spent INTEGER NOT NULL,
  gold_received INTEGER NOT NULL,
  rate INTEGER NOT NULL, -- pontos por gold (ex: 10)

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_points_conversions_student ON game_points_conversions(student_id);
```

#### 10. game_idle_state (Estado do Idle - Snapshot)

```sql
CREATE TABLE game_idle_state (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES game_characters(id) ON DELETE CASCADE,

  -- Monster atual
  current_monster_wave INTEGER DEFAULT 1,
  current_monster_hp INTEGER,
  current_monster_max_hp INTEGER,

  -- Acúmulo offline
  offline_gold_earned DECIMAL(15,2) DEFAULT 0,
  last_sync_at TIMESTAMP NOT NULL,

  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(character_id)
);

CREATE INDEX idx_game_idle_state_character ON game_idle_state(character_id);
```

---

## Enums

```typescript
enum GameClass {
  MAGE = 'mage', // DPS alto, vida baixa
  WARRIOR = 'warrior', // Balanceado
  ROGUE = 'rogue', // Críticos, evasão
  PALADIN = 'paladin', // Tank, suporte
}

enum GameLocation {
  TAVERN = 'tavern', // Hub central
  ARENA = 'arena', // Batalhas idle
  FOREST = 'forest', // Missões de caça
  MOUNTAINS = 'mountains', // Missões de exploração
  DUNGEON = 'dungeon', // Missões de boss
  ACADEMY = 'academy', // Estudos/Melhorias
  MARKET = 'market', // Loja com gold
  POINTS_SHOP = 'points_shop', // Conversão pontos→gold
  RANKINGS = 'rankings', // Ver outros alunos
}

enum MissionDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EPIC = 'epic',
}

enum MissionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed',
}

enum ItemRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
}
```

---

## APIs e Endpoints

### Personagem

```typescript
// Criar personagem (apenas 1 por aluno)
POST /api/game/characters
Body: { name: string, class: GameClass }
Response: GameCharacter

// Obter personagem do aluno logado
GET /api/game/character
Response: GameCharacter (com stats, equipamentos, skills)

// Atualizar equipamentos
PUT /api/game/character/equipment
Body: { weapon_id?: string, armor_id?: string, accessory_id?: string }

// Desbloquear habilidade
POST /api/game/character/skills/:skillId
```

### Energia

```typescript
// Obter estado de energia
GET /api/game/character/energy
Response: { energy: number, max_energy: number, next_regen_in: number }
```

### Missões

```typescript
// Listar missões disponíveis
GET /api/game/missions
Query: { location?: GameLocation, difficulty?: MissionDifficulty }
Response: GameMission[]

// Iniciar missão
POST /api/game/character/missions
Body: { mission_id: string }
Response: GameCharacterMission

// Listar missões em andamento
GET /api/game/character/missions
Query: { status?: MissionStatus }
Response: GameCharacterMission[]

// Coletar recompensa (após timer)
POST /api/game/character/missions/:id/claim
Response: { gold: number, experience: number, items: GameItem[] }
```

### Idle Game (Arena)

```typescript
// Obter estado do idle
GET /api/game/character/idle
Response: { wave: number, monster_hp: number, monster_max_hp: number, ... }

// Sync do idle (chamado periodicamente)
POST /api/game/character/idle/sync
Body: { clicks: number, time_elapsed: number }
Response: { gold_earned: number, new_wave: number, ... }

// Comprar upgrade idle
POST /api/game/character/upgrades
Body: { upgrade_id: string }
Response: { success: boolean, new_level: number, cost: number }
```

### Inventário

```typescript
// Listar inventário
GET /api/game/character/items
Response: GameCharacterItem[]

// Usar consumível
POST /api/game/character/items/:id/use
```

### Loja

```typescript
// Listar itens da loja
GET /api/game/shop
Query: { type?: ItemType }
Response: GameItem[] (com gold_price)

// Comprar item
POST /api/game/shop/:itemId/buy
Body: { quantity: number }
```

### Conversão de Pontos

```typescript
// Obter taxa de conversão
GET /api/game/points-conversion/rate
Response: { rate: number, points_available: number }

// Converter pontos em gold
POST /api/game/points-conversion
Body: { points: number }
Response: { gold_received: number, points_spent: number }
```

### Rankings

```typescript
// Ranking por nível
GET /api/game/rankings/level
Query: { page?: number, limit?: number }
Response: { rank: number, character_name: string, class: GameClass, level: number, student_name: string }[]

// Ranking por gold
GET /api/game/rankings/gold

// Ranking por wave (idle)
GET /api/game/rankings/wave

// Perfil público de outro aluno
GET /api/game/characters/:id/public
Response: { name: string, class: GameClass, level: number, equipamentos: [...] }
```

---

## Componentes de UI

### Páginas Principais

| Rota                    | Página         | Descrição                                         |
| ----------------------- | -------------- | ------------------------------------------------- |
| `/aluno/jogo`           | Hub/Taverna    | Dashboard principal com stats e acesso aos locais |
| `/aluno/jogo/arena`     | Arena          | Idle game (click + auto-battle)                   |
| `/aluno/jogo/floresta`  | Floresta       | Missões de caça                                   |
| `/aluno/jogo/montanhas` | Montanhas      | Missões de exploração                             |
| `/aluno/jogo/dungeon`   | Dungeon        | Missões de boss                                   |
| `/aluno/jogo/academia`  | Academia       | Árvore de habilidades                             |
| `/aluno/jogo/mercado`   | Mercado        | Loja com gold                                     |
| `/aluno/jogo/pontos`    | Loja de Pontos | Conversão pontos→gold                             |
| `/aluno/jogo/rankings`  | Rankings       | Ver outros alunos                                 |

### Componentes 8bitcn/ui

| Componente               | Uso                        |
| ------------------------ | -------------------------- |
| **Health Bar**           | Vida do personagem         |
| **Mana Bar**             | Mana para habilidades      |
| **XP Bar**               | Barra de experiência       |
| **Enemy Health Display** | Vida de monstros/boss      |
| **Item**                 | Inventário e equipamentos  |
| **Progress**             | Timers de missão           |
| **Badge**                | Classes, níveis, raridades |
| **Card**                 | Missões disponíveis        |
| **Button**               | Ações estilizadas          |
| **Tabs**                 | Navegação entre seções     |
| **Avatar**               | Personagem do aluno        |

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] Reino Mágico           [Energia: 85/100] [Gold: 1234]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌───────────────────────────────────┐  │
│  │   Sidebar   │  │          Main Content             │  │
│  │             │  │                                   │  │
│  │  🏠 Taverna │  │   [Conteúdo da página atual]      │  │
│  │  ⚔️ Arena   │  │                                   │  │
│  │  🌲 Floresta│  │                                   │  │
│  │  🏔️ Montanh│  │                                   │  │
│  │  🏰 Dungeon │  │                                   │  │
│  │  📚 Academia│  │                                   │  │
│  │  🏪 Mercado │  │                                   │  │
│  │  💎 Pontos  │  │                                   │  │
│  │  🏆 Rankings│  │                                   │  │
│  │             │  │                                   │  │
│  └─────────────┘  └───────────────────────────────────┘  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [XP Bar] ████████░░░░ Level 5 - 450/1000 XP            │
└──────────────────────────────────────────────────────────┘
```

---

## Regras de Negócio

### Sistema de Energia

```typescript
// Regeneração
const ENERGY_REGEN_RATE = 1 // 1 energia a cada 5 minutos
const ENERGY_REGEN_INTERVAL_MS = 5 * 60 * 1000

// Custo por tipo de missão
const MISSION_ENERGY_COST = {
  easy: 10, // 30 min
  normal: 20, // 1-2h
  hard: 40, // 3-6h
  epic: 60, // 6-12h
}

// Limite máximo
const BASE_MAX_ENERGY = 100
// +10 por nível de personagem
```

### Sistema de Níveis

```typescript
// XP por nível (exponencial)
const XP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1))

// Pontos de habilidade por nível
const SKILL_POINTS_PER_LEVEL = 1

// Bonus de stats por nível
const STATS_PER_LEVEL = {
  attack: 2,
  defense: 2,
  max_hp: 10,
  max_mana: 5,
}
```

### Sistema de Classes

| Classe        | Stats Base             | Bônus por Nível           | Especialidade              |
| ------------- | ---------------------- | ------------------------- | -------------------------- |
| **Mago**      | ATK 15, DEF 5, HP 80   | +3 ATK, +1 DEF, +5 HP     | DPS alto, críticos mágicos |
| **Guerreiro** | ATK 10, DEF 10, HP 100 | +2 ATK, +2 DEF, +10 HP    | Balanceado                 |
| **Ladino**    | ATK 12, DEF 7, HP 90   | +2.5 ATK, +1.5 DEF, +7 HP | Evasão, críticos           |
| **Paladino**  | ATK 8, DEF 15, HP 120  | +1 ATK, +3 DEF, +15 HP    | Tank, cura                 |

### Árvores de Habilidades

**Mago:**

- Fogo: DPS, DoT, área
- Gelo: Slow, controle, defesa
- Arcano: Utility, mana, buffs

**Guerreiro:**

- Força: DPS, críticos
- Defesa: Block, mitigação
- Fúria: Berserk, lifesteal

**Ladino:**

- Sombras: Stealth, evasão
- Veneno: DoT, debuffs
- Crítico: DPS, backstab

**Paladino:**

- Luz: Cura, buffs
- Escudo: Block, taunt
- Justiça: DPS holy, dano a undead

### Conversão Pontos → Gold

```typescript
const POINTS_TO_GOLD_RATE = 10 // 1 ponto = 10 gold

// Taxa configurável por escola
async function getConversionRate(schoolId: string): Promise<number> {
  const settings = await SchoolGameSettings.query().where('school_id', schoolId).first()
  return settings?.points_to_gold_rate ?? POINTS_TO_GOLD_RATE
}
```

### Idle Game (Arena)

```typescript
// Fórmula de progressão
const MONSTER_HP_BASE = 10
const MONSTER_HP_SCALE = 3 // +3 HP por wave
const GOLD_PER_MONSTER_BASE = 6
const GOLD_PER_MONSTER_SCALE = 2

// Limite de acumulação offline
const MAX_OFFLINE_HOURS = 8

// DPS base por classe
const BASE_DPS = {
  mage: 1.0,
  warrior: 0.8,
  rogue: 0.9,
  paladin: 0.6,
}
```

---

## Jobs e Processamento

### 1. ProcessMissionCompletionJob

```typescript
// Executa quando timer de missão expira
// Marca missão como completed
// Agenda notificação para o aluno
```

### 2. RegenerateEnergyJob

```typescript
// Executa a cada 5 minutos
// Atualiza energia de todos os personagens
// Respeita limite máximo
```

### 3. SyncIdleStateJob

```typescript
// Executa quando aluno entra no jogo
// Calcula gold acumulado offline
// Atualiza wave atual
```

---

## Fluxos de Usuário

### 1. Primeiro Acesso (Onboarding)

```
Aluno acessa /aluno/jogo
     │
     ▼
Sistema verifica se já tem personagem
     │
     ├── Não → Tela de criação de personagem
     │           ├── Escolher nome
     │           ├── Escolher classe (com descrição)
     │           └── Confirmar
     │
     └── Sim → Redireciona para Taverna (hub)
```

### 2. Iniciar Missão

```
Aluno acessa local (ex: Floresta)
     │
     ▼
Lista de missões disponíveis
     │
     ▼
Aluno seleciona missão
     │
     ▼
Sistema verifica:
     ├── Energia suficiente? → Não → Mensagem
     ├── Nível suficiente? → Não → Mensagem
     └── Classe permitida? → Não → Mensagem
     │
     ▼ (tudo OK)
Criar GameCharacterMission
     ├── status = 'in_progress'
     ├── started_at = now()
     └── completes_at = now() + duration_minutes
     │
     ▼
Deduzir energia
     │
     ▼
Agendar ProcessMissionCompletionJob
     │
     ▼
Aluno pode sair ou fazer outras coisas
```

### 3. Coletar Recompensa

```
Aluno retorna ao jogo
     │
     ▼
Sistema mostra missões completadas
     │
     ▼
Aluno clica "Coletar"
     │
     ▼
Sistema calcula recompensas:
     ├── Gold (min-max aleatório)
     ├── XP
     └── Itens (rolagem por chance)
     │
     ▼
Atualizar personagem:
     ├── Adicionar gold
     ├── Adicionar XP (subir de nível?)
     └── Adicionar itens ao inventário
     │
     ▼
Marcar missão como 'claimed'
```

---

## Considerações de Performance

### Otimizações

- **LocalStorage**: Estado do idle salvo localmente, sync periódico
- **Lazy loading**: Locais carregados sob demanda
- **Debounce**: Cliques no idle não spamam servidor
- **Cache**: Rankings cacheados por 5 minutos

### Limites

- **Max missões simultâneas**: 3
- **Max itens no inventário**: 100
- **Max gold acumulado offline**: 8 horas de idle

---

## Segurança

### Validações

- Timers validados server-side (não aceitar claim antes do tempo)
- Energia validada server-side
- Conversão de pontos validada contra saldo real
- Itens equipados devem estar no inventário

### Proteções

- Rate limiting em endpoints de missão
- Anti-cheat: timestamps validados
- Log de conversões de pontos

---

## Fases de Implementação

### Fase 1: Fundação

- Instalar 8bitcn/ui
- Criar tabelas do banco
- Criar models e migrations
- Sistema de personagem (criação, stats)

### Fase 2: Core Loop

- Sistema de energia
- Missões com timers
- Coleta de recompensas
- Navegação entre locais

### Fase 3: Idle Game

- Arena com batalha idle
- Sistema de upgrades
- Acumulação offline

### Fase 4: Progressão

- Sistema de níveis
- Árvores de habilidades
- Inventário e equipamentos

### Fase 5: Economia

- Loja com gold
- Conversão pontos → gold
- Rankings

### Fase 6: Polish

- Visual 8-bit completo
- Animações
- Feedback visual
- Testes
