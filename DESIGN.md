---
name: Anua
description: Painel de controle escolar — rápido, claro, calmo. Sem cara de SaaS-genérico, sem cara de app infantil.
colors:
  background: 'oklch(1 0 0)'
  foreground: 'oklch(0.141 0.01 285)'
  card: 'oklch(1 0 0)'
  card-foreground: 'oklch(0.141 0.01 285)'
  popover: 'oklch(1 0 0)'
  popover-foreground: 'oklch(0.141 0.01 285)'
  primary: 'oklch(0.58 0.22 285)'
  primary-foreground: 'oklch(0.985 0 0)'
  secondary: 'oklch(0.97 0.01 285)'
  secondary-foreground: 'oklch(0.21 0.02 285)'
  muted: 'oklch(0.97 0.01 285)'
  muted-foreground: 'oklch(0.55 0.02 285)'
  accent: 'oklch(0.97 0.01 285)'
  accent-foreground: 'oklch(0.21 0.02 285)'
  destructive: 'oklch(0.58 0.22 25)'
  destructive-foreground: 'oklch(0.985 0 0)'
  border: 'oklch(0.92 0.01 285)'
  input: 'oklch(0.92 0.01 285)'
  ring: 'oklch(0.58 0.22 285)'
  sidebar: 'oklch(0.985 0 0)'
  sidebar-border: 'oklch(0.92 0.01 285)'
  chart-1: 'oklch(0.65 0.18 250)'
  chart-2: 'oklch(0.6 0.15 170)'
  chart-3: 'oklch(0.55 0.12 220)'
  chart-4: 'oklch(0.7 0.16 300)'
  chart-5: 'oklch(0.62 0.14 340)'
typography:
  display:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: '1.2'
    letterSpacing: '-0.01em'
  headline:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: '1.3'
    letterSpacing: 'normal'
  title:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: '1.4'
    letterSpacing: 'normal'
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: '1.5'
    letterSpacing: 'normal'
  label:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: '1.4'
    letterSpacing: '0.02em'
rounded:
  sm: 'calc(0.625rem - 4px)'
  md: 'calc(0.625rem - 2px)'
  lg: '0.625rem'
  xl: '0.75rem'
spacing:
  xs: '0.25rem'
  sm: '0.5rem'
  md: '0.75rem'
  lg: '1rem'
  xl: '1.5rem'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    typography: '{typography.title}'
    rounded: '{rounded.lg}'
    padding: '0 0.625rem'
    height: '2rem'
  button-primary-hover:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
  button-outline:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    padding: '0 0.625rem'
    height: '2rem'
  button-outline-hover:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.foreground}'
  button-ghost:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    padding: '0 0.625rem'
    height: '2rem'
  button-ghost-hover:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.foreground}'
  button-destructive:
    backgroundColor: '{colors.destructive}'
    textColor: '{colors.destructive-foreground}'
    rounded: '{rounded.lg}'
    padding: '0 0.625rem'
    height: '2rem'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.card-foreground}'
    rounded: '{rounded.xl}'
    padding: '1rem 0'
  input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    padding: '0.25rem 0.625rem'
    height: '2rem'
  input-focus:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
---

# Design System: Anua

## 1. Overview

**Creative North Star: "O Painel de Controle Escolar"**

A Anua é uma ferramenta operacional de uso diário em escolas brasileiras de educação básica. A interface vive em estações de trabalho da secretaria e da coordenação, sob luz ambiente comum, em turnos comerciais. O design precisa sumir no trabalho: cada clique a menos importa, listas e ações vêm primeiro, decoração depois. Estrutura antes de afeto.

A linguagem visual é restrained: neutros levemente tintados de violeta, um único accent (o **Violeta Anua**) reservado para ações primárias e indicações de estado. Tipografia carrega a hierarquia, ringings de 1px tomam o lugar de sombras. Densidade quando a tarefa pede densidade (tabelas de alunos, dashboards de inadimplência); respiro quando a tarefa pede leitura (comunicados, formulários longos). A inspiração mental é Linear/Cursor com vocabulário escolar brasileiro, não Material 3, não SaaS-cream.

