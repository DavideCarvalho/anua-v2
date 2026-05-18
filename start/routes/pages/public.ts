import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerPublicPageRoutes() {
  // Public home
  router.on('/').renderInertia('home', {}).as('home')

  // Public enrollment page
  router
    .get('/:schoolSlug/matricula-online/:academicPeriodSlug/:courseSlug', [
      controllers.pages.ShowMatriculaOnlinePage,
    ])
    .as('matriculaOnline')

  // External redirects
  router
    .get('/agendar', async ({ response }) => {
      return response.redirect('https://cal.com/davi-de-carvalho-ylsmtp/introducao-anua')
    })
    .as('agendar')

  // Auth pages
  router.get('/sign-in', [controllers.pages.auth.ShowSignInPage]).as('auth.signIn')
  router.get('/login', [controllers.pages.auth.ShowSignInPage]).as('auth.login') // Alias

  // Dashboard router (redirects based on role)
  router
    .get('/dashboard', [controllers.pages.ShowDashboardPage])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard')
}
