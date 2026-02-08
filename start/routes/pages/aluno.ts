import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Aluno (Student) page controllers
const ShowAlunoLojaPageController = () =>
  import('#controllers/pages/aluno/show_aluno_loja_page_controller')
const ShowAlunoLojaStorePageController = () =>
  import('#controllers/pages/aluno/show_aluno_loja_store_page_controller')
const ShowAlunoCarrinhoPageController = () =>
  import('#controllers/pages/aluno/show_aluno_carrinho_page_controller')
const ShowAlunoPedidosPageController = () =>
  import('#controllers/pages/aluno/show_aluno_pedidos_page_controller')

export function registerAlunoPageRoutes() {
  router
    .group(() => {
      router.get('/loja', [ShowAlunoLojaPageController]).as('loja.index')
      router.get('/loja/carrinho', [ShowAlunoCarrinhoPageController]).as('loja.carrinho')
      router.get('/loja/pedidos', [ShowAlunoPedidosPageController]).as('loja.pedidos')
      router.get('/loja/:id', [ShowAlunoLojaStorePageController]).as('loja.store')
    })
    .prefix('/aluno')
    .use([middleware.auth()])
    .as('aluno')
}