O sistema rejeita explicitamente três armadilhas que vêm do PRODUCT.md: estética enterprise-corporativa (cinza puro, tabelas densas sem ar, menus infinitos), visual infantilizado (cores primárias gritantes, ilustrações cartoon, fontes display para tudo), e startup template genérico (gradiente roxo no hero, glassmorphism, hero-metric com big-number-and-three-small-stats). A escola já é séria; a interface não precisa fingir.

**Key Characteristics:**

- Restrained palette: neutros tintados + um só accent violeta, ≤10% da tela
- Flat by default, profundidade via `ring-1 ring-foreground/10`, nunca via sombra decorativa
- Inter como família única, scale tight (1.125–1.2 entre passos)
- Cantos de 8–12px (radius lg/xl), nunca pill, nunca quadrado
- Suporte nativo a light e dark; light é o caminho feliz (sala de coordenação iluminada)
- Modo gamified é um subescopo isolado (alunos ≤14), com seu próprio token namespace (`--color-gf-*`) e fontes display (Fredoka/Nunito). Não vaza para o app adulto.

## 2. Colors

Paleta de um só acorde: neutros frios levemente tintados na direção do violeta, e um único violeta saturado que carrega identidade.

### Primary

- **Violeta Anua** (`oklch(0.58 0.22 285)` ≈ `#7038bd`): a única cor saturada do sistema adulto. Usada em botões primários, fundo de item selecionado em listas (com opacidade reduzida via `/10`), focus ring, links, links acentuados e o badge de logo. Aparece em **≤10%** de cada tela. No dark mode sobe um pouco em luminosidade (`oklch(0.62 0.2 285)`) pra manter contraste em fundos escuros.

### Neutral

- **Branco Papel** (`oklch(1 0 0)`): background principal e card. Não é off-white; é branco puro porque a interface compete com luz ambiente de sala.
- **Tinta Quase-Preta** (`oklch(0.141 0.01 285)`): texto principal. Tem um traço de violeta (chroma 0.01) pra harmonizar com a primary. Nunca `#000`.
- **Cinza Cool Claro** (`oklch(0.97 0.01 285)`): fundos de muted, secondary e accent. Usado em hover de itens de lista, em backgrounds de empty state e em separadores soft. Mesmo violet-tint.
- **Cinza Médio** (`oklch(0.55 0.02 285)`): muted-foreground. Texto secundário, labels, timestamps relativos. Contraste AA contra branco e contra cinza cool claro.
- **Cinza Borda** (`oklch(0.92 0.01 285)`): border e input. Hairline em cards, separadores, contornos de input.

### Semantic

- **Vermelho Atenção** (`oklch(0.58 0.22 25)`): destructive. Tons de laranja-vermelho, não rosado. Usado em "Excluir" e em estados de erro. Nunca em decoração.
- **Verde Confirma** (sem token dedicado, usa `green-600/dark:green-400` localmente): success states em badges e ícones de etapa concluída do Task component. Não tem token global porque success é raro o suficiente para não merecer slot.

### Chart Palette (data viz)

- Sequência otimizada pra séries categóricas: azul (`oklch(0.65 0.18 250)`), teal (`oklch(0.6 0.15 170)`), azul-marinho (`oklch(0.55 0.12 220)`), rosa-magenta (`oklch(0.7 0.16 300)`), rose (`oklch(0.62 0.14 340)`). 5 valores; séries com mais de 5 categorias devem agregar "Outras" antes de virar arco-íris.

### Named Rules

**A Regra da Voz Única.** O Violeta Anua aparece em ≤10% de qualquer tela. Sua raridade é o ponto. Se você está pintando uma terceira coisa de violeta no mesmo viewport, errou. Use neutro, use peso da tipografia, use posição.

