import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Auth Pages
const ShowSignInPageController = () =>
  import('#controllers/pages/auth/show_sign_in_page_controller')

// Public Pages
const ShowMatriculaOnlinePageController = () =>
  import('#controllers/pages/show_matricula_online_page_controller')

// Dashboard Pages
const ShowDashboardPageController = () =>
  import('#controllers/pages/show_dashboard_page_controller')

export function registerPublicPageRoutes() {
  // Public home
  router.on('/').renderInertia('home').as('home')

  // Public enrollment page
  router
    .get('/:schoolSlug/matricula-online/:academicPeriodSlug/:courseSlug', [
      ShowMatriculaOnlinePageController,
    ])
    .as('matriculaOnline')

  // Auth pages
  router.get('/sign-in', [ShowSignInPageController]).as('auth.signIn')
  router.get('/login', [ShowSignInPageController]).as('auth.login') // Alias

  // Dashboard router (redirects based on role)
  router
    .get('/dashboard', [ShowDashboardPageController])
    .use([middleware.auth(), middleware.impersonation()])
    .as('dashboard')
}
