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
    id: '2026-05-27',
    date: '27 de maio de 2026',
    title: 'Maio 2026',
    items: [
      { text: 'Pagamento via PIX com QR Code direto no app', audience: 'responsavel' },
      { text: 'Botão "Como pagar" quando pagamento online não está disponível', audience: 'responsavel' },
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
