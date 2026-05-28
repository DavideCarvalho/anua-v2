import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAlunoPageRoutes() {
  const aluno = controllers.pages.aluno

  router
    .group(() => {
      router.get('/', [aluno.ShowAlunoDashboardPage]).as('dashboard')
      router.get('/loja', [aluno.ShowAlunoLojaPage]).as('loja.index')
      router.get('/loja/carrinho', [aluno.ShowAlunoCarrinhoPage]).as('loja.carrinho')
      router.get('/loja/pedidos', [aluno.ShowAlunoPedidosPage]).as('loja.pedidos')
      router.get('/loja/pontos', [aluno.ShowAlunoLojaPontosPage]).as('loja.pontos')
      router.get('/idle', [aluno.ShowAlunoIdlePage]).as('idle')
      router.get('/jogo', [aluno.ShowAlunoJogoPage]).as('jogo')
      router.get('/loja/:id', [aluno.ShowAlunoLojaStorePage]).as('loja.store')
      router
        .get('/financeiro', [aluno.ShowAlunoFinanceiroPage])
        .as('financeiro')
        .use(middleware.requireSelfResponsible())
      router
        .get('/documentos', [aluno.ShowAlunoDocumentosPage])
        .as('documentos')
        .use(middleware.requireSelfResponsible())
      router
        .get('/autorizacoes', [aluno.ShowAlunoAutorizacoesPage])
        .as('autorizacoes')
        .use(middleware.requireSelfResponsible())
      router
        .get('/comunicados', [aluno.ShowAlunoComunicadosPage])
        .as('comunicados')
        .use(middleware.requireSelfResponsible())
      router
        .get('/matricula', [aluno.ShowAlunoMatriculaPage])
        .as('matricula')
        .use(middleware.requireSelfResponsible())
    })
    .prefix('/aluno')
    .use([middleware.auth(), middleware.impersonation()])
    .as('aluno')
}
