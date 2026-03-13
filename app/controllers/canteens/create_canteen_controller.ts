import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import User from '#models/user'
import Role from '#models/role'
import UserHasSchool from '#models/user_has_school'
import CanteenDto from '#models/dto/canteen.dto'
import { createCanteenValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class CreateCanteenController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const data = await request.validateUsing(createCanteenValidator)

    // Garante que exatamente um dos dois foi fornecido
    if (!data.responsibleUserId && !data.responsibleUser) {
      throw AppException.badRequest('Informe o responsável ou os dados para criar um novo')
    }
    if (data.responsibleUserId && data.responsibleUser) {
      throw AppException.badRequest('Informe apenas um: responsibleUserId ou responsibleUser')
    }

    if (!selectedSchoolIds?.includes(data.schoolId)) {
      throw AppException.forbidden('Sem permissão para criar cantina nesta escola')
    }

    const canteen = await db.transaction(async (trx) => {
      let responsibleUserId: string

      if (data.responsibleUser) {
        // Verifica email duplicado
        const existing = await User.findBy('email', data.responsibleUser.email)
        if (existing) {
          throw AppException.badRequest('Já existe um usuário com esse email')
        }

        // Busca role SCHOOL_CANTEEN
        const role = await Role.findByOrFail('name', 'SCHOOL_CANTEEN')

        // Gera slug a partir do nome
        const slug = data.responsibleUser.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        // Cria o usuário
        const newUser = await User.create(
          {
            name: data.responsibleUser.name,
            email: data.responsibleUser.email,
            slug,
            active: true,
            roleId: role.id,
          },
          { client: trx }
        )

        // Vincula à escola
        await UserHasSchool.create(
          {
            userId: newUser.id,
            schoolId: data.schoolId,
            isDefault: true,
          },
          { client: trx }
        )

        responsibleUserId = newUser.id
      } else {
        responsibleUserId = data.responsibleUserId!
      }

      const newCanteen = await Canteen.create(
        {
          name: data.name,
          schoolId: data.schoolId,
          responsibleUserId,
        },
        { client: trx }
      )

      return newCanteen
    })

    return response.created(new CanteenDto(canteen))
  }
}
