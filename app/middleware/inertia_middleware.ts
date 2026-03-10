import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import type { PageProps } from '@adonisjs/inertia/types'
import UserDto from '#models/dto/user.dto'
import School from '#models/school'
import Student from '#models/student'
import StudentAvatar from '#models/student_avatar'
import StudentGamification from '#models/student_gamification'

const GAMIFIED_AGE_THRESHOLD = 14

function isGamifiedStudent(user: {
  id: string
  birthDate?: string | null
  role?: { name: string } | null
}): boolean {
  if (user.role?.name !== 'STUDENT') return false
  if (!user.birthDate) return false
  const birthDate = DateTime.fromISO(String(user.birthDate))
  if (!birthDate.isValid) return false
  const age = Math.floor(DateTime.now().diff(birthDate, 'years').years)
  return age <= GAMIFIED_AGE_THRESHOLD
}

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    const { session, auth } = ctx

    // auth pode ser undefined quando o erro ocorre antes do auth middleware (ex: ao renderizar página de erro 500)
    if (!auth) {
      return {
        errors: this.getValidationErrors(ctx),
        flash: {
          error: session?.flashMessages?.get('error'),
          success: session?.flashMessages?.get('success'),
        },
        user: null,
        userSchools: [],
        selectedSchoolIds: [],
      } as PageProps
    }

    await auth.check()
    const user =
      (ctx as HttpContext & { effectiveUser?: typeof auth.user }).effectiveUser ?? auth.user
    let userDto = null
    if (user) {
      await user.load('role')
      const firstSelectedSchoolId = (ctx as HttpContext & { selectedSchoolIds?: string[] })
        .selectedSchoolIds?.[0]
      if (!user.$preloaded.school && firstSelectedSchoolId) {
        const school = await School.find(firstSelectedSchoolId)
        if (school) {
          user.$setRelated('school', school)
          user.schoolId = firstSelectedSchoolId
        }
      } else if (!user.$preloaded.school && user.schoolId) {
        await user.load('school')
      }
      userDto = new UserDto(user)
    }

    const userSchools = (ctx as HttpContext & { userSchools?: unknown[] }).userSchools ?? []
    const selectedSchoolIds =
      (ctx as HttpContext & { selectedSchoolIds?: string[] }).selectedSchoolIds ?? []

    let gamified = false
    let gamificationData: { totalPoints: number; currentLevel: number } | null = null
    let avatarData: {
      skinTone: string
      hairStyle: string
      hairColor: string
      outfit: string
      accessories: string[]
    } | null = null
    const path = ctx.request.url()
    if (path.includes('/aluno') && userDto?.role?.name === 'STUDENT') {
      const student = await Student.find(userDto.id)
      if (student) {
        await student.load('user')
        const bd = student.user?.birthDate
        gamified = isGamifiedStudent({
          id: student.id,
          birthDate: bd instanceof DateTime ? bd.toISO() : bd,
          role: userDto.role,
        })
        if (gamified) {
          const [gamification, avatar] = await Promise.all([
            StudentGamification.query().where('studentId', student.id).first(),
            StudentAvatar.query().where('studentId', student.id).first(),
          ])
          if (gamification) {
            gamificationData = {
              totalPoints: gamification.totalPoints,
              currentLevel: gamification.currentLevel,
            }
          }
          if (avatar) {
            avatarData = {
              skinTone: avatar.skinTone,
              hairStyle: avatar.hairStyle,
              hairColor: avatar.hairColor,
              outfit: avatar.outfit,
              accessories: avatar.accessories ?? [],
            }
          } else {
            avatarData = {
              skinTone: 'medium',
              hairStyle: 'default',
              hairColor: 'brown',
              outfit: 'default',
              accessories: [],
            }
          }
        }
      }
    }

    return {
      errors: this.getValidationErrors(ctx),
      flash: {
        error: session?.flashMessages.get('error'),
        success: session?.flashMessages.get('success'),
      },
      user: userDto ? (userDto as unknown as Record<string, unknown>) : null,
      userSchools: userSchools as unknown[],
      selectedSchoolIds,
      gamified,
      gamificationData,
      avatarData,
    } as PageProps
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)
    const output = await next()
    this.dispose(ctx)
    return output
  }
}

declare module '@adonisjs/inertia/types' {
  export interface SharedProps {
    errors: Record<string, string>
    flash: { error?: string; success?: string }
    user: InstanceType<typeof UserDto> | null
    userSchools: unknown[]
    selectedSchoolIds: string[]
    gamified?: boolean
    gamificationData?: { totalPoints: number; currentLevel: number } | null
    avatarData?: {
      skinTone: string
      hairStyle: string
      hairColor: string
      outfit: string
      accessories: string[]
    } | null
  }
}
