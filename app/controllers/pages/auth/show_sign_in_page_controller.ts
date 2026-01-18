import type { HttpContext } from '@adonisjs/core/http'

export default class ShowSignInPageController {
  async handle({ inertia, auth, response }: HttpContext) {
    // If already logged in, redirect to dashboard
    const isAuthenticated = await auth.check()
    if (isAuthenticated) {
      return response.redirect('/dashboard')
    }

    return inertia.render('auth/sign-in')
  }
}
