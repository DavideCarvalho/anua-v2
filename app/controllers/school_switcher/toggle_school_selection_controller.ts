import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchool from '#models/user_has_school'
import UserSchoolSelection from '#models/user_school_selection'
import { toggleSchoolSelectionValidator } from '#validators/school_switcher'
import AppException from '#exceptions/app_exception'

export default class ToggleSchoolSelectionController {
  async handle(ctx: HttpContext) {
    const { auth, request, response } = ctx
    // Use effectiveUser when impersonating, otherwise use auth.user
    const user = ctx.effectiveUser || auth.user!
    const data = await request.validateUsing(toggleSchoolSelectionValidator)

    // Verify user has access to this school
    const userHasSchool = await UserHasSchool.query()
      .where('userId', user.id)
      .where('schoolId', data.schoolId)
      .first()

    if (!userHasSchool) {
      throw AppException.forbidden('Você não tem acesso a esta escola')
    }

    // Check if already selected
    const existingSelection = await UserSchoolSelection.query()
      .where('userId', user.id)
      .where('schoolId', data.schoolId)
      .first()

    if (existingSelection) {
      // Unselect
      await existingSelection.delete()
      return response.ok({ selected: false, message: 'Escola removida da seleção' })
    } else {
      // Select
      await UserSchoolSelection.create({
        userId: user.id,
        schoolId: data.schoolId,
      })
      return response.ok({ selected: true, message: 'Escola adicionada à seleção' })
    }
  }
}
