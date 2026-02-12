import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Escola Pages
const ShowEscolaDashboardPageController = () =>
  import('#controllers/pages/escola/show_escola_dashboard_page_controller')
const ShowAlunosPageController = () =>
  import('#controllers/pages/escola/show_alunos_page_controller')
const ShowProfessoresPageController = () =>
  import('#controllers/pages/escola/show_professores_page_controller')
const ShowTurmasPageController = () =>
  import('#controllers/pages/escola/show_turmas_page_controller')
const ShowCursosNiveisPageController = () =>
  import('#controllers/pages/escola/show_cursos_niveis_page_controller')
const ShowCantinaItensPageController = () =>
  import('#controllers/pages/escola/show_cantina_itens_page_controller')
const ShowCantinaPedidosPageController = () =>
  import('#controllers/pages/escola/show_cantina_pedidos_page_controller')
const ShowFaturasPageController = () =>
  import('#controllers/pages/escola/show_faturas_page_controller')
const ShowLojasPageController = () => import('#controllers/pages/escola/show_lojas_page_controller')
const ShowLojaDetailPageController = () =>
  import('#controllers/pages/escola/show_loja_detail_page_controller')
const ShowFuncionariosPageController = () =>
  import('#controllers/pages/escola/show_funcionarios_page_controller')
const ShowMatriculasPageController = () =>
  import('#controllers/pages/escola/show_matriculas_page_controller')
const ShowNovaMatriculaPageController = () =>
  import('#controllers/pages/escola/show_nova_matricula_page_controller')
const ShowEditarAlunoPageController = () =>
  import('#controllers/pages/escola/show_editar_aluno_page_controller')
const ShowHistoricoFinanceiroPageController = () =>
  import('#controllers/pages/escola/show_historico_financeiro_page_controller')
const ShowContratosPageController = () =>
  import('#controllers/pages/escola/show_contratos_page_controller')
const ShowNovoContratoPageController = () =>
  import('#controllers/pages/escola/show_novo_contrato_page_controller')
const ShowEditarContratoPageController = () =>
  import('#controllers/pages/escola/show_editar_contrato_page_controller')
const ShowContratoAssinaturasPageController = () =>
  import('#controllers/pages/escola/show_contrato_assinaturas_page_controller')
const ShowContratoDocusealPageController = () =>
  import('#controllers/pages/escola/show_contrato_docuseal_page_controller')
const ShowContratoFinanceiroPageController = () =>
  import('#controllers/pages/escola/show_contrato_financeiro_page_controller')
const ShowBolsasPageController = () =>
  import('#controllers/pages/escola/show_bolsas_page_controller')
const ShowSegurosPageController = () =>
  import('#controllers/pages/escola/show_seguros_page_controller')
const ShowParceirosPageController = () =>
  import('#controllers/pages/escola/show_parceiros_page_controller')
const ShowMateriasPageController = () =>
  import('#controllers/pages/escola/show_materias_page_controller')
const ShowFolhaDePontoPageController = () =>
  import('#controllers/pages/escola/show_folha_de_ponto_page_controller')
const ShowImpressaoPageController = () =>
  import('#controllers/pages/escola/show_impressao_page_controller')
const ShowSolicitacoesDeCompraPageController = () =>
  import('#controllers/pages/escola/show_solicitacoes_de_compra_page_controller')
const ShowNotificacoesPageController = () =>
  import('#controllers/pages/escola/show_notificacoes_page_controller')
const ShowNotificacoesPreferenciasPageController = () =>
  import('#controllers/pages/escola/show_notificacoes_preferencias_page_controller')
const ShowEventosPageController = () =>
  import('#controllers/pages/escola/show_eventos_page_controller')
const ShowNovoEventoPageController = () =>
  import('#controllers/pages/escola/show_novo_evento_page_controller')
const ShowEditarEventoPageController = () =>
  import('#controllers/pages/escola/show_editar_evento_page_controller')
const ShowEventoAutorizacoesPageController = () =>
  import('#controllers/pages/escola/show_evento_autorizacoes_page_controller')
const ShowMuralPageController = () => import('#controllers/pages/escola/show_mural_page_controller')
const ShowDesempenhoPageController = () =>
  import('#controllers/pages/escola/show_desempenho_page_controller')
const ShowPeriodosLetivosPageController = () =>
  import('#controllers/pages/escola/show_periodos_letivos_page_controller')
