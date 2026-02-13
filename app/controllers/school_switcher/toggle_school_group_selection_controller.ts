import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchoolGroup from '#models/user_has_school_group'
import UserSchoolGroupSelection from '#models/user_school_group_selection'
import { toggleSchoolGroupSelectionValidator } from '#validators/school_switcher'
import AppException from '#exceptions/app_exception'

export default class ToggleSchoolGroupSelectionController {
  async handle(ctx: HttpContext) {
    const { auth, request, response } = ctx
    // Use effectiveUser when impersonating, otherwise use auth.user
    const user = ctx.effectiveUser || auth.user!
    const data = await request.validateUsing(toggleSchoolGroupSelectionValidator)

    // Verify user has access to this school group
    const userHasSchoolGroup = await UserHasSchoolGroup.query()
      .where('userId', user.id)
      .where('schoolGroupId', data.schoolGroupId)
      .first()

    if (!userHasSchoolGroup) {
      throw AppException.forbidden('Você não tem acesso a este grupo')
    }

    // Check if already selected
    const existingSelection = await UserSchoolGroupSelection.query()
      .where('userId', user.id)
      .where('schoolGroupId', data.schoolGroupId)
      .first()

    if (existingSelection) {
      // Unselect
      await existingSelection.delete()
      return response.ok({ selected: false, message: 'Grupo removido da seleção' })
    } else {
      // Select
      await UserSchoolGroupSelection.create({
        userId: user.id,
        schoolGroupId: data.schoolGroupId,
      })
      return response.ok({ selected: true, message: 'Grupo adicionado à seleção' })
    }
  }
}
