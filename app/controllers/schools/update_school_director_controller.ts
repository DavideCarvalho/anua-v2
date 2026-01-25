import type { HttpContext } from '@adonisjs/core/http'
import { v7 as uuidv7 } from 'uuid'
import db from '@adonisjs/lucid/services/db'
import School from '#models/school'
import User from '#models/user'
import Role from '#models/role'
import UserHasSchool from '#models/user_has_school'
import { updateDirectorValidator } from '#validators/school'

export default class UpdateSchoolDirectorController {
  async handle({ params, request, response }: HttpContext) {
    const schoolId = params.id

    const school = await School.find(schoolId)
    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    const data = await request.validateUsing(updateDirectorValidator)

    if (!data.existingUserId && !data.newDirector) {
      return response.badRequest({
        message: 'Informe um usuário existente ou dados para criar um novo diretor',
      })
    }

    // Buscar role de SCHOOL_DIRECTOR
    const directorRole = await Role.findBy('name', 'SCHOOL_DIRECTOR')
    if (!directorRole) {
      return response.internalServerError({
        message: 'Role de diretor não encontrada no sistema',
      })
    }

    // Remover diretor atual (mudar role para SCHOOL_ADMINISTRATIVE)
    const currentDirectorRelation = await UserHasSchool.query()
      .where('schoolId', schoolId)
      .preload('user', (userQuery) => {
        userQuery.preload('role')
      })
      .whereHas('user', (userQuery) => {
        userQuery.whereHas('role', (roleQuery) => {
          roleQuery.where('name', 'SCHOOL_DIRECTOR')
        })
      })
      .first()

    if (currentDirectorRelation?.user) {
      // Mudar role do diretor atual para SCHOOL_ADMINISTRATIVE
      const adminRole = await Role.findBy('name', 'SCHOOL_ADMINISTRATIVE')
      if (adminRole) {
        currentDirectorRelation.user.roleId = adminRole.id
        await currentDirectorRelation.user.save()
      }
    }

    let newDirectorUser: User

    if (data.existingUserId) {
      // Promover usuário existente a diretor
      const user = await User.find(data.existingUserId)
      if (!user) {
        return response.notFound({ message: 'Usuário não encontrado' })
      }

      // Verificar se usuário está vinculado à escola
      const userSchoolRelation = await UserHasSchool.query()
        .where('userId', user.id)
        .where('schoolId', schoolId)
        .first()

      if (!userSchoolRelation) {
        // Vincular usuário à escola
        await UserHasSchool.create({
          id: uuidv7(),
          userId: user.id,
          schoolId: schoolId,
          isDefault: true,
        })
      }

      // Atualizar role para SCHOOL_DIRECTOR
      user.roleId = directorRole.id
      await user.save()

      newDirectorUser = user
    } else if (data.newDirector) {
      // Verificar se já existe usuário com este email
      const existingUser = await User.findBy('email', data.newDirector.email)
      if (existingUser) {
        // Usuário já existe - usar ele como diretor
        const userSchoolRelation = await UserHasSchool.query()
          .where('userId', existingUser.id)
          .where('schoolId', schoolId)
          .first()

        if (!userSchoolRelation) {
          // Vincular usuário à escola
          await UserHasSchool.create({
            id: uuidv7(),
            userId: existingUser.id,
            schoolId: schoolId,
            isDefault: true,
          })
        }

        // Atualizar role para SCHOOL_DIRECTOR
        existingUser.roleId = directorRole.id
        await existingUser.save()

        newDirectorUser = existingUser
      } else {
        // Criar novo usuário
        const userId = uuidv7()
        const slug =
          data.newDirector.email.split('@')[0] ||
          data.newDirector.name.toLowerCase().replace(/\s+/g, '-')

        await db.rawQuery(
          `
        INSERT INTO "User" (
          id, name, slug, email, phone, "roleId", active, "whatsappContact", "grossSalary", "createdAt", "updatedAt"
        ) VALUES (
          :id, :name, :slug, :email, :phone, :roleId, true, false, 0, NOW(), NOW()
        )
        `,
          {
            id: userId,
            name: data.newDirector.name,
            slug: slug,
            email: data.newDirector.email,
            phone: data.newDirector.phone || null,
            roleId: directorRole.id,
          }
        )

        // Criar registro Teacher para o diretor
        await db.rawQuery(`INSERT INTO "Teacher" (id, "hourlyRate") VALUES (:id, 0)`, {
          id: userId,
        })

        // Vincular à escola
        await UserHasSchool.create({
          id: uuidv7(),
          userId: userId,
          schoolId: schoolId,
          isDefault: true,
        })

        newDirectorUser = (await User.find(userId))!
      }
    } else {
      return response.badRequest({ message: 'Dados inválidos' })
    }

    return response.ok({
      message: 'Diretor atualizado com sucesso',
      director: {
        id: newDirectorUser.id,
        name: newDirectorUser.name,
        email: newDirectorUser.email,
        phone: newDirectorUser.phone,
      },
    })
  }
}
