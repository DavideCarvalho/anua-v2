import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerEscolaPageRoutes() {
  const escola = controllers.pages.escola

  router
    .group(() => {
      router.get('/', [escola.ShowEscolaDashboardPage]).as('dashboard')
      router.get('/periodos-letivos', [escola.ShowPeriodosLetivosPage]).as('periodosLetivos')
      router
        .get('/periodos-letivos/:slug', [escola.ShowPeriodoLetivoPage])
        .as('periodosLetivos.show')
      router
        .get('/administrativo/periodos-letivos/novo-periodo-letivo', [
          escola.ShowNovoPeriodoLetivoPage,
        ])
        .as('administrativo.novoPeriodoLetivo')
      router
        .get('/administrativo/periodos-letivos/:id/editar', [escola.ShowEditarPeriodoLetivoPage])
        .as('administrativo.periodosLetivos.editar')

      // Curso pages (within periodo letivo)
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/visao-geral', [
          escola.ShowCursoVisaoGeralPage,
        ])
        .as('periodosLetivos.cursos.visaoGeral')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas', [escola.ShowCursoTurmasPage])
        .as('periodosLetivos.cursos.turmas')

      // Turma pages (within curso)
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/atividades', [
          escola.ShowTurmaAtividadesPage,
        ])
        .as('periodosLetivos.cursos.turmas.atividades')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/provas', [
          escola.ShowTurmaProvasPage,
        ])
        .as('periodosLetivos.cursos.turmas.provas')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/presencas', [
          escola.ShowTurmaPresencasPage,
        ])
        .as('periodosLetivos.cursos.turmas.presencas')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/notas', [
          escola.ShowTurmaNotasPage,
        ])
        .as('periodosLetivos.cursos.turmas.notas')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/situacao', [
          escola.ShowTurmaSituacaoPage,
        ])
        .as('periodosLetivos.cursos.turmas.situacao')

      // Administrativo
      router.get('/administrativo/alunos', [escola.ShowAlunosPage]).as('administrativo.alunos')
      router
        .get('/administrativo/alunos/:id/editar', [escola.ShowEditarAlunoPage])
        .as('administrativo.alunos.editar')
      router
        .get('/administrativo/alunos/historico-financeiro', [escola.ShowHistoricoFinanceiroPage])
        .as('administrativo.alunos.historicoFinanceiro')
      router
        .get('/administrativo/funcionarios', [escola.ShowFuncionariosPage])
        .as('administrativo.funcionarios')
      router
        .get('/administrativo/professores', [escola.ShowProfessoresPage])
        .as('administrativo.professores')
      router
        .get('/administrativo/matriculas', [escola.ShowMatriculasPage])
        .as('administrativo.matriculas')
      router
        .get('/administrativo/matriculas/nova', [escola.ShowNovaMatriculaPage])
        .as('administrativo.matriculas.nova')
      router
        .get('/administrativo/contratos', [escola.ShowContratosPage])
        .as('administrativo.contratos')
      router
        .get('/administrativo/contratos/novo', [escola.ShowNovoContratoPage])
        .as('administrativo.contratos.novo')
      router
        .get('/administrativo/contratos/:id/editar', [escola.ShowEditarContratoPage])
        .as('administrativo.contratos.editar')
      router
        .get('/administrativo/contratos/:id/assinaturas', [escola.ShowContratoAssinaturasPage])
        .as('administrativo.contratos.assinaturas')
      router
        .get('/administrativo/contratos/:id/docuseal', [escola.ShowContratoDocusealPage])
        .as('administrativo.contratos.docuseal')
      router
        .get('/administrativo/contratos/:contractId/financeiro', [
          escola.ShowContratoFinanceiroPage,
        ])
        .as('administrativo.contratos.financeiro')
      router.get('/administrativo/bolsas', [escola.ShowBolsasPage]).as('administrativo.bolsas')
      router
        .get('/administrativo/parceiros', [escola.ShowParceirosPage])
        .as('administrativo.parceiros')
      router
        .get('/administrativo/materias', [escola.ShowMateriasPage])
        .as('administrativo.materias')
      router
        .get('/administrativo/folha-de-ponto', [escola.ShowFolhaDePontoPage])
        .as('administrativo.folhaDePonto')
      router
        .get('/administrativo/impressao', [escola.ShowImpressaoPage])
        .as('administrativo.impressao')
      router
        .get('/administrativo/solicitacoes-de-compra', [escola.ShowSolicitacoesDeCompraPage])
        .as('administrativo.solicitacoesDeCompra')

      // Notificacoes
      router.get('/notificacoes', [escola.ShowNotificacoesPage]).as('notificacoes')
      router
        .get('/notificacoes/preferencias', [escola.ShowNotificacoesPreferenciasPage])
        .as('notificacoes.preferencias')

      // Comunicados
      router.get('/comunicados', [escola.ShowComunicadosPage]).as('comunicados')
      router.get('/comunicados/novo', [escola.ShowNovoComunicadoPage]).as('comunicados.novo')
      router
        .get('/comunicados/:id/editar', [escola.ShowEditarComunicadoPage])
        .as('comunicados.editar')

      // Duvidas dos responsaveis
      router.get('/chat', [escola.ShowPerguntasPage]).as('chat')
      router.get('/chat/:inquiryId', [escola.ShowPerguntaDetailPage]).as('chat.show')

      // Eventos
      router.get('/calendario/novo', [escola.ShowNovoEventoPage]).as('eventos.novo')
      router.get('/calendario/:eventId/editar', [escola.ShowEditarEventoPage]).as('eventos.editar')
      router
        .get('/calendario/:eventId/autorizacoes', [escola.ShowEventoAutorizacoesPage])
        .as('eventos.autorizacoes')

      // Mural
      router.get('/mural', [escola.ShowMuralPage]).as('mural')

      // Desempenho Academico
      router.get('/desempenho', [escola.ShowDesempenhoPage]).as('desempenho')

      // Matriculas
      router.get('/matriculas', [escola.ShowMatriculasPage]).as('matriculas')

      // Pedagogico
      router.get('/pedagogico/turmas', [escola.ShowTurmasPage]).as('pedagogico.turmas')
      router.get('/pedagogico/grade', [escola.ShowGradePage]).as('pedagogico.grade')
      router.get('/pedagogico/horarios', [escola.ShowHorariosPage]).as('pedagogico.horarios')
      router.get('/pedagogico/quadro', [escola.ShowQuadroPage]).as('pedagogico.quadro')
      router
        .get('/pedagogico/registro-diario', [escola.ShowOcorrenciasPage])
        .as('pedagogico.ocorrencias')
      router
        .get('/pedagogico/atividades/:id', [escola.ShowAtividadePage])
        .as('pedagogico.atividades.show')
      router.get('/pedagogico/provas/:id', [escola.ShowProvaPage]).as('pedagogico.provas.show')
      router.get('/pedagogico/presenca', [escola.ShowPresencaPage]).as('pedagogico.presenca')
      router
        .get('/pedagogico/aulas-avulsas', [escola.ShowAulasAvulsasPage])
        .as('pedagogico.aulasAvulsas')
      router
        .get('/pedagogico/calendario', [escola.ShowPedagogicoCalendarioPage])
        .as('pedagogico.calendario')
      router
        .get('/pedagogico/cursos-niveis', [escola.ShowCursosNiveisPage])
        .as('pedagogico.cursosNiveis')

      // Cantina
      router.get('/cantina/itens', [escola.ShowCantinaItensPage]).as('cantina.itens')
      router.get('/cantina/cardapio', [escola.ShowCantinaCardapioPage]).as('cantina.cardapio')
      router.get('/cantina/pdv', [escola.ShowCantinaPdvPage]).as('cantina.pdv')
      router.get('/cantina/pedidos', [escola.ShowCantinaPedidosPage]).as('cantina.pedidos')
      router.get('/cantina/vendas', [escola.ShowCantinaVendasPage]).as('cantina.vendas')
      router.get('/cantina/reservas', [escola.ShowCantinaReservasPage]).as('cantina.reservas')
      router
        .get('/cantina/recorrencias', [escola.ShowCantinaRecorrenciasPage])
        .as('cantina.recorrencias')
      router
        .get('/cantina/transferencias', [escola.ShowCantinaTransferenciasPage])
        .as('cantina.transferencias')

      // Financeiro
      router
        .get('/financeiro/inadimplencia', [escola.ShowInadimplenciaPage])
        .as('financeiro.inadimplencia')
      router.get('/financeiro/seguros', [escola.ShowSegurosPage]).as('financeiro.seguros')
      router.get('/financeiro/faturas', [escola.ShowFaturasPage]).as('financeiro.faturas')
      router
        .get('/financeiro/configuracao-pagamentos', [escola.ShowConfiguracaoPagamentosPage])
        .as('financeiro.configuracaoPagamentos')

      // Lojas
      router.get('/lojas', [escola.ShowLojasPage]).as('lojas.index')
      router.get('/lojas/:id', [escola.ShowLojaDetailPage]).as('lojas.show')

      // Gamificacao
      router.get('/gamificacao', [escola.ShowGamificacaoPage]).as('gamificacao.index')
      router
        .get('/gamificacao/rankings', [escola.ShowGamificacaoRankingsPage])
        .as('gamificacao.rankings')
      router
        .get('/gamificacao/conquistas', [escola.ShowGamificacaoConquistasPage])
        .as('gamificacao.conquistas')
      router
        .get('/gamificacao/recompensas', [escola.ShowGamificacaoRecompensasPage])
        .as('gamificacao.recompensas')
      router
        .get('/gamificacao/desafios', [escola.ShowGamificacaoDesafiosPage])
        .as('gamificacao.desafios')

      // IA Assistente
      router.get('/ia', [escola.ShowIaPage]).as('ia.index')
      router
        .get('/ia/conversa/:threadId', [escola.ShowIaPage])
        .where('threadId', router.matchers.uuid())
        .as('ia.conversa')

      // Configuracoes
      router.get('/configuracoes', [escola.ShowConfiguracoesPage]).as('configuracoes')
    })
    .prefix('/escola')
    .use([
      middleware.auth(),
      middleware.impersonation(),
      middleware.requireSchool(),
      middleware.escolaTeacherScope(),
    ])
    .as('escola')
}
