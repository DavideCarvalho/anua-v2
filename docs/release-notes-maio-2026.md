# Novidades Anuá — Maio 2026

Olá! Seguem as melhorias que fizemos no sistema este mês. Nosso foco foi em facilitar o dia a dia dos responsáveis e dar mais visibilidade pra escola sobre o que acontece na plataforma.

---

## Para os responsáveis

### Pagamento mais claro

Agora, mesmo que a escola ainda não tenha pagamento online configurado, você verá um botão **"Como pagar"** com as instruções de pagamento (chave PIX ou contato da secretaria). Antes, o botão simplesmente não aparecia.

### PIX direto no app

Quando a escola tem PIX habilitado, o pagamento agora mostra o **QR Code na própria tela**, sem precisar abrir outro site. É só escanear com o app do banco.

### Calendário no Google/Apple Calendar

Na página de Calendário, agora tem o botão **"Sincronizar"**. Provas, atividades e eventos do seu filho aparecem direto no Google Calendar ou Apple Calendar, atualizando automaticamente.

### Acompanhamento da matrícula com prazos

A tela de matrícula agora mostra **quando esperar resposta** pra cada etapa: "análise de documentos em até 2 dias úteis", "escola entra em contato em até 3 dias úteis". Também mostra quando cada etapa foi atualizada.

### Comprovante de matrícula digital

Quando a matrícula está concluída, agora dá pra gerar um **comprovante com QR Code** verificável. A secretaria da escola pode escanear e confirmar a autenticidade na hora.

### Comunicados mais legíveis

O texto dos comunicados agora respeita as quebras de linha e tem largura limitada pra facilitar a leitura, especialmente no celular.

### Pagamentos no celular

A tabela de pagamentos agora **funciona bem no celular** — em vez de uma tabela apertada, mostra cards empilhados com as informações principais.

### Boas-vindas no primeiro acesso

Responsáveis que acessam o sistema pela primeira vez agora veem um **guia rápido** explicando por onde começar: documentos, pagamentos, acompanhamento e comunicados.

### Notificações push

Agora é possível receber **notificações no celular** mesmo sem estar com o sistema aberto. Pagamento vencendo, comunicado novo, tudo chega direto.

---

## Para a escola

### Tela de saúde das escolas (admin)

Nova tela em **Analytics > Health das Escolas** mostra quais escolas estão ativas, quais estão em risco de churn, quantos logins nos últimos 30 dias, e quais funcionalidades cada escola usa. Com filtros por status e busca por nome.

### Templates de comunicado

Agora dá pra **salvar comunicados como template** e reutilizar na semana seguinte. Também tem **pré-visualização** que mostra exatamente como o responsável vai ver, na página real.

### Exportar lista de alunos

Botão **"Exportar CSV"** na lista de alunos. Gera o arquivo em background e notifica quando pronto. Respeita os filtros ativos (período, curso, turma, busca).

### Saldo visível no PDV da cantina

O operador da cantina agora vê o **saldo do aluno em destaque** antes de finalizar a venda, com cor indicando se cobre o total. Evita o retrabalho de descobrir saldo insuficiente só no final.

### Seleção rápida de audiência em comunicados

Botões **"Selecionar todos / Limpar"** nos seletores de curso, ano, turma e aluno. Menos cliques pra quem precisa mandar pra muita gente.

### Matrículas com ações reais

A página de matrículas agora leva direto pra **nova matrícula**, **períodos letivos** e **lista de alunos**, em vez de cards genéricos.

---

## Melhorias técnicas

- **Login mais limpo**: tela de login redesenhada, sem gradientes ou efeitos visuais pesados.
- **Pagamentos agnósticos de gateway**: a arquitetura de pagamento agora suporta trocar de gateway sem mexer no código da aplicação.
- **Rastreamento de atividade corrigido**: o sistema agora registra corretamente o último acesso de cada usuário.
- **Acessibilidade**: botões de ícone agora têm labels acessíveis pra leitores de tela.
- **Skeletons e empty states padronizados**: telas de carregamento e estados vazios agora seguem um padrão visual consistente.