**A Regra do Tinte Vivo.** Nenhum neutro tem chroma zero. Todos têm 0.005–0.02 de chroma no hue 285 (violeta) ou 25 (vermelho). Branco puro só no background. Isso evita o cinza "Windows 7" e mantém a calma da paleta.

**A Regra do Modo Gamified Isolado.** As cores `--color-gf-*` (teal, caramel, coral, gold) só existem no escopo `.gamified` (alunos ≤14). Nunca usar essas cores fora desse subescopo. O app adulto não pode parecer um app de criança.

## 3. Typography

**Body & Display Font:** Inter (com `ui-sans-serif`, `system-ui`, `sans-serif` como fallbacks). Geist Variable também está carregada via `@fontsource-variable/geist` mas o `font-sans` default do Tailwind v4 (`@theme inline`) é Inter.

**Gamified Display Font:** Fredoka (com Nunito como body). Vivem apenas dentro de `.gamified`.

**Character:** Inter carrega o peso inteiro. Não há fonte serifada no sistema adulto. A diferenciação vem de peso (400/500/600) e tamanho. Escala tight (1.125–1.2 entre passos) porque a maior parte da UI é label/body/title, raramente display.

### Hierarchy

- **Display** (600, 1.5rem/24px, line-height 1.2, letter-spacing -0.01em): títulos de página, modal headers em telas grandes. Raro; só uma vez por tela.
- **Headline** (600, 1.125rem/18px, line-height 1.3): título de card, header de seção dentro de página.
- **Title** (600, 0.875rem/14px, line-height 1.4): título de item de lista, label proeminente, header de chat.
- **Body** (400, 0.875rem/14px, line-height 1.5): texto corrido, descrições, mensagens do assistente IA. Max line length 65–75ch quando for prosa contínua.
- **Label** (500, 0.75rem/12px, letter-spacing 0.02em): captions, timestamps relativos, hints sob inputs, badges. Letter-spacing leve pra compensar tamanho pequeno.

### Named Rules

**A Regra da Família Única.** Inter para tudo no app adulto. Não importar uma serifada "pra dar identidade", não pegar uma display pra título de página. A hierarquia vem do peso e do tamanho, não de troca de família.

**A Regra do Prose Estreito.** Texto corrido (descrições longas, comunicados, respostas do assistente IA) é capado em `max-w-3xl` (~768px) ou `prose-sm` com `max-w-none` quando inline. Linha longa em UI densa cansa o olho.

## 4. Elevation

Sistema flat por padrão. Profundidade vem de duas fontes apenas: **ring de 1px** (hairline) e **mudança de tom** entre `bg-background` e `bg-card` no dark mode. Sombras decorativas em hover, em cards normais, em qualquer surface estável: proibido.

A única sombra aceita é em surfaces _transientes_ de z-index alto: dropdown menus, dialogs, popovers, tooltips. Mesmo nessas, o que carrega o "destaque" é o ring + o fundo opaco, não a sombra grossa.

### Shadow Vocabulary

- **Card padrão**: `ring-1 ring-foreground/10` (10% opacidade do texto sobre o card). Substitui sombra completamente.
- **Surface elevada transitiva** (dialog, popover, tooltip): `shadow-sm` ou `shadow-md` do Tailwind, leve, mas o que destaca é o `bg-popover` opaco + `border border-border`.

### Named Rules

**A Regra do Flat-Por-Default.** Surfaces estáveis (cards, painéis, listas) são flat. Profundidade só aparece em resposta a estado (focus ring) ou em z-index transiente (dialog). Se você está adicionando `shadow-lg` num card de lista, está errado.

**A Regra do Ring no Lugar da Sombra.** Quando um elemento precisa "respirar" do fundo, use `ring-1 ring-foreground/10`. Hairline ring é mais discreto e legível em dark mode do que sombra; sombra em fundo escuro vira mancha cinza disforme.

## 5. Components

