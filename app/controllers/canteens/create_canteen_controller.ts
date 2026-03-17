import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import User from '#models/user'
import Role from '#models/role'
import UserHasSchool from '#models/user_has_school'
import { createCanteenValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'
import CanteenTransformer from '#transformers/canteen_transformer'

export default class CreateCanteenController {
  async handle({ request, response, selectedSchoolIds, serialize }: HttpContext) {
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
        // Verifica email duplicado (dentro da transaction para evitar race condition)
        const existing = await User.query({ client: trx })
          .where('email', data.responsibleUser.email)
          .first()
        if (existing) {
          throw AppException.badRequest('Já existe um usuário com esse email')
        }

        // Busca role SCHOOL_CANTEEN
        const role = await Role.findByOrFail('name', 'SCHOOL_CANTEEN')

        // Gera slug a partir do nome (com sufixo aleatório para evitar colisões)
        const baseSlug = data.responsibleUser.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`

        // Cria o usuário
        const newUser = await User.create(
          {
            name: data.responsibleUser.name,
            email: data.responsibleUser.email,
            slug,
            active: true,
            roleId: role.id,
            schoolId: data.schoolId,
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
        // Valida que o usuário existe e pertence à escola
        const responsible = await User.query({ client: trx })
          .where('id', data.responsibleUserId!)
          .whereNull('deletedAt')
          .first()
        if (!responsible) {
          throw AppException.notFound('Responsável não encontrado')
        }

        const hasSchool = await UserHasSchool.query({ client: trx })
          .where('userId', data.responsibleUserId!)
          .where('schoolId', data.schoolId)
          .first()
        if (!hasSchool) {
          throw AppException.forbidden('Responsável não pertence a esta escola')
        }

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

    return response.created(await serialize(CanteenTransformer.transform(canteen)))
  }
}
