# Design Doc: Aluno Kids Dashboard (<= 14 anos)

## Visão Geral

Criação de uma interface lúdica e simplificada para alunos com 14 anos ou menos, focada na gamificação e troca de pontos por produtos da escola/cantina. A interface será inspirada em lobbies de jogos mobile (Roblox, Brawl Stars), utilizando elementos visuais chamativos, botões grandes e animações de recompensa.

## Objetivos

- Proporcionar uma experiência de usuário (UX) adequada para crianças e pré-adolescentes.
- Facilitar a visualização do saldo de pontos e a descoberta de produtos.
- Tornar o processo de troca de pontos gratificante através de feedbacks visuais (confetes, animações).

## Arquitetura e Fluxo de Dados

### 1. Detecção de Idade (Backend)

No `ShowAlunoDashboardPageController`, adicionaremos uma lógica para calcular a idade do aluno:

- **Input:** `birthDate` do modelo `User`.
- **Lógica:** Comparar a data atual com `birthDate`.
- **Output:** Flag `isKids` enviada para a página Inertia.

### 2. Redirecionamento de View

- Se `isKids === true`, renderizar `aluno/kids_dashboard`.
- Caso contrário, manter o dashboard padrão (`aluno/dashboard`).

### 3. Estrutura da Página (Frontend)

- **Status Bar:** Topo da tela com avatar e saldo de pontos destacado.
- **Hub de Modos (Lobby):** Grade de cards gigantes para categorias (Cantina, Loja, Pedidos).
- **Vitrine Simplificada:** Lista de produtos com fotos grandes e botão de "Trocar Agora".
- **Feedback de Troca:** Animação de confetes ao confirmar a transação.

## Componentes Visuais

### Estilo Visual

- **Cores:** Vibrantes (Laranja, Azul, Verde Limão, Dourado).
- **Bordas:** Arredondadas (2xl ou 3xl) com contornos grossos (border-4).
- **Sombras:** Efeito de profundidade (shadow-xl ou custom drop-shadow).
- **Tipografia:** Fontes sans-serif robustas (Fredoka One ou Inter Bold).

### Componentes Principais

- `KidsStatusBar`: Exibe avatar e saldo de pontos.
- `KidsModeCard`: Card clicável para categorias com ícones 3D/lúdicos.
- `KidsProductGrid`: Vitrine de produtos adaptada para o estilo de jogo.
- `KidsConfettiOverlay`: Camada de animação para momentos de sucesso.

## Tecnologias

- **Inertia.js + React:** Renderização do frontend.
- **Tailwind CSS:** Estilização e animações básicas.
- **Lucide React:** Ícones (ou SVGs customizados).
- **Canvas Confetti:** Efeito de celebração.
- **AdonisJS:** Backend e lógica de negócios.

## Plano de Testes

- **Teste de Idade:** Verificar se alunos com exatamente 14 anos e 1 dia veem o dashboard adulto, e alunos com 14 anos veem o kids.
- **Teste de Fluxo:** Garantir que o clique nos cards de categoria leva à loja correta.
- **Teste de Responsividade:** Validar o layout em tablets e celulares (foco principal).