Componentes são funcionais e discretos. Padding generoso o suficiente pra evitar densidade hostil, hover sutil, sem micro-animação decorativa. Transição padrão: 150–250ms ease-out. Sem bounce, sem elastic. Components somem no trabalho.

### Buttons

- **Shape:** Cantos suaves de 10px (`rounded-lg`). Sem versões pill, sem cantos retos.
- **Default size:** altura 2rem (32px / `h-8`), padding horizontal 10px (`px-2.5`), texto 14px (`text-sm`), peso 500.
- **Primary** (`variant="default"`): fundo `bg-primary` (Violeta Anua), texto `text-primary-foreground` (off-white). Hover não muda fundo; só funciona em `<a>` filho do botão (legacy). É reservado pra **uma** ação por tela.
- **Outline:** fundo `bg-background` (branco), borda `border-border`, hover `bg-muted` (cinza cool claro). Default seguro.
- **Secondary:** fundo `bg-secondary` (cinza cool claro), texto `text-secondary-foreground`. Hover desce pra `/80`.
- **Ghost:** sem fundo, sem borda; hover `bg-muted`. Pra ações em toolbars e dentro de cards.
- **Destructive:** fundo `bg-destructive/10` (10% do vermelho), texto `text-destructive`. Hover sobe pra `/20`. Vermelho cheio só no botão de confirmação dentro de dialogs perigosos.
- **Link:** texto Violeta Anua sublinhado (underline-offset-4). Pra ações dentro de prosa.
- **Focus:** `border-ring` + `ring-3 ring-ring/50`. Sempre visível, nunca escondido.

### Cards

- **Shape:** Cantos de 12px (`rounded-xl`). Mais arredondado que botões pra criar hierarquia visual.
- **Background:** `bg-card` (branco). No dark, `oklch(0.21 0.02 285)` ligeiramente mais claro que o background.
- **Profundidade:** `ring-1 ring-foreground/10`. Sem `shadow-*`.
- **Internal padding:** 16px vertical (`py-4`), seções (header/content/footer) com padding horizontal 16px (`px-4`).
- **Nested cards:** proibido (regra geral). Se você precisa subdividir um card, use separadores (`border-t`) ou seções com spacing maior.

### Inputs (and Tiptap editor)

- **Style:** altura 2rem (`h-8`), padding 10px horizontal, fundo `bg-transparent` (herda do parent), borda `border-input`, radius `rounded-lg`.
- **Focus:** `border-ring` + `ring-3 ring-ring/50` (50% opacidade do violeta). Não há "glow"; só ring sólido.
- **Disabled:** `opacity-50`, `cursor-not-allowed`, `bg-input/50` (no dark `/80`).
- **Error:** `aria-invalid="true"` aplica `border-destructive` + `ring-destructive/20`. Letter-spacing e padding inalterados.
- **Tiptap editor (input de chat):** mesma família visual. Wrapper aplica `rounded-lg border border-input`, foco usa `focus-within:ring-2`. Editor interno é `prose prose-sm dark:prose-invert` pra suportar bold/italic/lista, mas placeholder e altura herdam do input.

### Lists & Sidebars

- **Thread list (chat):** `bg-muted/30`, borda direita `border-r border-border`. Itens com hover `bg-accent/60`, item selecionado `bg-primary/10` (10% do violeta) + texto em `text-foreground font-medium`. Action icon (excluir) aparece em `opacity-0 group-hover:opacity-100`.
- **Sidebar de navegação (EscolaLayout):** mesma família mas mais densa, com seções de nav agrupadas por categoria. Item ativo: `bg-primary/10` + texto em peso medium.

### Task / Steps (assistente IA)

- **Container:** `rounded-md border border-border bg-card/50` (não bg-card cheio; é meio transparente).
- **Header:** chevron + ícone de status (Loader spinner durante, Check verde quando done, AlertTriangle se erro) + label. Clicável pra expandir.
- **Item:** ícone 14px + label. Status `in_progress` mostra spinner, `completed` mostra Check verde 14px (stroke 3), `error` mostra AlertTriangle vermelho.
- **Connector vertical:** ausente. Os itens são uma lista plana, não uma timeline.

