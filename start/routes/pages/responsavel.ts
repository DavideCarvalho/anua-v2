import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

export function registerResponsavelPageRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.pages.responsavel.ShowResponsavelDashboardPage]).as('dashboard')
      router.get('/notas', [controllers.pages.responsavel.ShowResponsavelNotasPage]).as('notas')
      router
        .get('/frequencia', [controllers.pages.responsavel.ShowResponsavelFrequenciaPage])
        .as('frequencia')
      router
        .get('/mensalidades', [controllers.pages.responsavel.ShowResponsavelMensalidadesPage])
        .as('mensalidades')
      router
        .get('/cantina', [controllers.pages.responsavel.ShowResponsavelCantinaPage])
        .as('cantina')
      router
        .get('/gamificacao', [controllers.pages.responsavel.ShowResponsavelGamificacaoPage])
        .as('gamificacao')
      router
        .get('/gamificacao/:studentId', [
          controllers.pages.responsavel.ShowResponsavelGamificacaoDetailsPage,
        ])
        .as('gamificacao.details')
      router
        .get('/comunicados', [controllers.pages.responsavel.ShowResponsavelComunicadosPage])
        .as('comunicados')
      router
        .get('/autorizacoes', [controllers.pages.responsavel.ShowResponsavelAutorizacoesPage])
        .as('autorizacoes')
      router
        .get('/atividades', [controllers.pages.responsavel.ShowResponsavelAtividadesPage])
        .as('atividades')
      router
        .get('/horario', [controllers.pages.responsavel.ShowResponsavelHorarioPage])
        .as('horario')
      router
        .get('/calendario', [controllers.pages.responsavel.ShowResponsavelCalendarioPage])
        .as('calendario')
      router
        .get('/documentos', [controllers.pages.responsavel.ShowResponsavelDocumentosPage])
        .as('documentos')
      router
        .get('/matricula/:id', [controllers.pages.responsavel.ShowResponsavelMatriculaPage])
        .as('matricula')
      router
        .get('/registro-diario', [controllers.pages.responsavel.ShowResponsavelOcorrenciasPage])
        .as('ocorrencias')
      router.get('/perfil', [controllers.pages.responsavel.ShowResponsavelPerfilPage]).as('perfil')
      router
        .get('/notificacoes', [controllers.pages.ShowResponsavelNotificacoesPage])
        .as('notificacoes')
      router.get('/credito', [controllers.pages.ShowResponsavelCreditoPage]).as('credito')
      router.get('/loja', [controllers.pages.responsavel.ShowResponsavelLojaPage]).as('loja')
      router
        .get('/loja/:id', [controllers.pages.responsavel.ShowResponsavelLojaStorePage])
        .as('loja.store')
      router.get('/chat', [controllers.pages.responsavel.ShowResponsavelPerguntasPage]).as('chat')
    })
    .prefix('/responsavel')
    .use([middleware.auth(), middleware.impersonation()])
    .as('responsavel')
}