const ShowNovoPeriodoLetivoPageController = () =>
  import('#controllers/pages/escola/show_novo_periodo_letivo_page_controller')
const ShowPeriodoLetivoPageController = () =>
  import('#controllers/pages/escola/show_periodo_letivo_page_controller')
const ShowEditarPeriodoLetivoPageController = () =>
  import('#controllers/pages/escola/show_editar_periodo_letivo_page_controller')
const ShowCursoVisaoGeralPageController = () =>
  import('#controllers/pages/escola/show_curso_visao_geral_page_controller')
const ShowCursoTurmasPageController = () =>
  import('#controllers/pages/escola/show_curso_turmas_page_controller')
const ShowTurmaAtividadesPageController = () =>
  import('#controllers/pages/escola/show_turma_atividades_page_controller')
const ShowTurmaProvasPageController = () =>
  import('#controllers/pages/escola/show_turma_provas_page_controller')
const ShowTurmaPresencasPageController = () =>
  import('#controllers/pages/escola/show_turma_presencas_page_controller')
const ShowTurmaNotasPageController = () =>
  import('#controllers/pages/escola/show_turma_notas_page_controller')
const ShowTurmaSituacaoPageController = () =>
  import('#controllers/pages/escola/show_turma_situacao_page_controller')
const ShowGradePageController = () => import('#controllers/pages/escola/show_grade_page_controller')
const ShowHorariosPageController = () =>
  import('#controllers/pages/escola/show_horarios_page_controller')
const ShowQuadroPageController = () =>
  import('#controllers/pages/escola/show_quadro_page_controller')
const ShowOcorrenciasPageController = () =>
  import('#controllers/pages/escola/show_ocorrencias_page_controller')
const ShowAtividadesPageController = () =>
  import('#controllers/pages/escola/show_atividades_page_controller')
const ShowAtividadePageController = () =>
  import('#controllers/pages/escola/show_atividade_page_controller')
const ShowEditAtividadePageController = () =>
  import('#controllers/pages/escola/show_edit_atividade_page_controller')
const ShowProvasPageController = () =>
  import('#controllers/pages/escola/show_provas_page_controller')
const ShowProvaPageController = () => import('#controllers/pages/escola/show_prova_page_controller')
const ShowEditProvaPageController = () =>
  import('#controllers/pages/escola/show_edit_prova_page_controller')
const ShowPresencaPageController = () =>
  import('#controllers/pages/escola/show_presenca_page_controller')
const ShowAulasAvulsasPageController = () =>
  import('#controllers/pages/escola/show_aulas_avulsas_page_controller')
const ShowCantinaCardapioPageController = () =>
  import('#controllers/pages/escola/show_cantina_cardapio_page_controller')
const ShowCantinaPdvPageController = () =>
  import('#controllers/pages/escola/show_cantina_pdv_page_controller')
const ShowCantinaVendasPageController = () =>
  import('#controllers/pages/escola/show_cantina_vendas_page_controller')
const ShowCantinaReservasPageController = () =>
  import('#controllers/pages/escola/show_cantina_reservas_page_controller')
const ShowCantinaTransferenciasPageController = () =>
  import('#controllers/pages/escola/show_cantina_transferencias_page_controller')
const ShowInadimplenciaPageController = () =>
  import('#controllers/pages/escola/show_inadimplencia_page_controller')
const ShowGamificacaoPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_page_controller')
const ShowGamificacaoRankingsPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_rankings_page_controller')
const ShowGamificacaoConquistasPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_conquistas_page_controller')
const ShowGamificacaoRecompensasPageController = () =>
  import('#controllers/pages/escola/show_gamificacao_recompensas_page_controller')
const ShowConfiguracoesPageController = () =>
  import('#controllers/pages/escola/show_configuracoes_page_controller')

