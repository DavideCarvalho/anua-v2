import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Responsavel Pages
const ShowResponsavelDashboardPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_dashboard_page_controller')
const ShowResponsavelNotasPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_notas_page_controller')
const ShowResponsavelFrequenciaPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_frequencia_page_controller')
const ShowResponsavelMensalidadesPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_mensalidades_page_controller')
const ShowResponsavelCantinaPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_cantina_page_controller')
const ShowResponsavelGamificacaoPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_gamificacao_page_controller')
const ShowResponsavelGamificacaoDetailsPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_gamificacao_details_page_controller')
const ShowResponsavelComunicadosPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_comunicados_page_controller')
const ShowResponsavelPerfilPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_perfil_page_controller')
const ShowResponsavelNotificacoesPageController = () =>
  import('#controllers/pages/show_responsavel_notificacoes_page_controller')
const ShowResponsavelCreditoPageController = () =>
  import('#controllers/pages/show_responsavel_credito_page_controller')
const ShowResponsavelAutorizacoesPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_autorizacoes_page_controller')
const ShowResponsavelAtividadesPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_atividades_page_controller')
const ShowResponsavelHorarioPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_horario_page_controller')
const ShowResponsavelDocumentosPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_documentos_page_controller')
const ShowResponsavelOcorrenciasPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_ocorrencias_page_controller')
const ShowResponsavelLojaPageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_loja_page_controller')
const ShowResponsavelLojaStorePageController = () =>
  import('#controllers/pages/responsavel/show_responsavel_loja_store_page_controller')

export function registerResponsavelPageRoutes() {
  router
    .group(() => {
      router.get('/', [ShowResponsavelDashboardPageController]).as('dashboard')
      router.get('/notas', [ShowResponsavelNotasPageController]).as('notas')
      router.get('/frequencia', [ShowResponsavelFrequenciaPageController]).as('frequencia')
      router.get('/mensalidades', [ShowResponsavelMensalidadesPageController]).as('mensalidades')
      router.get('/cantina', [ShowResponsavelCantinaPageController]).as('cantina')
      router.get('/gamificacao', [ShowResponsavelGamificacaoPageController]).as('gamificacao')
      router
        .get('/gamificacao/:studentId', [ShowResponsavelGamificacaoDetailsPageController])
        .as('gamificacao.details')
      router.get('/comunicados', [ShowResponsavelComunicadosPageController]).as('comunicados')
      router.get('/autorizacoes', [ShowResponsavelAutorizacoesPageController]).as('autorizacoes')
      router.get('/atividades', [ShowResponsavelAtividadesPageController]).as('atividades')
      router.get('/horario', [ShowResponsavelHorarioPageController]).as('horario')
      router.get('/documentos', [ShowResponsavelDocumentosPageController]).as('documentos')
      router.get('/registro-diario', [ShowResponsavelOcorrenciasPageController]).as('ocorrencias')
      router.get('/perfil', [ShowResponsavelPerfilPageController]).as('perfil')
      router.get('/notificacoes', [ShowResponsavelNotificacoesPageController]).as('notificacoes')
      router.get('/credito', [ShowResponsavelCreditoPageController]).as('credito')
      router.get('/loja', [ShowResponsavelLojaPageController]).as('loja')
      router.get('/loja/:id', [ShowResponsavelLojaStorePageController]).as('loja.store')
    })
    .prefix('/responsavel')
    .use([middleware.auth(), middleware.impersonation()])
    .as('responsavel')
}
