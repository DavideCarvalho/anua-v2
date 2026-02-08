import router from '@adonisjs/core/services/router'
import { registerPublicPageRoutes } from './public.js'
import { registerEscolaPageRoutes } from './escola.js'
import { registerResponsavelPageRoutes } from './responsavel.js'
import { registerAdminPageRoutes } from './admin.js'
import { registerLojaPageRoutes } from './loja.js'
import { registerAlunoPageRoutes } from './aluno.js'

export function registerPageRoutes() {
  router
    .group(() => {
      registerPublicPageRoutes()
      registerEscolaPageRoutes()
      registerResponsavelPageRoutes()
      registerAdminPageRoutes()
      registerLojaPageRoutes()
      registerAlunoPageRoutes()
    })
    .as('web')
}
