export type ChangelogAudience = 'responsavel' | 'escola' | 'admin' | 'all'

export interface ChangelogItem {
  text: string
  audience: ChangelogAudience
}

export interface ChangelogEntry {
  id: string
  date: string
  title: string
  items: ChangelogItem[]
}

export const changelog: ChangelogEntry[] = [
  {
    id: '2026-05-28',
    date: '28 de maio de 2026',
    title: 'Acordos de Inadimplência',
    items: [
      {
        text: 'Acordos de inadimplência automáticos — o sistema identifica famílias com faturas em atraso e gera propostas de parcelamento pra você aprovar',
        audience: 'escola',
      },
      {
        text: 'Novo fluxo de cobrança: aprove a proposta, o responsável recebe pelo app e aceita ou recusa, e as parcelas são geradas sozinhas',
        audience: 'escola',
      },
      {
        text: 'Crie propostas manualmente selecionando faturas na tela de inadimplência',
        audience: 'escola',
      },
      {
        text: 'Acompanhe tudo na aba "Propostas de acordo" dentro de Inadimplência, com auditoria de quem aprovou e quando',
        audience: 'escola',
      },
    ],
  },
  {
    id: '2026-05-27',
    date: '27 de maio de 2026',
    title: 'Maio 2026',
    items: [
      { text: 'Pagamento via PIX com QR Code direto no app', audience: 'responsavel' },
      {
        text: 'Botão "Como pagar" quando pagamento online não está disponível',
        audience: 'responsavel',
      },
      { text: 'Sincronização de calendário com Google/Apple Calendar', audience: 'responsavel' },
      { text: 'Comprovante de matrícula digital com QR verificável', audience: 'responsavel' },
      { text: 'Acompanhamento da matrícula com prazos e SLA', audience: 'responsavel' },
      { text: 'Pagamentos responsivos no celular', audience: 'responsavel' },
      { text: 'Onboarding pra novos responsáveis', audience: 'responsavel' },
      { text: 'Comunicados mais legíveis', audience: 'responsavel' },
      { text: 'Notificações push no celular', audience: 'all' },
      { text: 'Templates de comunicado reutilizáveis', audience: 'escola' },
      { text: 'Pré-visualização de comunicado como o responsável vê', audience: 'escola' },
      { text: 'Exportação de alunos em CSV', audience: 'escola' },
      { text: 'Saldo do aluno visível no PDV da cantina', audience: 'escola' },
      { text: 'Seleção rápida de audiência em comunicados', audience: 'escola' },
      { text: 'Matrículas com ações reais', audience: 'escola' },
      { text: 'Dashboard de saúde das escolas', audience: 'admin' },
      { text: 'Login redesenhado', audience: 'all' },
    ],
  },
]

export function filterChangelog(
  entries: ChangelogEntry[],
  audience: ChangelogAudience
): ChangelogEntry[] {
  return entries
    .map((entry) => ({
      ...entry,
      items: entry.items.filter((i) => i.audience === audience || i.audience === 'all'),
    }))
    .filter((entry) => entry.items.length > 0)
}