export function registerEscolaPageRoutes() {
  router
    .group(() => {
      router.get('/', [ShowEscolaDashboardPageController]).as('dashboard')
      router.get('/periodos-letivos', [ShowPeriodosLetivosPageController]).as('periodosLetivos')
      router
        .get('/periodos-letivos/:slug', [ShowPeriodoLetivoPageController])
        .as('periodosLetivos.show')
      router
        .get('/administrativo/periodos-letivos/novo-periodo-letivo', [
          ShowNovoPeriodoLetivoPageController,
        ])
        .as('administrativo.novoPeriodoLetivo')
      router
        .get('/administrativo/periodos-letivos/:id/editar', [ShowEditarPeriodoLetivoPageController])
        .as('administrativo.periodosLetivos.editar')

      // Curso pages (within periodo letivo)
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/visao-geral', [
          ShowCursoVisaoGeralPageController,
        ])
        .as('periodosLetivos.cursos.visaoGeral')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas', [ShowCursoTurmasPageController])
        .as('periodosLetivos.cursos.turmas')

      // Turma pages (within curso)
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/atividades', [
          ShowTurmaAtividadesPageController,
        ])
        .as('periodosLetivos.cursos.turmas.atividades')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/provas', [
          ShowTurmaProvasPageController,
        ])
        .as('periodosLetivos.cursos.turmas.provas')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/presencas', [
          ShowTurmaPresencasPageController,
        ])
        .as('periodosLetivos.cursos.turmas.presencas')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/notas', [
          ShowTurmaNotasPageController,
        ])
        .as('periodosLetivos.cursos.turmas.notas')
      router
        .get('/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/situacao', [
          ShowTurmaSituacaoPageController,
        ])
        .as('periodosLetivos.cursos.turmas.situacao')

      // Administrativo
      router.get('/administrativo/alunos', [ShowAlunosPageController]).as('administrativo.alunos')
      router
        .get('/administrativo/alunos/:id/editar', [ShowEditarAlunoPageController])
        .as('administrativo.alunos.editar')
      router
        .get('/administrativo/alunos/historico-financeiro', [ShowHistoricoFinanceiroPageController])
        .as('administrativo.alunos.historicoFinanceiro')
      router
        .get('/administrativo/funcionarios', [ShowFuncionariosPageController])
        .as('administrativo.funcionarios')
      router
        .get('/administrativo/professores', [ShowProfessoresPageController])
        .as('administrativo.professores')
      router
        .get('/administrativo/matriculas', [ShowMatriculasPageController])
        .as('administrativo.matriculas')
      router
        .get('/administrativo/matriculas/nova', [ShowNovaMatriculaPageController])
        .as('administrativo.matriculas.nova')
      router
        .get('/administrativo/contratos', [ShowContratosPageController])
        .as('administrativo.contratos')
      router
        .get('/administrativo/contratos/novo', [ShowNovoContratoPageController])
        .as('administrativo.contratos.novo')
      router
        .get('/administrativo/contratos/:id/editar', [ShowEditarContratoPageController])
        .as('administrativo.contratos.editar')
      router
        .get('/administrativo/contratos/:id/assinaturas', [ShowContratoAssinaturasPageController])
        .as('administrativo.contratos.assinaturas')
      router
        .get('/administrativo/contratos/:id/docuseal', [ShowContratoDocusealPageController])
        .as('administrativo.contratos.docuseal')
      router
        .get('/administrativo/contratos/:contractId/financeiro', [
          ShowContratoFinanceiroPageController,
        ])
        .as('administrativo.contratos.financeiro')
      router.get('/administrativo/bolsas', [ShowBolsasPageController]).as('administrativo.bolsas')
      router
        .get('/administrativo/parceiros', [ShowParceirosPageController])
        .as('administrativo.parceiros')
      router
        .get('/administrativo/materias', [ShowMateriasPageController])
        .as('administrativo.materias')
      router
        .get('/administrativo/folha-de-ponto', [ShowFolhaDePontoPageController])
        .as('administrativo.folhaDePonto')
      router
        .get('/administrativo/impressao', [ShowImpressaoPageController])
        .as('administrativo.impressao')
      router
        .get('/administrativo/solicitacoes-de-compra', [ShowSolicitacoesDeCompraPageController])
        .as('administrativo.solicitacoesDeCompra')

      // Notificacoes
      router.get('/notificacoes', [ShowNotificacoesPageController]).as('notificacoes')
      router
        .get('/notificacoes/preferencias', [ShowNotificacoesPreferenciasPageController])
        .as('notificacoes.preferencias')

      // Eventos
      router.get('/eventos', [ShowEventosPageController]).as('eventos')
      router.get('/eventos/novo', [ShowNovoEventoPageController]).as('eventos.novo')
      router.get('/eventos/:eventId/editar', [ShowEditarEventoPageController]).as('eventos.editar')
      router
        .get('/eventos/:eventId/autorizacoes', [ShowEventoAutorizacoesPageController])
        .as('eventos.autorizacoes')

      // Mural
      router.get('/mural', [ShowMuralPageController]).as('mural')

      // Desempenho Academico
      router.get('/desempenho', [ShowDesempenhoPageController]).as('desempenho')

      // Matriculas
      router.get('/matriculas', [ShowMatriculasPageController]).as('matriculas')

      // Pedagogico
      router.get('/pedagogico/turmas', [ShowTurmasPageController]).as('pedagogico.turmas')
      router.get('/pedagogico/grade', [ShowGradePageController]).as('pedagogico.grade')
      router.get('/pedagogico/horarios', [ShowHorariosPageController]).as('pedagogico.horarios')
      router.get('/pedagogico/quadro', [ShowQuadroPageController]).as('pedagogico.quadro')
      router
        .get('/pedagogico/ocorrencias', [ShowOcorrenciasPageController])
        .as('pedagogico.ocorrencias')
      router
        .get('/pedagogico/atividades', [ShowAtividadesPageController])
        .as('pedagogico.atividades')
      router
        .get('/pedagogico/atividades/:id', [ShowAtividadePageController])
        .as('pedagogico.atividades.show')
      router
        .get('/pedagogico/atividades/:id/editar', [ShowEditAtividadePageController])
        .as('pedagogico.atividades.edit')
      router.get('/pedagogico/provas', [ShowProvasPageController]).as('pedagogico.provas')
      router.get('/pedagogico/provas/:id', [ShowProvaPageController]).as('pedagogico.provas.show')
      router
        .get('/pedagogico/provas/:id/editar', [ShowEditProvaPageController])
        .as('pedagogico.provas.edit')
      router.get('/pedagogico/presenca', [ShowPresencaPageController]).as('pedagogico.presenca')
      router
        .get('/pedagogico/aulas-avulsas', [ShowAulasAvulsasPageController])
        .as('pedagogico.aulasAvulsas')
      router
        .get('/pedagogico/cursos-niveis', [ShowCursosNiveisPageController])
        .as('pedagogico.cursosNiveis')

      // Cantina
      router.get('/cantina/itens', [ShowCantinaItensPageController]).as('cantina.itens')
      router.get('/cantina/cardapio', [ShowCantinaCardapioPageController]).as('cantina.cardapio')
      router.get('/cantina/pdv', [ShowCantinaPdvPageController]).as('cantina.pdv')
      router.get('/cantina/pedidos', [ShowCantinaPedidosPageController]).as('cantina.pedidos')
      router.get('/cantina/vendas', [ShowCantinaVendasPageController]).as('cantina.vendas')
      router.get('/cantina/reservas', [ShowCantinaReservasPageController]).as('cantina.reservas')
      router
        .get('/cantina/transferencias', [ShowCantinaTransferenciasPageController])
        .as('cantina.transferencias')

      // Financeiro
      router
        .get('/financeiro/inadimplencia', [ShowInadimplenciaPageController])
        .as('financeiro.inadimplencia')
      router.get('/financeiro/seguros', [ShowSegurosPageController]).as('financeiro.seguros')
      router.get('/financeiro/faturas', [ShowFaturasPageController]).as('financeiro.faturas')

      // Lojas
      router.get('/lojas', [ShowLojasPageController]).as('lojas.index')
      router.get('/lojas/:id', [ShowLojaDetailPageController]).as('lojas.show')

      // Gamificacao
      router.get('/gamificacao', [ShowGamificacaoPageController]).as('gamificacao.index')
      router
        .get('/gamificacao/rankings', [ShowGamificacaoRankingsPageController])
        .as('gamificacao.rankings')
      router
        .get('/gamificacao/conquistas', [ShowGamificacaoConquistasPageController])
        .as('gamificacao.conquistas')
      router
        .get('/gamificacao/recompensas', [ShowGamificacaoRecompensasPageController])
        .as('gamificacao.recompensas')

      // Configuracoes
      router.get('/configuracoes', [ShowConfiguracoesPageController]).as('configuracoes')
    })
    .prefix('/escola')
    .use([middleware.auth(), middleware.impersonation(), middleware.requireSchool()])
    .as('escola')
}
