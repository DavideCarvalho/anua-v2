import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerLojaPageRoutes() {
  const loja = controllers.pages.loja

  router
    .group(() => {
      router.get('/', [loja.ShowLojaDashboardPage]).as('dashboard')
      router.get('/produtos', [loja.ShowLojaProdutosPage]).as('produtos')
      router.get('/pedidos', [loja.ShowLojaPedidosPage]).as('pedidos')
      router.get('/financeiro', [loja.ShowLojaFinanceiroPage]).as('financeiro')
    })
    .prefix('/loja')
    .use([middleware.auth(), middleware.storeOwner()])
    .as('loja')
}