### Navigation (EscolaLayout)

- **Style:** sidebar fixa esquerda (240–260px), branca, com seções colapsáveis de categoria. Tipografia: title 14px medium pros itens, label 12px caps pros headers de seção.
- **Active state:** `bg-primary/10` + ícone tintado de Violeta Anua. Não é um "pill colorido", é uma camada sutil.

### Signature Component: AI Chat Pane

O pane principal de chat de IA é a peça mais elaborada do sistema. Dois colunas (lista de threads 260px + pane de chat). Header com ícone redondo `bg-primary/10` + título da thread + subtitle. Body em scroll com `max-w-3xl` central. Mensagens do usuário em bubble Violeta Anua, mensagens do assistente em texto puro (sem bubble) com markdown via Streamdown. Footer com Tiptap editor + botão de enviar/parar. Empty state com 4 chips de sugestão em grid 2×2, cada um com ícone tintado em `bg-primary/10`. O conjunto é a vitrine do sistema: mostra que componentes funcionais discretos não significam sem-personalidade.

## 6. Do's and Don'ts

### Do:

- **Do** usar Violeta Anua (`oklch(0.58 0.22 285)`) APENAS em: botão primary, item selecionado em lista (com `/10`), focus ring, links, ícone tintado de empty-state.
- **Do** usar `ring-1 ring-foreground/10` em cards e painéis. Substitui sombra.
- **Do** capar texto longo em `max-w-3xl` ou `prose-sm`. Linha longa cansa o olho da coordenadora que lê 200 comunicados por mês.
- **Do** usar Inter pra tudo no app adulto. Tipografia carrega a hierarquia.
- **Do** preferir lista plana ao invés de grid de cards quando os itens forem do mesmo tipo. Listas escalam melhor pra 200 alunos.
- **Do** usar transições de 150–250ms ease-out em hover, focus, expand/collapse.
- **Do** isolar o modo gamified dentro do escopo `.gamified`. Fora dele, só o sistema adulto.

### Don't:

- **Don't** usar estética enterprise-corporativa: cinza neutro puro (chroma 0), tabelas densas sem espaçamento, menus de navegação com 20+ itens em flat list. O PRODUCT.md proíbe isso por nome.
- **Don't** usar visual infantilizado: cores primárias gritantes fora do modo gamified, ilustrações cartoon, fontes display para títulos de página. O PRODUCT.md proíbe isso por nome.
- **Don't** usar "startup template genérico": gradient roxo em hero, glassmorphism em cards, hero-metric template (big-number + 3 small-stats + gradient accent). O PRODUCT.md proíbe isso por nome.
- **Don't** usar `border-left` ou `border-right` maior que 1px como stripe colorido em cards/alerts. Banido pelo skill law.
- **Don't** usar `bg-clip: text` com gradient (gradient text). Banido pelo skill law. Use peso ou tamanho pra ênfase.
- **Don't** usar `shadow-*` em cards estáveis. Use `ring-1 ring-foreground/10`. Sombra só em surfaces transientes (dialog, popover, tooltip).
- **Don't** usar modal como primeira escolha. Tente inline confirmation (estilo "Excluir / Cancelar" do thread list) antes.
- **Don't** importar fonte serifada "pra título" no app adulto. Inter aguenta.
- **Don't** usar dark theme como default. Light é o caminho feliz (uso comercial em ambiente bem iluminado); dark é suportado mas opt-in.
- **Don't** nestar cards. Se precisa subdividir, use `border-t` ou padding maior.
- **Don't** usar em dashes (`—`) em copy. Use vírgula, dois-pontos, ponto e vírgula, ponto, parênteses.
- **Don't** vazar cores `--color-gf-*` (teal, coral, gold) pra fora do escopo `.gamified`. App adulto = paleta adulta.
