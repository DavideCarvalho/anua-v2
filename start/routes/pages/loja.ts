import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Loja (Store Owner) page controllers
const ShowLojaDashboardPageController = () =>
  import('#controllers/pages/loja/show_loja_dashboard_page_controller')
const ShowLojaProdutosPageController = () =>
  import('#controllers/pages/loja/show_loja_produtos_page_controller')
const ShowLojaPedidosPageController = () =>
  import('#controllers/pages/loja/show_loja_pedidos_page_controller')
const ShowLojaFinanceiroPageController = () =>
  import('#controllers/pages/loja/show_loja_financeiro_page_controller')

export function registerLojaPageRoutes() {
  router
    .group(() => {
      router.get('/', [ShowLojaDashboardPageController]).as('dashboard')
      router.get('/produtos', [ShowLojaProdutosPageController]).as('produtos')
      router.get('/pedidos', [ShowLojaPedidosPageController]).as('pedidos')
      router.get('/financeiro', [ShowLojaFinanceiroPageController]).as('financeiro')
    })
    .prefix('/loja')
    .use([middleware.auth(), middleware.storeOwner()])
    .as('loja')
}
